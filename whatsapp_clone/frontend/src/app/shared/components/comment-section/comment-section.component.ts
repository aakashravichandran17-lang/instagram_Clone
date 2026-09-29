import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Post } from '../../../models/post.model';
import { AuthService } from '../../../services/auth.service';
import { PostService } from '../../../services/post.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-comment-section',
  template: `
    <div class="border-top px-3 py-2">
      <!-- Comment list -->
      <div *ngFor="let comment of post.comments" class="d-flex gap-2 mb-2">
        <app-avatar
          [image]="comment.author.profileImage"
          [name]="comment.author.fullName"
          size="xs"
        ></app-avatar>
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2">
            <small class="fw-semibold">{{ comment.author.fullName }}</small>
            <small class="text-muted">{{ comment.createdAt | timeAgo }}</small>
            <button
              *ngIf="isCommentAuthor(comment)"
              class="btn btn-link btn-sm p-0 text-danger"
              (click)="deleteComment(comment._id)"
            >
              <i class="bi bi-trash small"></i>
            </button>
          </div>
          <p class="mb-0 small">{{ comment.content }}</p>
        </div>
      </div>

      <div *ngIf="post.comments.length === 0" class="text-muted small py-2">
        No comments yet. Be the first to comment!
      </div>

      <!-- Add comment form -->
      <form [formGroup]="commentForm" (ngSubmit)="onSubmit()" class="d-flex gap-2 mt-2">
        <app-avatar
          [image]="currentUser?.profileImage || ''"
          [name]="currentUser?.fullName || ''"
          size="xs"
        ></app-avatar>
        <input
          type="text"
          class="form-control form-control-sm"
          placeholder="Write a comment..."
          formControlName="content"
        />
        <button
          type="submit"
          class="btn btn-primary btn-sm"
          [disabled]="commentForm.invalid || loading"
        >
          <i class="bi bi-send"></i>
        </button>
      </form>
    </div>
  `,
  styles: []
})
export class CommentSectionComponent {
  @Input() post!: Post;
  @Output() commentAdded = new EventEmitter<any>();
  @Output() commentDeleted = new EventEmitter<string>();

  commentForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private postService: PostService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  isCommentAuthor(comment: any): boolean {
    return comment.author._id === this.currentUser?.id;
  }

  onSubmit(): void {
    if (this.commentForm.invalid) {
      this.toastService.warning('Comment cannot be empty.');
      return;
    }

    this.loading = true;
    const content = this.commentForm.value.content;

    this.postService.addComment(this.post._id, content).subscribe({
      next: (response) => {
        this.commentAdded.emit(response.data.comment);
        this.commentForm.reset();
        this.loading = false;
        this.toastService.success('Comment added');
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'Failed to add comment');
      }
    });
  }

  deleteComment(commentId: string): void {
    this.postService.deleteComment(commentId).subscribe({
      next: () => {
        this.commentDeleted.emit(commentId);
        this.toastService.success('Comment deleted');
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to delete comment');
      }
    });
  }
}
