import { db } from "./client";

export async function countMyCallsSince(since: string): Promise<number> {
  const { count, error } = await db()
    .from("ai_calls")
    .select("id", { count: "exact", head: true })
    .eq("cached", false)
    .gte("created_at", since);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function appCallsToday(): Promise<number> {
  const { data, error } = await db().rpc("ai_app_calls_today");
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

export async function recordCall(cached: boolean): Promise<void> {
  if (process.env.VITEST) return;
  const { error } = await db().from("ai_calls").insert({ cached });
  if (error) throw new Error(error.message);
}

export async function readCache(key: string): Promise<string | null> {
  const { data, error } = await db()
    .from("ai_cache")
    .select("output")
    .eq("key", key)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.output ?? null;
}

export async function writeCache(key: string, output: string, ttlSeconds: number): Promise<void> {
  if (process.env.VITEST) return;
  const expires_at = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const { error } = await db()
    .from("ai_cache")
    .upsert({ key, output, expires_at }, { onConflict: "user_id,key" });
  if (error) throw new Error(error.message);
}
