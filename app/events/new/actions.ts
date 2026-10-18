"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createEvent } from "@/lib/data/events";

export async function createEventAction(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const dateTime = String(formData.get("dateTime") ?? "");
  const maxSlots = Number(formData.get("maxSlots") ?? 0);
  const description = String(formData.get("description") ?? "");

  await createEvent({
    title,
    dateTime,
    maxSlots,
    description,
  });

  revalidatePath("/events");
  revalidatePath("/");
  redirect("/events");
}
