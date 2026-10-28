import { describe, expect, it } from "vitest";
import * as eventActions from "@/app/events/[id]/actions";
import { getEventById } from "@/lib/data/db/events";
import { submit } from "./helpers/submit";
import { signInAs } from "./helpers/users";

const createEventAction = (eventActions as Record<string, unknown>).createEventAction;
const deleteEventAction = (eventActions as Record<string, unknown>).deleteEventAction;

describe("точки доступу: ігрові події гільдії (ПР 5)", () => {
  it("успішний виклик: офіцер створює подію, і вона є в базі", async () => {
    const title = `тест-рейд-${Date.now()}`;
    const result = await submit(createEventAction, {
      title,
      dateTime: "2026-11-15 20:00",
      maxSlots: "10",
      description: "Тестовий міфічний рейд для перевірки точки створення",
    });
    expect(result.status).toBe(201);
    expect(result.id).toBeTruthy();
    expect(await getEventById(result.id ?? "")).not.toBeNull();
    await submit(deleteEventAction, { id: result.id ?? "" });
  });

  it("невалідні дані: порожня назва повз форму відхиляється з кодом 400", async () => {
    const result = await submit(createEventAction, {
      title: "   ",
      dateTime: "2026-11-15 20:00",
      maxSlots: "10",
      description: "Опис події без назви",
    });
    expect(result.status).toBe(400);
    expect(result.fieldErrors?.title).toBeTruthy();
  });

  it("невалідні дані: некоректний ліміт місць повз форму відхиляється з кодом 400", async () => {
    const result = await submit(createEventAction, {
      title: `тест-ліміт-${Date.now()}`,
      dateTime: "2026-11-15 20:00",
      maxSlots: "0",
      description: "Опис події з нульовим лімітом місць",
    });
    expect(result.status).toBe(400);
    expect(result.fieldErrors?.maxSlots).toBeTruthy();
  });

  it("чужий запис: акаунт Б не бачить і не видаляє подію акаунта А", async () => {
    const created = await submit(createEventAction, {
      title: `тест-чужий-${Date.now()}`,
      dateTime: "2026-11-15 20:00",
      maxSlots: "10",
      description: "Подія акаунта А",
    });
    expect(created.status).toBe(201);
    try {
      await signInAs("B");
      expect(await getEventById(created.id ?? "")).toBeNull();
      expect((await submit(deleteEventAction, { id: created.id ?? "" })).status).toBe(404);
    } finally {
      await signInAs("A");
      if (created.id) {
        await submit(deleteEventAction, { id: created.id });
      }
    }
  });
});
