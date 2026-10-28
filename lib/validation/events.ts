// Перевірка вводу для подій на сервері (практична робота 5).
export type EventInput = {
  title: string;
  dateTime: string;
  maxSlots: number;
  description: string;
};

export type Checked<T> = { ok: true; value: T } | { ok: false; fieldErrors: Record<string, string> };

export function checkEvent(formData: FormData): Checked<EventInput> {
  const title = String(formData.get("title") ?? "").trim();
  const dateTime = String(formData.get("dateTime") ?? "").trim();
  const maxSlotsStr = String(formData.get("maxSlots") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  
  const fieldErrors: Record<string, string> = {};

  if (!title) {
    fieldErrors.title = "Назва події обов'язкова.";
  } else if (title.length > 100) {
    fieldErrors.title = "Назва — не довше 100 символів.";
  }

  if (!dateTime) {
    fieldErrors.dateTime = "Дата та час обов'язкові.";
  }

  const maxSlots = Number(maxSlotsStr);
  if (!maxSlotsStr || Number.isNaN(maxSlots) || maxSlots < 1 || maxSlots > 40) {
    fieldErrors.maxSlots = "Ліміт місць має бути від 1 до 40.";
  }

  if (description.length > 500) {
    fieldErrors.description = "Опис — не довше 500 символів.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    value: { title, dateTime, maxSlots, description },
  };
}
