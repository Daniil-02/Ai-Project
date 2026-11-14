"use server";

import { revalidatePath } from "next/cache";
import { isAccessDenied, type ActionResult } from "@/lib/action-result";
import { aiLimits, CACHE_TTL_SECONDS, MODEL_TIMEOUT_MS } from "@/lib/ai/limits";
import {
  askModel,
  modelConfigured,
  ModelNotConfiguredError,
  ModelTimeoutError,
  ModelUnavailableError,
} from "@/lib/ai/model";
import {
  buildCacheKey,
  buildUserMessage,
  checkTacticsReply,
  NOTE_MAX,
  normalizeNote,
  SYSTEM_PROMPT,
  TACTICS_SCHEMA,
  type RaidTactics,
} from "@/lib/ai/raid-tactics";
import { currentUserId } from "@/lib/auth";
import { appCallsToday, countMyCallsSince, readCache, recordCall, writeCache } from "@/lib/data/db/ai-guard";
import { getEventWithSquads, updateEventAiTactics } from "@/lib/data/db/events";

const UNAVAILABLE = "Генерація тактики зараз недоступна. Складіть план рейду вручну або спробуйте пізніше.";

export async function generateTacticsAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб згенерувати тактику рейду." };
  }

  const eventId = String(formData.get("eventId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!eventId || !note) {
    return { status: 400, message: "Введіть нотатку для тактичного плану.", fieldErrors: { note: "Нотатка обов'язкова." } };
  }
  if (note.length > NOTE_MAX) {
    return {
      status: 400,
      message: "Перевірте поля форми.",
      fieldErrors: { note: `Нотатка не повинна перевищувати ${NOTE_MAX} символів.` },
    };
  }

  const data = await getEventWithSquads(eventId);
  if (!data) {
    return { status: 404, message: "Подію не знайдено." };
  }

  if (!modelConfigured()) {
    return { status: 503, message: UNAVAILABLE };
  }

  const squadText =
    data.mainSquad.length > 0
      ? data.mainSquad.map((m, i) => `${i + 1}. ${m.nickname} (${m.role})`).join(", ")
      : "Склад ще формується";

  const userMessage = buildUserMessage(data.event.title, data.event.tier, data.event.maxSlots, squadText, note);
  const normalizedMsg = buildUserMessage(
    data.event.title,
    data.event.tier,
    data.event.maxSlots,
    squadText,
    normalizeNote(note),
  );
  const key = buildCacheKey(normalizedMsg);

  let validTactics: RaidTactics | null = null;
  const cachedReply = await readCache(key);
  if (cachedReply) {
    const checked = checkTacticsReply(cachedReply, data.event.maxSlots);
    if (checked.ok) {
      validTactics = checked.value;
      await recordCall(true);
    }
  }

  if (!validTactics) {
    const limits = aiLimits();
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    if (limits.perUserPerHour <= 0 || (await countMyCallsSince(hourAgo)) >= limits.perUserPerHour) {
      return {
        status: 429,
        message: `Досягнуто ліміт: не більше ${limits.perUserPerHour} генерацій тактики на годину. Спробуйте пізніше.`,
      };
    }
    if (limits.appPerDay <= 0 || (await appCallsToday()) >= limits.appPerDay) {
      return {
        status: 429,
        message: "Денний ліміт викликів моделі для застосунку вичерпано. Спробуйте завтра.",
      };
    }

    for (let attempt = 1; attempt <= 2 && !validTactics; attempt++) {
      try {
        await recordCall(false);
        const reply = await askModel({
          system: SYSTEM_PROMPT,
          user: userMessage,
          jsonSchema: TACTICS_SCHEMA,
          timeoutMs: MODEL_TIMEOUT_MS,
        });
        const checked = checkTacticsReply(reply.text, data.event.maxSlots);
        if (checked.ok) {
          validTactics = checked.value;
          await writeCache(key, reply.text, CACHE_TTL_SECONDS);
        }
      } catch (error) {
        if (error instanceof ModelTimeoutError) {
          return { status: 503, message: "Модель не відповіла вчасно. " + UNAVAILABLE };
        }
        if (error instanceof ModelUnavailableError || error instanceof ModelNotConfiguredError) {
          return { status: 503, message: "Сервіс моделі недоступний. " + UNAVAILABLE };
        }
        throw error;
      }
    }
  }

  if (!validTactics) {
    return { status: 503, message: "Модель повернула відповідь у невірному форматі. " + UNAVAILABLE };
  }

  const formattedTactics = [
    `Загальний план: ${validTactics.summary}`,
    `Танки: ${validTactics.tanks}`,
    `Хілери: ${validTactics.healers}`,
    `ДПС: ${validTactics.dps}`,
    `Пріоритетний слот підтримки: №${validTactics.prioritySlot}`,
  ].join("\n");

  try {
    const updated = await updateEventAiTactics(eventId, formattedTactics);
    if (!updated) {
      return { status: 403, message: "Оновлювати тактику може лише офіцер — власник події." };
    }
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Оновлювати тактику може лише офіцер — власник події." };
    }
    throw error;
  }

  revalidatePath(`/events/${eventId}`);
  return { status: 200, message: "Тактичний план рейду згенеровано та збережено." };
}
