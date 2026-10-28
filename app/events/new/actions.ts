"use server";

import { revalidatePath } from "next/cache";
import { isAccessDenied, type ActionResult } from "@/lib/action-result";
import { currentUserId } from "@/lib/auth";
import { createEvent } from "@/lib/data/db/events";
import { checkEvent } from "@/lib/validation/events";

// POST /events/new — створити подію. Коди: 201, 400, 401, 403.
export async function createEventAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб створити подію." };
  }

  const checked = checkEvent(formData);
  if (!checked.ok) {
    return { status: 400, message: "Перевірте поля форми.", fieldErrors: checked.fieldErrors };
  }

  try {
    const event = await createEvent(checked.value);
    revalidatePath("/events");
    revalidatePath("/");
    return { status: 201, id: event.id, message: "Подію успішно створено." };
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Створювати події може лише офіцер гільдії." };
    }
    throw error;
  }
}
