import { db } from "./client";
import type { EventComment } from "@/lib/data/comments";
import { createEvent, listEvents } from "./events";

type CommentRow = {
  id: string;
  event_id: string;
  author_nickname: string;
  comment_time: string;
  content: string;
  reports_count: number;
  is_hidden: boolean;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const aliasEventMap: Record<string, string> = {};

async function resolveEventUuid(eventId: string): Promise<string> {
  if (UUID_RE.test(eventId)) return eventId;
  if (aliasEventMap[eventId]) return aliasEventMap[eventId];
  const existing = await listEvents();
  if (existing.length > 0) {
    aliasEventMap[eventId] = existing[0].id;
    return existing[0].id;
  }
  const created = await createEvent({
    title: "Рейд Цитаделі",
    dateTime: "Сьогодні · 20:00",
    maxSlots: 10,
    description: "Автоматична подія для коментарів",
  });
  aliasEventMap[eventId] = created.id;
  return created.id;
}

function toComment(row: CommentRow): EventComment {
  return {
    id: row.id,
    eventId: row.event_id,
    author: row.author_nickname,
    time: row.comment_time,
    text: row.is_hidden
      ? "Повідомлення приховано модератором"
      : row.content,
    reportsCount: row.reports_count,
    isHidden: row.is_hidden,
  };
}

export async function listCommentsByEvent(eventId: string): Promise<EventComment[]> {
  const realId = await resolveEventUuid(eventId);
  const { data, error } = await db()
    .from("event_comments")
    .select("*")
    .eq("event_id", realId);
  if (error) throw new Error(error.message);
  return ((data as CommentRow[]) || []).map(toComment);
}

export async function addComment(
  eventId: string,
  author: string,
  text: string
): Promise<EventComment> {
  const cleanText = text.trim();
  if (!cleanText) throw new Error("Текст коментаря не може бути порожнім");
  const realId = await resolveEventUuid(eventId);

  const { data, error } = await db()
    .from("event_comments")
    .insert({
      event_id: realId,
      author_nickname: author.trim() || "Учасник",
      comment_time: "Щойно",
      content: cleanText,
      reports_count: 0,
      is_hidden: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return toComment(data as CommentRow);
}

export async function reportComment(commentId: string): Promise<void> {
  const { data: row } = await db()
    .from("event_comments")
    .select("reports_count")
    .eq("id", commentId)
    .maybeSingle();
  if (!row) return;

  const { error } = await db()
    .from("event_comments")
    .update({ reports_count: (row.reports_count || 0) + 1 })
    .eq("id", commentId);
  if (error) throw new Error(error.message);
}

export async function hideComment(commentId: string): Promise<void> {
  const { error } = await db()
    .from("event_comments")
    .update({
      is_hidden: true,
      content: "Повідомлення приховано модератором",
    })
    .eq("id", commentId);
  if (error) throw new Error(error.message);
}
