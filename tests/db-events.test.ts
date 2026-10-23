import { describe, expect, it } from "vitest";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEventWithSquads,
  registerForEvent,
} from "@/lib/data/db/events";

describe("Операції над подіями гільдії в базі даних Supabase (ПР 4)", () => {
  it("створений запис читається назад: створена подія знаходиться в базі за id", async () => {
    const title = `тест-подія-${Date.now()}`;
    const created = await createEvent({
      title,
      dateTime: "2026-10-24 20:00",
      description: "Тестовий рейд для перевірки читання",
      maxSlots: 10,
    });
    const found = await getEventById(created.id);
    expect(found).not.toBeNull();
    expect(found?.title).toBe(title);
    await deleteEvent(created.id);
  });

  it("видалений запис не знаходиться: видалення події прибирає її з бази", async () => {
    const title = `тест-видалення-${Date.now()}`;
    const created = await createEvent({
      title,
      dateTime: "2026-10-24 20:00",
      description: "Тестовий рейд для перевірки видалення",
      maxSlots: 10,
    });
    expect(await getEventById(created.id)).not.toBeNull();
    await deleteEvent(created.id);
    expect(await getEventById(created.id)).toBeNull();
  });

  it("обов'язкове поле не приймає порожнє значення: порожня назва викликає помилку валідації", async () => {
    await expect(
      createEvent({
        title: "   ",
        dateTime: "2026-10-24 20:00",
        description: "Опис без валідної назви",
        maxSlots: 10,
      })
    ).rejects.toThrow();
  });

  it("зв'язок багато до багатьох: запис учасника на подію зберігається у таблиці зв'язку", async () => {
    const title = `тест-запис-${Date.now()}`;
    const ev = await createEvent({
      title,
      dateTime: "2026-10-24 20:00",
      description: "Перевірка зв'язку M:N",
      maxSlots: 5,
    });
    const nick = `Тест-${Date.now()}`;
    const reg = await registerForEvent(ev.id, nick, "Танк");
    expect(reg.status).toBe("Основний склад");

    const details = await getEventWithSquads(ev.id);
    expect(details?.mainSquad.some((r) => r.nickname === nick)).toBe(true);
    await deleteEvent(ev.id);
  });
});
