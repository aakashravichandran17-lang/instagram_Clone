import { User } from './user.model';

export interface Comment {
  _id: string;
  post: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  author: User;
  content: string;
  image: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content: string;
  image?: string;
}
