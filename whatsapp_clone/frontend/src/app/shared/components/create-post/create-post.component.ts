import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { PostService } from '../../../services/post.service';
import { ToastService } from '../../../services/toast.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-create-post',
  template: `
    <div class="card p-3">
      <form [formGroup]="postForm" (ngSubmit)="onSubmit()">
        <div class="d-flex gap-3">
          <app-avatar
            [image]="currentUser?.profileImage || ''"
            [name]="currentUser?.fullName || ''"
            size="md"
          ></app-avatar>
          <div class="flex-grow-1">
            <textarea
              class="form-control"
              rows="3"
              placeholder="What's on your mind?"
              formControlName="content"
              [class.is-invalid]="postForm.get('content')?.invalid && postForm.get('content')?.touched"
            ></textarea>
            <div
              class="invalid-feedback"
              *ngIf="postForm.get('content')?.invalid && postForm.get('content')?.touched"
            >
              Post content is required.
            </div>
          </div>
        </div>

        <div class="mt-2" *ngIf="showImageInput">
          <app-image-upload
            [imageUrl]="selectedImageUrl"
            [uploadOnSelect]="true"
            (imageUrlChange)="onImageChange($event)"
          ></app-image-upload>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            (click)="toggleImageInput()"
          >
            <i class="bi bi-image"></i>
            Photo
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="postForm.invalid || loading"
          >
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="bi bi-send" *ngIf="!loading"></i>
            Post
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class CreatePostComponent implements OnInit {
  @Output() postCreated = new EventEmitter<Post>();

  postForm!: FormGroup;
  loading = false;
  showImageInput = false;
  selectedImageUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private postService: PostService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.postForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(2000)]],
      image: ['']
    });
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  toggleImageInput(): void {
    this.showImageInput = !this.showImageInput;
    if (!this.showImageInput) {
      this.selectedImageUrl = '';
      this.postForm.patchValue({ image: '' });
    }
  }

  onImageChange(url: string): void {
    this.selectedImageUrl = url;
    this.postForm.patchValue({ image: url });
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.toastService.warning('Post content is required.');
      return;
    }

    this.loading = true;
    const { content, image } = this.postForm.value;

    this.postService.createPost({ content, image: image || '' }).subscribe({
      next: (response) => {
        this.postCreated.emit(response.data.post);
        this.postForm.reset();
        this.selectedImageUrl = '';
        this.showImageInput = false;
        this.loading = false;
        this.toastService.success('Post created successfully!');
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'Failed to create post');
      }
    });
  }
}
