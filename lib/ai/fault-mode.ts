// Режим збою моделі (практична робота 6): перевірка відмов без справжнього збою провайдера.
export type AiFaultMode = "none" | "slow" | "down" | "invalid";

export const AI_FAULT_MODE: AiFaultMode = "none";
