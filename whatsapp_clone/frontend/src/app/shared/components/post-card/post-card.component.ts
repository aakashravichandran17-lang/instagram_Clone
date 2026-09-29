import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../../../models/post.model';
import { AuthService } from '../../../services/auth.service';
import { PostService } from '../../../services/post.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-post-card',
  template: `
    <div class="post-card">
      <!-- Header -->
      <div class="d-flex align-items-center gap-3 p-3">
        <a [routerLink]="['/profile', post.author.username]">
          <app-avatar
            [image]="post.author.profileImage"
            [name]="post.author.fullName"
            size="md"
          ></app-avatar>
        </a>
        <div class="flex-grow-1">
          <a
            [routerLink]="['/profile', post.author.username]"
            class="fw-semibold text-decoration-none"
            style="color: var(--text)"
          >
            {{ post.author.fullName }}
          </a>
          <small class="text-muted d-block">@{{ post.author.username }} · {{ post.createdAt | timeAgo }}</small>
        </div>
        <div class="dropdown" *ngIf="isOwnPost">
          <button class="btn btn-ghost btn-icon" data-bs-toggle="dropdown">
            <i class="bi bi-three-dots"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <button class="dropdown-item text-danger" (click)="onDelete()">
                <i class="bi bi-trash me-2"></i>Delete
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Content -->
      <div class="px-3 pb-2">
        <p class="mb-0" style="white-space: pre-wrap">{{ post.content }}</p>
      </div>

      <!-- Image -->
      <img
        *ngIf="post.image"
        [src]="post.image"
        [alt]="post.content"
        class="post-image"
        (error)="onImageError($event)"
      />

      <!-- Actions -->
      <div class="d-flex align-items-center gap-4 px-3 py-2">
        <button
          class="btn btn-ghost btn-sm"
          [class.text-danger]="isLiked"
          (click)="toggleLike()"
        >
          <i class="bi" [class]="isLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
          {{ post.likes.length }}
        </button>
        <button class="btn btn-ghost btn-sm" (click)="toggleComments()">
          <i class="bi bi-chat"></i>
          {{ post.comments.length }}
        </button>
        <button class="btn btn-ghost btn-sm" (click)="sharePost()">
          <i class="bi bi-share"></i>
        </button>
      </div>

      <!-- Comments section -->
      <app-comment-section
        *ngIf="showComments"
        [post]="post"
        (commentAdded)="onCommentAdded($event)"
        (commentDeleted)="onCommentDeleted($event)"
      ></app-comment-section>
    </div>
  `,
  styles: []
})
export class PostCardComponent {
  @Input() post!: Post;
  @Output() postDeleted = new EventEmitter<string>();
  @Output() postUpdated = new EventEmitter<Post>();

  showComments = false;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private toastService: ToastService
  ) {}

  get isOwnPost(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === this.post.author.id;
  }

  get isLiked(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    return this.post.likes.some((id) => id === currentUser.id);
  }

  toggleLike(): void {
    if (this.isLiked) {
      this.postService.unlikePost(this.post._id).subscribe({
        next: (response) => {
          this.post.likes = this.post.likes.filter(
            (id) => id !== this.authService.getCurrentUser()?.id
          );
          this.postUpdated.emit(this.post);
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Failed to unlike post');
        }
      });
    } else {
      this.postService.likePost(this.post._id).subscribe({
        next: (response) => {
          this.post.likes.push(this.authService.getCurrentUser()?.id || '');
          this.postUpdated.emit(this.post);
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Failed to like post');
        }
      });
    }
  }

  toggleComments(): void {
    this.showComments = !this.showComments;
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(this.post._id).subscribe({
        next: () => {
          this.postDeleted.emit(this.post._id);
          this.toastService.success('Post deleted');
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Failed to delete post');
        }
      });
    }
  }

  onCommentAdded(comment: any): void {
    this.post.comments.push(comment);
    this.postUpdated.emit(this.post);
  }

  onCommentDeleted(commentId: string): void {
    this.post.comments = this.post.comments.filter((c) => c._id !== commentId);
    this.postUpdated.emit(this.post);
  }

  sharePost(): void {
    const url = `${window.location.origin}/post/${this.post._id}`;
    navigator.clipboard.writeText(url).then(() => {
      this.toastService.success('Link copied to clipboard!');
    });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
