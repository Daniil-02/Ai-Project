import { withMockMode } from "./mock-mode";

export type CombatRole = "Танк" | "Хілер" | "ДПС";
export type GuildRank = "Офіцер" | "Учасник";

export type Member = {
  id: string;
  nickname: string;
  role: CombatRole;
  rank: GuildRank;
  activeStatus: string;
  characterClass: string;
};

const membersStore: Member[] = [
  {
    id: "m1",
    nickname: "Nightwarden",
    role: "Танк",
    rank: "Офіцер",
    activeStatus: "Онлайн",
    characterClass: "Вартовий",
  },
  {
    id: "m2",
    nickname: "Lunaria",
    role: "Хілер",
    rank: "Офіцер",
    activeStatus: "У рейді",
    characterClass: "Оракул",
  },
  {
    id: "m3",
    nickname: "Ashbringer",
    role: "ДПС",
    rank: "Учасник",
    activeStatus: "Онлайн",
    characterClass: "Мисливець",
  },
  {
    id: "m4",
    nickname: "Thornshield",
    role: "Танк",
    rank: "Учасник",
    activeStatus: "Готовий до рейду",
    characterClass: "Захисник",
  },
  {
    id: "m5",
    nickname: "Starweaver",
    role: "Хілер",
    rank: "Учасник",
    activeStatus: "Онлайн",
    characterClass: "Жрець",
  },
  {
    id: "m6",
    nickname: "Voidstriker",
    role: "ДПС",
    rank: "Учасник",
    activeStatus: "Офлайн (2 год тому)",
    characterClass: "Чарівник",
  },
];

export async function listMembers(roleFilter?: string): Promise<Member[]> {
  const all = await withMockMode(membersStore);
  if (!roleFilter || roleFilter === "Усі") {
    return [...all];
  }
  return all.filter((m) => m.role === roleFilter);
}
