import { User } from './user.model';

export type NotificationType = 'follow' | 'like' | 'comment' | 'message';

export interface Notification {
  _id: string;
  recipient: string;
  sender: User;
  type: NotificationType;
  message: string;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
