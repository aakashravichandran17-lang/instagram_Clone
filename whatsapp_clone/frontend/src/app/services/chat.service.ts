import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Conversation, Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  getConversations(): Observable<{
    success: boolean;
    data: { conversations: Conversation[] };
  }> {
    return this.http.get<{
      success: boolean;
      data: { conversations: Conversation[] };
    }>(`${this.apiUrl}/conversations`);
  }

  createConversation(
    participantId: string
  ): Observable<{ success: boolean; data: { conversation: Conversation } }> {
    return this.http.post<{
      success: boolean;
      data: { conversation: Conversation };
    }>(`${this.apiUrl}/conversations`, { participantId });
  }

  getMessages(
    conversationId: string
  ): Observable<{ success: boolean; data: { messages: Message[] } }> {
    return this.http.get<{ success: boolean; data: { messages: Message[] } }>(
      `${this.apiUrl}/conversations/${conversationId}/messages`
    );
  }

  markAsRead(conversationId: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${this.apiUrl}/conversations/${conversationId}/read`,
      {}
    );
  }

  getUnreadCount(): Observable<{ success: boolean; data: { unreadCount: number } }> {
    return this.http.get<{ success: boolean; data: { unreadCount: number } }>(
      `${this.apiUrl}/unread-count`
    );
  }
}
