import { db } from "./client";
import type {
  CreateEventInput,
  EventRegistration,
  EventStatus,
  EventWithSquads,
  GuildEvent,
  RegistrationStatus,
} from "@/lib/data/events";
import type { CombatRole } from "@/lib/data/members";

type EventRow = {
  id: string;
  title: string;
  date_time: string;
  description: string;
  max_slots: number;
  status: string;
  tier: string;
};

type RegRow = {
  event_id: string;
  profile_id: string;
  combat_role: string;
  slot_status: string;
  profiles?: {
    nickname: string;
    rank: string;
  };
};

function toEvent(row: EventRow, regs: EventRegistration[] = []): GuildEvent {
  const mainCount = regs.filter((r) => r.status === "Основний склад").length;
  return {
    id: row.id,
    title: row.title,
    dateTime: row.date_time,
    description: row.description || "",
    maxSlots: row.max_slots,
    status: row.status as EventStatus,
    tier: row.tier,
    mainCount,
    registrations: regs,
  };
}

export async function listEvents(statusFilter?: string): Promise<GuildEvent[]> {
  let query = db().from("events").select("*");
  if (statusFilter && statusFilter !== "Усі") {
    query = query.eq("status", statusFilter);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as EventRow[]).map((r) => toEvent(r, []));
}

export async function getEventById(id: string): Promise<GuildEvent | null> {
  const { data: evRow, error: evErr } = await db()
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (evErr) throw new Error(evErr.message);
  if (!evRow) return null;

  const { data: regRows, error: regErr } = await db()
    .from("event_registrations")
    .select("event_id, profile_id, combat_role, slot_status, profiles(nickname, rank)")
    .eq("event_id", id);
  if (regErr) throw new Error(regErr.message);

  const regs: EventRegistration[] = ((regRows as unknown as RegRow[]) || []).map((r) => ({
    id: `${r.event_id}-${r.profile_id}`,
    eventId: r.event_id,
    nickname: r.profiles?.nickname || "Гість",
    role: r.combat_role as CombatRole,
    rank: r.profiles?.rank || "Учасник",
    status: r.slot_status as RegistrationStatus,
  }));

  return toEvent(evRow as EventRow, regs);
}

export async function getEventWithSquads(id: string): Promise<EventWithSquads | null> {
  const event = await getEventById(id);
  if (!event) return null;
  return {
    event,
    mainSquad: event.registrations.filter((r) => r.status === "Основний склад"),
    reserveSquad: event.registrations.filter((r) => r.status === "Резерв"),
  };
}

export async function createEvent(input: CreateEventInput): Promise<GuildEvent> {
  const cleanTitle = input.title.trim();
  if (!cleanTitle || input.maxSlots < 1) {
    throw new Error("Назва події обов'язкова, а ліміт місць має бути не менше 1");
  }

  const { data, error } = await db()
    .from("events")
    .insert({
      title: cleanTitle,
      date_time: input.dateTime.trim() || "Невдовзі · 20:00",
      description: input.description.trim() || "",
      max_slots: Number(input.maxSlots),
      status: "Набір відкрито",
      tier: "Рейд · Міфічний",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toEvent(data as EventRow, []);
}

export async function deleteEvent(id: string): Promise<boolean> {
  const { data, error } = await db().from("events").delete().eq("id", id).select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function registerForEvent(
  eventId: string,
  nickname: string,
  role: CombatRole
): Promise<EventRegistration> {
  const ev = await getEventById(eventId);
  if (!ev) throw new Error("Подію не знайдено");
  if (ev.status === "Завершено") throw new Error("Набір завершено");

  const cleanNick = nickname.trim();
  if (!cleanNick) throw new Error("Нікнейм обов'язковий");

  let { data: profile } = await db()
    .from("profiles")
    .select("id, nickname, rank")
    .eq("nickname", cleanNick)
    .maybeSingle();

  if (!profile) {
    const { data: newProf, error: profErr } = await db()
      .from("profiles")
      .insert({
        nickname: cleanNick,
        character_class: "Вартовий",
        role,
        rank: "Учасник",
        active_status: "Онлайн",
      })
      .select("id, nickname, rank")
      .single();
    if (profErr) throw new Error(profErr.message);
    profile = newProf;
  }

  const mainCount = ev.registrations.filter((r) => r.status === "Основний склад").length;
  const slotStatus: RegistrationStatus =
    mainCount < ev.maxSlots ? "Основний склад" : "Резерв";

  const { error: regErr } = await db().from("event_registrations").insert({
    event_id: eventId,
    profile_id: profile.id,
    combat_role: role,
    slot_status: slotStatus,
  });

  if (regErr && !regErr.message.includes("duplicate")) {
    throw new Error(regErr.message);
  }

  return {
    id: `${eventId}-${profile.id}`,
    eventId,
    nickname: cleanNick,
    role,
    rank: profile.rank,
    status: slotStatus,
  };
}

export async function cancelRegistration(
  eventId: string,
  nickname: string
): Promise<boolean> {
  const { data: profile } = await db()
    .from("profiles")
    .select("id")
    .eq("nickname", nickname.trim())
    .maybeSingle();
  if (!profile) return false;

  const { data, error } = await db()
    .from("event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("profile_id", profile.id)
    .select("event_id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function toggleRegistrationStatus(
  eventId: string,
  nickname: string
): Promise<boolean> {
  const { data: profile } = await db()
    .from("profiles")
    .select("id")
    .eq("nickname", nickname.trim())
    .maybeSingle();
  if (!profile) return false;

  const { data: reg } = await db()
    .from("event_registrations")
    .select("slot_status")
    .eq("event_id", eventId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!reg) return false;
  const newStatus =
    reg.slot_status === "Основний склад" ? "Резерв" : "Основний склад";

  const { data, error } = await db()
    .from("event_registrations")
    .update({ slot_status: newStatus })
    .eq("event_id", eventId)
    .eq("profile_id", profile.id)
    .select("event_id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function closeEventRecruitment(eventId: string): Promise<boolean> {
  const { data, error } = await db()
    .from("events")
    .update({ status: "Завершено" })
    .eq("id", eventId)
    .select("id");
  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}
