import type { EventComment } from "@/lib/data/comments";

// ЗАГЛУШКА: реалізація на кроці 13
export async function listCommentsByEvent(_eventId: string): Promise<EventComment[]> {
  return [];
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function addComment(
  _eventId: string,
  _author: string,
  _text: string
): Promise<EventComment> {
  return {
    id: "",
    eventId: "",
    author: "",
    time: "",
    text: "",
    reportsCount: 0,
    isHidden: false,
  };
}

// ЗАГЛУШКА: реалізація на кроці 13
export async function reportComment(_commentId: string): Promise<void> {}

// ЗАГЛУШКА: реалізація на кроці 13
export async function hideComment(_commentId: string): Promise<void> {}
