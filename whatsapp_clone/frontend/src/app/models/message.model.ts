import { User } from './user.model';

export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  receiver: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}
