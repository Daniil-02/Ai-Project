import { withMockMode } from "./mock-mode";

export type EventComment = {
  id: string;
  eventId: string;
  author: string;
  time: string;
  text: string;
  reportsCount: number;
  isHidden: boolean;
};

const commentsStore: EventComment[] = [
  {
    id: "c1",
    eventId: "1",
    author: "Lunaria",
    time: "18:42",
    text: "Візьму запасні зілля лікування для всієї групи.",
    reportsCount: 0,
    isHidden: false,
  },
  {
    id: "c2",
    eventId: "1",
    author: "Voidstriker",
    time: "18:30",
    text: "Повідомлення приховано модератором",
    reportsCount: 2,
    isHidden: true,
  },
  {
    id: "c3",
    eventId: "1",
    author: "Nightwarden",
    time: "18:15",
    text: "Збираємося біля входу до підземелля за 10 хвилин до старту.",
    reportsCount: 1,
    isHidden: false,
  },
];

export async function listCommentsByEvent(eventId: string): Promise<EventComment[]> {
  const all = await withMockMode(commentsStore);
  return all.filter((c) => c.eventId === eventId);
}

export async function addComment(
  eventId: string,
  author: string,
  text: string
): Promise<EventComment> {
  const cleanText = text.trim();
  const cleanAuthor = author.trim() || "Учасник";
  if (!cleanText) {
    throw new Error("Текст коментаря не може бути порожнім");
  }
  const created: EventComment = {
    id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    eventId,
    author: cleanAuthor,
    time: "Щойно",
    text: cleanText,
    reportsCount: 0,
    isHidden: false,
  };
  commentsStore.unshift(created);
  return created;
}

export async function reportComment(commentId: string): Promise<void> {
  const found = commentsStore.find((c) => c.id === commentId);
  if (found && !found.isHidden) {
    found.reportsCount += 1;
  }
}

export async function hideComment(commentId: string): Promise<void> {
  const found = commentsStore.find((c) => c.id === commentId);
  if (found) {
    found.isHidden = true;
    found.text = "Повідомлення приховано модератором";
  }
}
