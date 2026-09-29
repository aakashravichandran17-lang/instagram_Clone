import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-follow-button',
  template: `
    <button
      *ngIf="!isFollowing"
      class="btn btn-primary btn-sm"
      (click)="onFollow()"
      [disabled]="loading"
    >
      <i class="bi bi-person-plus"></i>
      Follow
    </button>
    <button
      *ngIf="isFollowing"
      class="btn btn-outline btn-sm"
      (click)="onUnfollow()"
      [disabled]="loading"
    >
      <i class="bi bi-person-check"></i>
      Following
    </button>
  `,
  styles: []
})
export class FollowButtonComponent {
  @Input() isFollowing = false;
  @Input() loading = false;
  @Output() follow = new EventEmitter<void>();
  @Output() unfollow = new EventEmitter<void>();

  onFollow(): void {
    this.follow.emit();
  }

  onUnfollow(): void {
    this.unfollow.emit();
  }
}
