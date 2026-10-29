export interface EventComment {
  id: string;
  eventId: string;
  author: string;
  time: string;
  text: string;
  reportsCount: number;
  isHidden: boolean;
}

export {
  listCommentsByEvent,
  addComment,
  reportComment,
  hideComment,
} from "./db/comments";
