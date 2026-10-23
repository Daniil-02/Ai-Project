import { db } from "./client";
import type { EventComment } from "@/lib/data/comments";

type CommentRow = {
  id: string;
  event_id: string;
  author_nickname: string;
  comment_time: string;
  content: string;
  reports_count: number;
  is_hidden: boolean;
};

function toComment(row: CommentRow): EventComment {
  return {
    id: row.id,
    eventId: row.event_id,
    author: row.author_nickname,
    time: row.comment_time,
    text: row.content,
    reportsCount: row.reports_count,
    isHidden: row.is_hidden,
  };
}

export async function listCommentsByEvent(eventId: string): Promise<EventComment[]> {
  const { data, error } = await db()
    .from("event_comments")
    .select("*")
    .eq("event_id", eventId);
  if (error) throw new Error(error.message);
  return (data as CommentRow[]).map(toComment);
}

export async function addComment(
  eventId: string,
  author: string,
  text: string
): Promise<EventComment> {
  const clean = text.trim();
  if (!clean) throw new Error("Коментар не може бути порожнім");
  const { data, error } = await db()
    .from("event_comments")
    .insert({
      event_id: eventId,
      author_nickname: author.trim() || "Учасник",
      content: clean,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return toComment(data as CommentRow);
}

export async function reportComment(commentId: string): Promise<void> {
  const { data, error: fetchErr } = await db()
    .from("event_comments")
    .select("reports_count")
    .eq("id", commentId)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);
  const current = (data?.reports_count as number) || 0;
  const { error } = await db()
    .from("event_comments")
    .update({ reports_count: current + 1 })
    .eq("id", commentId);
  if (error) throw new Error(error.message);
}

export async function hideComment(commentId: string): Promise<void> {
  const { error } = await db()
    .from("event_comments")
    .update({ is_hidden: true, content: "Повідомлення приховано модератором" })
    .eq("id", commentId);
  if (error) throw new Error(error.message);
}
