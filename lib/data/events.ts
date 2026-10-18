import { withMockMode } from "./mock-mode";
import type { CombatRole } from "./members";

export type EventStatus = "Набір відкрито" | "Завершено";
export type RegistrationStatus = "Основний склад" | "Резерв";

export type EventRegistration = {
  id: string;
  eventId: string;
  nickname: string;
  role: CombatRole;
  rank: string;
  status: RegistrationStatus;
};

export type GuildEvent = {
  id: string;
  title: string;
  dateTime: string;
  description: string;
  maxSlots: number;
  status: EventStatus;
  tier: string;
  registrations: EventRegistration[];
};

export type CreateEventInput = {
  title: string;
  dateTime: string;
  description: string;
  maxSlots: number;
};

const eventsStore: GuildEvent[] = [
  {
    id: "1",
    title: "Цитадель Попелу",
    dateTime: "Сьогодні · 20:00",
    description:
      "Вирушаємо до Цитаделі Попелу за рідкісними трофеями. Перевірте спорядження та приходьте за 10 хвилин до початку.",
    maxSlots: 3,
    status: "Набір відкрито",
    tier: "Рейд · Міфічний",
    registrations: [
      {
        id: "r1",
        eventId: "1",
        nickname: "Nightwarden",
        role: "Танк",
        rank: "Офіцер",
        status: "Основний склад",
      },
      {
        id: "r2",
        eventId: "1",
        nickname: "Lunaria",
        role: "Хілер",
        rank: "Офіцер",
        status: "Основний склад",
      },
      {
        id: "r3",
        eventId: "1",
        nickname: "Ashbringer",
        role: "ДПС",
        rank: "Учасник",
        status: "Резерв",
      },
    ],
  },
  {
    id: "2",
    title: "Безодня Забутих",
    dateTime: "Сб, 18 травня · 19:30",
    description:
      "Щотижневий забіг на босів Безодні. Потрібні два танки зі стійкістю до тіні та стабільні хілери.",
    maxSlots: 10,
    status: "Набір відкрито",
    tier: "Рейд · Героїчний",
    registrations: [
      {
        id: "r4",
        eventId: "2",
        nickname: "Thornshield",
        role: "Танк",
        rank: "Учасник",
        status: "Основний склад",
      },
      {
        id: "r5",
        eventId: "2",
        nickname: "Starweaver",
        role: "Хілер",
        rank: "Учасник",
        status: "Основний склад",
      },
    ],
  },
  {
    id: "3",
    title: "Облога Чорного Храму",
    dateTime: "Вт, 14 травня · 20:00",
    description: "Закритий рейд минулого тижня. Усі трофеї розподілено між учасниками основи.",
    maxSlots: 10,
    status: "Завершено",
    tier: "Рейд · Міфічний",
    registrations: [
      {
        id: "r6",
        eventId: "3",
        nickname: "Nightwarden",
        role: "Танк",
        rank: "Офіцер",
        status: "Основний склад",
      },
    ],
  },
];

export async function listEvents(statusFilter?: string): Promise<GuildEvent[]> {
  const all = await withMockMode(eventsStore);
  if (!statusFilter || statusFilter === "Усі") {
    return [...all];
  }
  return all.filter((e) => e.status === statusFilter);
}

export async function getEventById(id: string): Promise<GuildEvent | null> {
  const all = await withMockMode(eventsStore);
  const found = all.find((e) => e.id === id);
  return found ?? null;
}

export async function createEvent(input: CreateEventInput): Promise<GuildEvent> {
  const cleanTitle = input.title.trim();
  if (!cleanTitle || input.maxSlots < 1) {
    throw new Error("Назва події обов'язкова, а ліміт місць має бути не менше 1");
  }
  const newEvent: GuildEvent = {
    id: String(Date.now() + Math.floor(Math.random() * 1000)),
    title: cleanTitle,
    dateTime: input.dateTime.trim() || "Невдовзі · 20:00",
    description: input.description.trim() || "Координаційний рейд гільдії Shadow Vanguard.",
    maxSlots: Number(input.maxSlots),
    status: "Набір відкрито",
    tier: "Рейд · Міфічний",
    registrations: [],
  };
  eventsStore.unshift(newEvent);
  return newEvent;
}

export async function registerForEvent(
  eventId: string,
  nickname: string,
  role: CombatRole
): Promise<EventRegistration> {
  const ev = eventsStore.find((e) => e.id === eventId);
  if (!ev) {
    throw new Error("Подію не знайдено");
  }
  if (ev.status === "Завершено") {
    throw new Error("Набір на цю подію вже завершено");
  }
  const cleanNick = nickname.trim();
  if (!cleanNick) {
    throw new Error("Вкажіть нікнейм учасника");
  }
  const existing = ev.registrations.find(
    (r) => r.nickname.toLowerCase() === cleanNick.toLowerCase()
  );
  if (existing) {
    return existing;
  }

  const mainCount = ev.registrations.filter((r) => r.status === "Основний склад").length;
  const status: RegistrationStatus =
    mainCount < ev.maxSlots ? "Основний склад" : "Резерв";

  const reg: EventRegistration = {
    id: `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    eventId,
    nickname: cleanNick,
    role,
    rank: "Учасник",
    status,
  };
  ev.registrations.push(reg);
  return reg;
}

export async function cancelRegistration(
  eventId: string,
  nickname: string
): Promise<void> {
  const ev = eventsStore.find((e) => e.id === eventId);
  if (!ev || ev.status === "Завершено") return;
  ev.registrations = ev.registrations.filter(
    (r) => r.nickname.toLowerCase() !== nickname.trim().toLowerCase()
  );
}

export async function toggleRegistrationStatus(
  eventId: string,
  nickname: string
): Promise<void> {
  const ev = eventsStore.find((e) => e.id === eventId);
  if (!ev || ev.status === "Завершено") return;
  const reg = ev.registrations.find((r) => r.nickname === nickname);
  if (!reg) return;
  reg.status = reg.status === "Основний склад" ? "Резерв" : "Основний склад";
}

export async function closeEventRecruitment(eventId: string): Promise<void> {
  const ev = eventsStore.find((e) => e.id === eventId);
  if (!ev) return;
  ev.status = "Завершено";
}
