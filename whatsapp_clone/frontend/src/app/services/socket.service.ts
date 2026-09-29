import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Message } from '../models/message.model';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  // Event streams
  private messageSubject = new Subject<Message>();
  public message$ = this.messageSubject.asObservable();

  private typingSubject = new Subject<{ conversationId: string; userId: string }>();
  public typing$ = this.typingSubject.asObservable();

  private stopTypingSubject = new Subject<{ conversationId: string; userId: string }>();
  public stopTyping$ = this.stopTypingSubject.asObservable();

  private messagesReadSubject = new Subject<{ conversationId: string; userId: string }>();
  public messagesRead$ = this.messagesReadSubject.asObservable();

  private newNotificationSubject = new Subject<Notification>();
  public newNotification$ = this.newNotificationSubject.asObservable();

  private userOnlineSubject = new Subject<{ userId: string }>();
  public userOnline$ = this.userOnlineSubject.asObservable();

  private userOfflineSubject = new Subject<{ userId: string }>();
  public userOffline$ = this.userOfflineSubject.asObservable();

  private newMessageSubject = new Subject<Message>();
  public newMessage$ = this.newMessageSubject.asObservable();

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.socket?.connected) return;

    const token = this.authService.getToken();
    if (!token) return;

    this.socket = io(environment.socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.connectedSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connectedSubject.next(false);
    });

    this.socket.on('receiveMessage', (message: Message) => {
      this.messageSubject.next(message);
    });

    this.socket.on('newMessage', (message: Message) => {
      this.newMessageSubject.next(message);
    });

    this.socket.on('userTyping', (data: { conversationId: string; userId: string }) => {
      this.typingSubject.next(data);
    });

    this.socket.on('userStoppedTyping', (data: { conversationId: string; userId: string }) => {
      this.stopTypingSubject.next(data);
    });

    this.socket.on('messagesRead', (data: { conversationId: string; userId: string }) => {
      this.messagesReadSubject.next(data);
    });

    this.socket.on('newNotification', (notification: Notification) => {
      this.newNotificationSubject.next(notification);
    });

    this.socket.on('userOnline', (data: { userId: string }) => {
      this.userOnlineSubject.next(data);
    });

    this.socket.on('userOffline', (data: { userId: string }) => {
      this.userOfflineSubject.next(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectedSubject.next(false);
    }
  }

  joinRoom(conversationId: string): void {
    this.socket?.emit('joinRoom', conversationId);
  }

  leaveRoom(conversationId: string): void {
    this.socket?.emit('leaveRoom', conversationId);
  }

  sendMessage(conversationId: string, message: string): void {
    this.socket?.emit('sendMessage', { conversationId, message });
  }

  emitTyping(conversationId: string): void {
    this.socket?.emit('typing', { conversationId });
  }

  emitStopTyping(conversationId: string): void {
    this.socket?.emit('stopTyping', { conversationId });
  }

  emitMessageRead(conversationId: string): void {
    this.socket?.emit('messageRead', { conversationId });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
