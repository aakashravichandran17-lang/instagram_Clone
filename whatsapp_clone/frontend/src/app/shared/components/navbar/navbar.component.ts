import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ChatService } from '../../../services/chat.service';
import { SocketService } from '../../../services/socket.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar navbar-expand-lg sticky-top" style="background: var(--card); border-bottom: 1px solid var(--border);">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" routerLink="/dashboard">
          <i class="bi bi-heart-fill text-danger"></i>
          <span class="text-gradient">ConnectHub</span>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center">
            <!-- Notifications -->
            <li class="nav-item me-2">
              <a class="nav-link position-relative" routerLink="/notifications" routerLinkActive="active">
                <i class="bi bi-bell fs-5"></i>
                <span
                  *ngIf="unreadNotifications > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style="font-size: 0.6rem;"
                >
                  {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
                </span>
              </a>
            </li>

            <!-- Messages -->
            <li class="nav-item me-2">
              <a class="nav-link position-relative" routerLink="/messages" routerLinkActive="active">
                <i class="bi bi-chat-dots fs-5"></i>
                <span
                  *ngIf="unreadMessages > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style="font-size: 0.6rem;"
                >
                  {{ unreadMessages > 9 ? '9+' : unreadMessages }}
                </span>
              </a>
            </li>

            <!-- User dropdown -->
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                <app-avatar
                  [image]="currentUser?.profileImage || ''"
                  [name]="currentUser?.fullName || ''"
                  size="sm"
                ></app-avatar>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <a class="dropdown-item" [routerLink]="['/profile', currentUser?.username]">
                    <i class="bi bi-person me-2"></i>Profile
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" routerLink="/settings">
                    <i class="bi bi-gear me-2"></i>Settings
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item text-danger" (click)="logout()">
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: any;
  unreadNotifications = 0;
  unreadMessages = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private socketService: SocketService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    // Load initial counts
    this.loadUnreadCounts();

    // Listen for real-time notifications
    this.subscriptions.push(
      this.socketService.newNotification$.subscribe(() => {
        this.unreadNotifications++;
      })
    );

    // Listen for new messages
    this.subscriptions.push(
      this.socketService.newMessage$.subscribe(() => {
        this.unreadMessages++;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  loadUnreadCounts(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadNotifications = response.data.unreadCount;
      }
    });

    this.chatService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadMessages = response.data.unreadCount;
      }
    });
  }

  logout(): void {
    this.socketService.disconnect();
    this.authService.logout();
    this.toastService.success('Logged out successfully!');
  }
}
