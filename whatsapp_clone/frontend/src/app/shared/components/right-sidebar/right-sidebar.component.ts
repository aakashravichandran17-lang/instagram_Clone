import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-right-sidebar',
  template: `
    <div class="right-sidebar">
      <!-- Suggested Users -->
      <div class="card p-3 mb-3">
        <h6 class="fw-bold mb-3">
          <i class="bi bi-people me-2"></i>Suggested for you
        </h6>
        <div *ngIf="loadingSuggestions">
          <app-skeleton type="user"></app-skeleton>
          <app-skeleton type="user"></app-skeleton>
        </div>
        <div *ngIf="!loadingSuggestions && suggestedUsers.length === 0" class="text-muted small">
          No suggestions available.
        </div>
        <div *ngFor="let user of suggestedUsers" class="d-flex align-items-center gap-2 mb-2">
          <a [routerLink]="['/profile', user.username]">
            <app-avatar [image]="user.profileImage" [name]="user.fullName" size="sm"></app-avatar>
          </a>
          <div class="flex-grow-1 min-width-0">
            <a
              [routerLink]="['/profile', user.username]"
              class="fw-semibold small text-decoration-none d-block text-truncate"
              style="color: var(--text)"
            >
              {{ user.fullName }}
            </a>
            <small class="text-muted text-truncate d-block">@{{ user.username }}</small>
          </div>
          <button class="btn btn-primary btn-sm" (click)="followUser(user)">
            Follow
          </button>
        </div>
      </div>

      <!-- Trending -->
      <div class="card p-3 mb-3">
        <h6 class="fw-bold mb-3">
          <i class="bi bi-hash me-2"></i>Trending
        </h6>
        <div class="d-flex flex-wrap gap-2">
          <span class="trending-tag">#Angular</span>
          <span class="trending-tag">#NodeJS</span>
          <span class="trending-tag">#SocketIO</span>
          <span class="trending-tag">#MongoDB</span>
          <span class="trending-tag">#TypeScript</span>
          <span class="trending-tag">#WebDev</span>
          <span class="trending-tag">#Programming</span>
          <span class="trending-tag">#Tech</span>
        </div>
      </div>

      <!-- Online Users -->
      <div class="card p-3">
        <h6 class="fw-bold mb-3">
          <i class="bi bi-circle-fill text-success me-2" style="font-size: 0.6rem;"></i>Online now
        </h6>
        <div *ngIf="onlineUsers.length === 0" class="text-muted small">
          No users online right now.
        </div>
        <div *ngFor="let user of onlineUsers" class="d-flex align-items-center gap-2 mb-2">
          <div class="position-relative">
            <app-avatar [image]="user.profileImage" [name]="user.fullName" size="sm"></app-avatar>
            <span class="badge-online"></span>
          </div>
          <a
            [routerLink]="['/profile', user.username]"
            class="small text-decoration-none"
            style="color: var(--text)"
          >
            {{ user.fullName }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .right-sidebar {
      position: sticky;
      top: 80px;
    }
    .min-width-0 { min-width: 0; }
  `]
})
export class RightSidebarComponent implements OnInit {
  suggestedUsers: User[] = [];
  onlineUsers: User[] = [];
  loadingSuggestions = true;

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.userService.getSuggestedUsers().subscribe({
      next: (response) => {
        this.suggestedUsers = response.data.suggestions.slice(0, 5);
        this.loadingSuggestions = false;
      },
      error: () => {
        this.loadingSuggestions = false;
      }
    });
  }

  followUser(user: User): void {
    this.userService.followUser(user.id).subscribe({
      next: () => {
        this.toastService.success(`Following ${user.fullName}`);
        this.suggestedUsers = this.suggestedUsers.filter((u) => u.id !== user.id);
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to follow user');
      }
    });
  }
}
