import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidebar-wrapper">
      <nav class="nav flex-column gap-1 p-3">
        <a class="nav-link-custom" routerLink="/dashboard" routerLinkActive="active">
          <i class="bi bi-house-door fs-5"></i>
          Dashboard
        </a>
        <a class="nav-link-custom" routerLink="/explore" routerLinkActive="active">
          <i class="bi bi-compass fs-5"></i>
          Explore
        </a>
        <a class="nav-link-custom" routerLink="/messages" routerLinkActive="active">
          <i class="bi bi-chat-dots fs-5"></i>
          Messages
        </a>
        <a class="nav-link-custom" routerLink="/notifications" routerLinkActive="active">
          <i class="bi bi-bell fs-5"></i>
          Notifications
        </a>
        <a class="nav-link-custom" [routerLink]="['/profile', currentUser?.username]" routerLinkActive="active">
          <i class="bi bi-person fs-5"></i>
          Profile
        </a>
        <a class="nav-link-custom" routerLink="/settings" routerLinkActive="active">
          <i class="bi bi-gear fs-5"></i>
          Settings
        </a>
      </nav>

      <div class="mt-auto p-3">
        <div class="card p-3">
          <div class="d-flex align-items-center gap-2">
            <app-avatar
              [image]="currentUser?.profileImage || ''"
              [name]="currentUser?.fullName || ''"
              size="sm"
            ></app-avatar>
            <div class="min-width-0">
              <small class="fw-semibold text-truncate d-block">{{ currentUser?.fullName }}</small>
              <small class="text-muted text-truncate d-block">@{{ currentUser?.username }}</small>
            </div>
          </div>
        </div>
        <button class="btn btn-outline btn-sm w-100 mt-2" (click)="logout()">
          <i class="bi bi-box-arrow-right"></i>
          Logout
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--card);
      border-right: 1px solid var(--border);
    }
    .min-width-0 { min-width: 0; }
  `]
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.toastService.success('Logged out successfully!');
  }
}
