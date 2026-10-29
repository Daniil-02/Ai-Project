export type CombatRole = "Танк" | "Хілер" | "ДПС";
export type GuildRank = "Лідер гільдії" | "Офіцер" | "Ветеран" | "Учасник" | "Новачок" | string;
export type MemberRank = GuildRank;
export type ActiveStatus = "Онлайн" | "В рейді" | "АФК" | "Офлайн" | string;

export interface Member {
  id: string;
  nickname: string;
  characterClass: string;
  role: CombatRole;
  rank: GuildRank;
  activeStatus: ActiveStatus;
}

export { listMembers } from "./db/members";
