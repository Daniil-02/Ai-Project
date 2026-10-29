import type { CombatRole, MemberRank } from "./members";

export type EventStatus = "Набір відкрито" | "Завершено";
export type RegistrationStatus = "Основний склад" | "Резерв";

export interface EventRegistration {
  id: string;
  eventId: string;
  nickname: string;
  role: CombatRole;
  rank: MemberRank;
  status: RegistrationStatus;
}

export interface GuildEvent {
  id: string;
  title: string;
  dateTime: string;
  maxSlots: number;
  description: string;
  status: EventStatus;
  tier: string;
  mainCount: number;
  registrations: EventRegistration[];
}

export interface EventWithSquads {
  event: GuildEvent;
  mainSquad: EventRegistration[];
  reserveSquad: EventRegistration[];
}

export interface CreateEventInput {
  title: string;
  dateTime: string;
  maxSlots: number;
  description: string;
}

export {
  listEvents,
  getEventById,
  getEventWithSquads,
  createEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  toggleRegistrationStatus,
  closeEventRecruitment,
} from "./db/events";
