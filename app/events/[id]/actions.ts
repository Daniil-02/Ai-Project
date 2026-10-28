"use server";

import { revalidatePath } from "next/cache";
import { isAccessDenied, type ActionResult } from "@/lib/action-result";
import { currentUserId } from "@/lib/auth";
import {
  cancelRegistration,
  closeEventRecruitment,
  createEvent,
  deleteEvent,
  registerForEvent,
  toggleRegistrationStatus,
} from "@/lib/data/db/events";
import { addComment, hideComment, reportComment } from "@/lib/data/db/comments";
import type { CombatRole } from "@/lib/data/members";
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

// POST /events — видалити подію. Коди: 200, 400, 401, 404.
export async function deleteEventAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб видалити подію." };
  }
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return { status: 400, message: "Невідома подія." };
  }
  try {
    const deleted = await deleteEvent(id);
    if (!deleted) {
      return { status: 404, message: "Подію не знайдено або у вас немає прав її видалити." };
    }
    revalidatePath("/events");
    revalidatePath("/");
    return { status: 200, message: "Подію видалено." };
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 404, message: "Подію не знайдено або у вас немає прав її видалити." };
    }
    throw error;
  }
}

// POST /events/[id] — запис на подію. Коди: 201, 400, 401, 403, 404.
export async function registerAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб записатися на рейд." };
  }
  const eventId = String(formData.get("eventId") ?? formData.get("event_id") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();
  const role = String(formData.get("role") ?? "Танк") as CombatRole;

  if (!eventId || !nickname) {
    return { status: 400, message: "Вкажіть нікнейм та оберіть роль.", fieldErrors: { nickname: "Нікнейм обов'язковий." } };
  }

  try {
    await registerForEvent(eventId, nickname, role);
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    return { status: 201, message: "Заявку успішно подано." };
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Недостатньо прав для запису на подію." };
    }
    return { status: 400, message: error instanceof Error ? error.message : "Помилка запису." };
  }
}

// POST /events/[id] — скасування заявки. Коди: 200, 400, 401, 404.
export async function cancelAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб скасувати заявку." };
  }
  const eventId = String(formData.get("eventId") ?? formData.get("event_id") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();
  if (!eventId || !nickname) {
    return { status: 400, message: "Необхідні дані для скасування відсутні." };
  }
  try {
    const ok = await cancelRegistration(eventId, nickname);
    if (!ok) return { status: 404, message: "Заявку не знайдено." };
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    return { status: 200, message: "Заявку скасовано." };
  } catch {
    return { status: 404, message: "Заявку не знайдено." };
  }
}

export async function cancelRegistrationAction(previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return cancelAction(previous, formData);
}

// POST /events/[id] — зміна статусу слота. Коди: 200, 400, 401, 404.
export async function toggleStatusAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб змінити статус." };
  }
  const eventId = String(formData.get("eventId") ?? formData.get("event_id") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();
  if (!eventId || !nickname) {
    return { status: 400, message: "Необхідні дані відсутні." };
  }
  try {
    const ok = await toggleRegistrationStatus(eventId, nickname);
    if (!ok) return { status: 404, message: "Заявку не знайдено." };
    revalidatePath(`/events/${eventId}`);
    return { status: 200, message: "Статус слота змінено." };
  } catch {
    return { status: 404, message: "Заявку не знайдено." };
  }
}

export async function toggleSlotAction(previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return toggleStatusAction(previous, formData);
}

// POST /events/[id] — закриття набору. Коди: 200, 400, 401, 404.
export async function closeRecruitmentAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб закрити набір." };
  }
  const eventId = String(formData.get("eventId") ?? formData.get("event_id") ?? "");
  if (!eventId) {
    return { status: 400, message: "Ідентифікатор події відсутній." };
  }
  try {
    const ok = await closeEventRecruitment(eventId);
    if (!ok) return { status: 404, message: "Подію не знайдено." };
    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    return { status: 200, message: "Набір завершено." };
  } catch {
    return { status: 404, message: "Подію не знайдено." };
  }
}

// POST /events/[id] — додати коментар. Коди: 201, 400, 401.
export async function addCommentAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб залишити коментар." };
  }
  const eventId = String(formData.get("eventId") ?? formData.get("event_id") ?? "");
  const author = String(formData.get("author") ?? "").trim();
  const text = String(formData.get("text") ?? formData.get("content") ?? "").trim();

  if (!eventId || !text) {
    return { status: 400, message: "Коментар не може бути порожнім.", fieldErrors: { text: "Введіть текст коментаря." } };
  }
  try {
    await addComment(eventId, author || "Учасник", text);
    revalidatePath(`/events/${eventId}`);
    return { status: 201, message: "Коментар додано." };
  } catch (error) {
    return { status: 400, message: error instanceof Error ? error.message : "Помилка додавання коментаря." };
  }
}

// POST /events/[id] — поскаржитися на коментар. Коди: 200, 400, 401, 404.
export async function reportCommentAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб надіслати скаргу." };
  }
  const eventId = String(formData.get("eventId") ?? formData.get("event_id") ?? "");
  const commentId = String(formData.get("commentId") ?? formData.get("comment_id") ?? "");
  if (!commentId) {
    return { status: 400, message: "Коментар не вказано." };
  }
  try {
    await reportComment(commentId);
    if (eventId) revalidatePath(`/events/${eventId}`);
    return { status: 200, message: "Скаргу надіслано." };
  } catch {
    return { status: 404, message: "Коментар не знайдено." };
  }
}

// POST /events/[id] — приховати коментар. Коди: 200, 400, 401, 403, 404.
export async function hideCommentAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!(await currentUserId())) {
    return { status: 401, message: "Увійдіть, щоб приховати коментар." };
  }
  const eventId = String(formData.get("eventId") ?? formData.get("event_id") ?? "");
  const commentId = String(formData.get("commentId") ?? formData.get("comment_id") ?? "");
  if (!commentId) {
    return { status: 400, message: "Коментар не вказано." };
  }
  try {
    await hideComment(commentId);
    if (eventId) revalidatePath(`/events/${eventId}`);
    return { status: 200, message: "Коментар приховано." };
  } catch (error) {
    if (isAccessDenied(error)) {
      return { status: 403, message: "Недостатньо прав для приховування коментарів." };
    }
    return { status: 404, message: "Коментар не знайдено." };
  }
}
