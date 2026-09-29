import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreatePostRequest, Post } from '../models/post.model';

interface PostsResponse {
  success: boolean;
  data: { posts: Post[] };
}

interface PostResponse {
  success: boolean;
  data: { post: Post };
}

interface LikesResponse {
  success: boolean;
  data: { likesCount: number };
}

interface CommentResponse {
  success: boolean;
  data: { comment: any };
}

interface SimpleResponse {
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getFeed(): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(`${this.apiUrl}/feed`);
  }

  getAllPosts(): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(this.apiUrl);
  }

  getPostById(id: string): Observable<PostResponse> {
    return this.http.get<PostResponse>(`${this.apiUrl}/${id}`);
  }

  createPost(data: CreatePostRequest): Observable<PostResponse> {
    return this.http.post<PostResponse>(this.apiUrl, data);
  }

  updatePost(id: string, data: CreatePostRequest): Observable<PostResponse> {
    return this.http.put<PostResponse>(`${this.apiUrl}/${id}`, data);
  }

  deletePost(id: string): Observable<SimpleResponse> {
    return this.http.delete<SimpleResponse>(`${this.apiUrl}/${id}`);
  }

  likePost(id: string): Observable<LikesResponse> {
    return this.http.post<LikesResponse>(`${this.apiUrl}/${id}/like`, {});
  }

  unlikePost(id: string): Observable<LikesResponse> {
    return this.http.delete<LikesResponse>(`${this.apiUrl}/${id}/like`);
  }

  addComment(postId: string, content: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.apiUrl}/${postId}/comments`, { content });
  }

  deleteComment(commentId: string): Observable<SimpleResponse> {
    return this.http.delete<SimpleResponse>(`${environment.apiUrl}/comments/${commentId}`);
  }
}
