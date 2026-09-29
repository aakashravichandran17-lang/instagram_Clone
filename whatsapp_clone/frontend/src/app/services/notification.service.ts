import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<{
    success: boolean;
    data: { notifications: Notification[] };
  }> {
    return this.http.get<{
      success: boolean;
      data: { notifications: Notification[] };
    }>(this.apiUrl);
  }

  markAsRead(id: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/read-all`, {});
  }

  getUnreadCount(): Observable<{
    success: boolean;
    data: { unreadCount: number };
  }> {
    return this.http.get<{
      success: boolean;
      data: { unreadCount: number };
    }>(`${this.apiUrl}/unread-count`);
  }
}
