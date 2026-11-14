function readLimit(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

export function aiLimits(): { perUserPerHour: number; appPerDay: number } {
  return {
    perUserPerHour: readLimit("AI_USER_LIMIT_PER_HOUR", 10),
    appPerDay: readLimit("AI_APP_LIMIT_PER_DAY", 200),
  };
}

export const MODEL_TIMEOUT_MS = 20_000;
export const CACHE_TTL_SECONDS = 24 * 60 * 60;
