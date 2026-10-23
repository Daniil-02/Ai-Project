import type {
  CreateEventInput,
  EventRegistration,
  EventWithSquads,
  GuildEvent,
} from "@/lib/data/events";
import type { CombatRole } from "@/lib/data/members";

// ЗАГЛУШКА: реалізація на кроці 13
export async function listEvents(_statusFilter?: string): Promise<GuildEvent[]> {
  return [];
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function getEventById(_id: string): Promise<GuildEvent | null> {
  return null;
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function getEventWithSquads(_id: string): Promise<EventWithSquads | null> {
  return null;
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function createEvent(input: CreateEventInput): Promise<GuildEvent> {
  return {
    id: "",
    title: input.title,
    dateTime: input.dateTime,
    description: input.description,
    maxSlots: input.maxSlots,
    status: "Набір відкрито",
    tier: "Рейд · Міфічний",
    mainCount: 0,
    registrations: [],
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function deleteEvent(_id: string): Promise<void> {}

// ЗАГЛУШКА: реалізація на кроці 13
export async function registerForEvent(
  _eventId: string,
  _nickname: string,
  _role: CombatRole
): Promise<EventRegistration> {
  return {
    id: "",
    eventId: "",
    nickname: "",
    role: "Танк",
    rank: "Учасник",
    status: "Основний склад",
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function cancelRegistration(
  _eventId: string,
  _nickname: string
): Promise<void> {}

// ЗАГЛУШКА: реалізація на кроці 13
export async function toggleRegistrationStatus(
  _eventId: string,
  _nickname: string
): Promise<void> {}

// ЗАГЛУШКА: реалізація на кроці 13
export async function closeEventRecruitment(_eventId: string): Promise<void> {}
