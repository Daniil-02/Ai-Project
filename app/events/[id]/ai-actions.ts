"use server";

// Наївна версія функції на базі моделі: генерація тактичного плану рейду (ПР 6, крок 4).
import { revalidatePath } from "next/cache";
import { isAccessDenied, type ActionResult } from "@/lib/action-result";
import { askModel } from "@/lib/ai/model";
import { currentUserId } from "@/lib/auth";
import { getEventWithSquads, updateEventAiTactics } from "@/lib/data/db/events";

export async function generateTacticsAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб згенерувати тактику рейду." };
  }

  const eventId = String(formData.get("eventId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!eventId || !note) {
    return { status: 400, message: "Введіть нотатку для тактичного плану.", fieldErrors: { note: "Нотатка обов'язкова." } };
  }

  const data = await getEventWithSquads(eventId);
  if (!data) {
    return { status: 404, message: "Подію не знайдено." };
  }

  const squadText =
    data.mainSquad.length > 0
      ? data.mainSquad.map((m, i) => `${i + 1}. ${m.nickname} (${m.role})`).join(", ")
      : "Склад ще формується";

  const prompt = [
    `Ти тактик ігрової гільдії Shadow Vanguard. Склади короткий тактичний план для рейду "${data.event.title}" (${data.event.tier}).`,
    `Склад загону: ${squadText}.`,
    `Побажання офіцера: ${note}`,
    `Поверни відповідь строго у форматі JSON без markdown: {"summary": "загальний план", "tanks": "задача танків", "healers": "задача хілерів", "dps": "задача ДПС"}`,
  ].join("\n");

  const reply = await askModel({
    system: "",
    user: prompt,
  });

  const cleanJson = reply.text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleanJson) as {
    summary: string;
    tanks: string;
    healers: string;
    dps: string;
  };

  const formattedTactics = [
    `Загальний план: ${parsed.summary}`,
    `Танки: ${parsed.tanks}`,
    `Хілери: ${parsed.healers}`,
    `ДПС: ${parsed.dps}`,
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
