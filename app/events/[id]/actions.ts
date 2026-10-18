"use server";

import { revalidatePath } from "next/cache";
import {
  cancelRegistration,
  closeEventRecruitment,
  registerForEvent,
  toggleRegistrationStatus,
} from "@/lib/data/events";
import { addComment, hideComment, reportComment } from "@/lib/data/comments";
import type { CombatRole } from "@/lib/data/members";

export async function registerAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const nickname = String(formData.get("nickname") ?? "VanguardHero");
  const role = (formData.get("role") as CombatRole) || "ДПС";
  await registerForEvent(eventId, nickname, role);
  revalidatePath(`/events/${eventId}`);
}

export async function cancelRegistrationAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const nickname = String(formData.get("nickname") ?? "");
  await cancelRegistration(eventId, nickname);
  revalidatePath(`/events/${eventId}`);
}

export async function toggleSlotAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const nickname = String(formData.get("nickname") ?? "");
  await toggleRegistrationStatus(eventId, nickname);
  revalidatePath(`/events/${eventId}`);
}

export async function closeRecruitmentAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  await closeEventRecruitment(eventId);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
}

export async function addCommentAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const author = String(formData.get("author") ?? "Nightwarden");
  const text = String(formData.get("text") ?? "");
  if (text.trim()) {
    await addComment(eventId, author, text);
    revalidatePath(`/events/${eventId}`);
  }
}

export async function reportCommentAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const commentId = String(formData.get("commentId") ?? "");
  await reportComment(commentId);
  revalidatePath(`/events/${eventId}`);
}

export async function hideCommentAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const commentId = String(formData.get("commentId") ?? "");
  await hideComment(commentId);
  revalidatePath(`/events/${eventId}`);
}
