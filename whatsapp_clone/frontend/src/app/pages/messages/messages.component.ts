import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ChatService } from '../../services/chat.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Conversation, Message } from '../../models/message.model';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  conversations: Conversation[] = [];
  activeConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage = '';
  loadingConversations = true;
  loadingMessages = false;
  sendingMessage = false;
  typing = false;
  typingTimeout: any;

  private subscriptions: Subscription[] = [];
  private typingSubject = new Subject<string>();
  currentUser: any;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private socketService: SocketService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadConversations();

    // Handle route param for conversation ID
    this.route.params.subscribe((params) => {
      if (params['conversationId']) {
        this.openConversation(params['conversationId']);
      }
    });

    // Listen for incoming messages
    this.subscriptions.push(
      this.socketService.message$.subscribe((message) => {
        if (
          this.activeConversation &&
          message.conversation === this.activeConversation.id
        ) {
          this.messages.push(message);
          this.scrollToBottom();
          this.markAsRead();
        }
        this.updateConversationPreview(message);
      })
    );

    // Listen for typing events
    this.subscriptions.push(
      this.socketService.typing$.subscribe((data) => {
        if (
          this.activeConversation &&
          data.conversationId === this.activeConversation.id &&
          data.userId !== this.currentUser?.id
        ) {
          this.typing = true;
          this.scrollToBottom();
        }
      })
    );

    this.subscriptions.push(
      this.socketService.stopTyping$.subscribe((data) => {
        if (
          this.activeConversation &&
          data.conversationId === this.activeConversation.id
        ) {
          this.typing = false;
        }
      })
    );

    // Listen for read receipts
    this.subscriptions.push(
      this.socketService.messagesRead$.subscribe((data) => {
        if (
          this.activeConversation &&
          data.conversationId === this.activeConversation.id
        ) {
          this.messages.forEach((m) => {
            if (m.sender.id !== this.currentUser?.id) {
              m.isRead = true;
              m.readAt = new Date().toISOString();
            }
          });
        }
      })
    );

    // Typing debounce
    this.subscriptions.push(
      this.typingSubject.pipe(debounceTime(500)).subscribe(() => {
        if (this.activeConversation) {
          this.socketService.emitStopTyping(this.activeConversation.id);
        }
      })
    );
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    if (this.activeConversation) {
      this.socketService.leaveRoom(this.activeConversation.id);
    }
  }

  loadConversations(): void {
    this.loadingConversations = true;
    this.chatService.getConversations().subscribe({
      next: (response) => {
        this.conversations = response.data.conversations;
        this.loadingConversations = false;

        // If we have a conversation ID in the route, open it
        const convId = this.route.snapshot.params['conversationId'];
        if (convId) {
          this.openConversation(convId);
        }
      },
      error: (error) => {
        this.loadingConversations = false;
        this.toastService.error(error.error?.message || 'Failed to load conversations');
      }
    });
  }

  openConversation(conversationId: string): void {
    // Leave previous room
    if (this.activeConversation) {
      this.socketService.leaveRoom(this.activeConversation.id);
    }

    // Find conversation in list or create from ID
    let conversation = this.conversations.find((c) => c.id === conversationId);

    if (!conversation) {
      // Try to load it via messages endpoint
      this.loadingMessages = true;
      this.chatService.getMessages(conversationId).subscribe({
        next: (response) => {
          this.messages = response.data.messages;
          this.activeConversation = {
            id: conversationId,
            participant: response.data.messages[0]?.sender.id === this.currentUser?.id
              ? { id: '', username: '', fullName: '', profileImage: '', email: '', bio: '', followersCount: 0, followingCount: 0, createdAt: '' }
              : response.data.messages[0]?.sender,
            lastMessage: response.data.messages[response.data.messages.length - 1] || null,
            unreadCount: 0,
            updatedAt: new Date().toISOString()
          };
          this.loadingMessages = false;
          this.socketService.joinRoom(conversationId);
          this.scrollToBottom();
          this.markAsRead();
        },
        error: () => {
          this.loadingMessages = false;
          this.toastService.error('Failed to load conversation');
        }
      });
      return;
    }

    this.activeConversation = conversation;
    this.loadingMessages = true;
    this.messages = [];

    this.chatService.getMessages(conversationId).subscribe({
      next: (response) => {
        this.messages = response.data.messages;
        this.loadingMessages = false;
        this.socketService.joinRoom(conversationId);
        this.scrollToBottom();
        this.markAsRead();
      },
      error: (error) => {
        this.loadingMessages = false;
        this.toastService.error(error.error?.message || 'Failed to load messages');
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.activeConversation) return;

    this.sendingMessage = true;
    const messageText = this.newMessage.trim();
    this.newMessage = '';

    this.socketService.sendMessage(this.activeConversation.id, messageText);

    // Optimistically add to UI
    const tempMessage: Message = {
      _id: 'temp_' + Date.now(),
      conversation: this.activeConversation.id,
      sender: {
        id: this.currentUser?.id || '',
        username: this.currentUser?.username || '',
        fullName: this.currentUser?.fullName || '',
        profileImage: this.currentUser?.profileImage || '',
        email: '',
        bio: '',
        followersCount: 0,
        followingCount: 0,
        createdAt: ''
      },
      receiver: this.activeConversation.participant?.id || '',
      message: messageText,
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.messages.push(tempMessage);
    this.scrollToBottom();
    this.sendingMessage = false;

    // Stop typing indicator
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.socketService.emitStopTyping(this.activeConversation.id);
  }

  onTyping(): void {
    if (!this.activeConversation) return;

    this.socketService.emitTyping(this.activeConversation.id);
    this.typingSubject.next(this.activeConversation.id);

    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.typing = false;
    }, 3000);
  }

  markAsRead(): void {
    if (!this.activeConversation) return;
    this.socketService.emitMessageRead(this.activeConversation.id);
    this.chatService.markAsRead(this.activeConversation.id).subscribe();
  }

  updateConversationPreview(message: Message): void {
    const conv = this.conversations.find((c) => c.id === message.conversation);
    if (conv) {
      conv.lastMessage = message;
      conv.updatedAt = message.createdAt;
      // Move to top
      this.conversations = [
        conv,
        ...this.conversations.filter((c) => c.id !== conv.id)
      ];
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }

  isOwnMessage(message: Message): boolean {
    return message.sender.id === this.currentUser?.id;
  }

  isMobileView(): boolean {
    return window.innerWidth < 992;
  }

  getOtherParticipant(): any {
    return this.activeConversation?.participant;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
