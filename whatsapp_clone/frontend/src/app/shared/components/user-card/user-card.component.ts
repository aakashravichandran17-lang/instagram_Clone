import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-card',
  template: `
    <div class="card p-3 d-flex align-items-center gap-3">
      <app-avatar
        [image]="user.profileImage"
        [name]="user.fullName"
        size="md"
      ></app-avatar>
      <div class="flex-grow-1 min-width-0">
        <a [routerLink]="['/profile', user.username]" class="fw-semibold text-decoration-none text-truncate d-block" style="color: var(--text)">
          {{ user.fullName }}
        </a>
        <small class="text-muted">@{{ user.username }}</small>
        <p class="mb-0 text-muted small text-truncate" *ngIf="user.bio">{{ user.bio }}</p>
      </div>
      <app-follow-button
        *ngIf="showFollowButton"
        [isFollowing]="user.isFollowing || false"
        (follow)="onFollow()"
        (unfollow)="onUnfollow()"
      ></app-follow-button>
    </div>
  `,
  styles: [`
    .min-width-0 { min-width: 0; }
  `]
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() showFollowButton = true;
  @Output() follow = new EventEmitter<string>();
  @Output() unfollow = new EventEmitter<string>();

  onFollow(): void {
    this.follow.emit(this.user.id);
  }

  onUnfollow(): void {
    this.unfollow.emit(this.user.id);
  }
}
