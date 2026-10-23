import { db } from "./client";
import type { CombatRole, GuildRank, Member } from "@/lib/data/members";

type ProfileRow = {
  id: string;
  nickname: string;
  character_class: string;
  role: string;
  rank: string;
  active_status: string;
};

function toMember(row: ProfileRow): Member {
  return {
    id: row.id,
    nickname: row.nickname,
    characterClass: row.character_class,
    role: row.role as CombatRole,
    rank: row.rank as GuildRank,
    activeStatus: row.active_status,
  };
}

export async function listMembers(roleFilter?: string): Promise<Member[]> {
  let query = db().from("profiles").select("*");
  if (roleFilter && roleFilter !== "Усі") {
    query = query.eq("role", roleFilter);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as ProfileRow[]).map(toMember);
}
