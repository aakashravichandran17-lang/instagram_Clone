import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { UploadService } from '../../../services/upload.service';
import { ToastService } from '../../../services/toast.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

@Component({
  selector: 'app-image-upload',
  template: `
    <div class="image-upload">
      <input
        #fileInput
        type="file"
        accept="image/*"
        hidden
        (change)="onFileSelected($event)"
      />

      <!-- Preview state -->
      <div *ngIf="previewUrl" class="image-upload-preview">
        <img [src]="previewUrl" alt="Image preview" class="image-upload-img" />
        <div class="d-flex gap-2 mt-2">
          <button
            type="button"
            class="btn btn-outline btn-sm"
            (click)="triggerFileInput()"
            [disabled]="uploading"
          >
            <i class="bi bi-arrow-repeat"></i> Change Image
          </button>
          <button
            type="button"
            class="btn btn-outline-danger btn-sm"
            (click)="removeImage()"
            [disabled]="uploading"
          >
            <i class="bi bi-trash"></i> Remove
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <button
        *ngIf="!previewUrl"
        type="button"
        class="btn btn-outline"
        (click)="triggerFileInput()"
        [disabled]="uploading"
      >
        <i class="bi bi-image me-2"></i>Choose Image
      </button>

      <div *ngIf="uploading" class="mt-2 text-muted small">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Uploading...
      </div>
      <div class="form-text">JPG, PNG, WEBP or GIF. Max 5MB.</div>
    </div>
  `,
  styles: [
    `
      .image-upload-img {
        max-width: 100%;
        max-height: 220px;
        border-radius: var(--radius);
        border: 1px solid var(--border);
        object-fit: cover;
      }
    `
  ]
})
export class ImageUploadComponent implements OnInit, OnDestroy {
  /**
   * Existing image URL to display (e.g. current profile picture).
   */
  @Input() imageUrl = '';

  /**
   * When true, the file is uploaded immediately after selection and the
   * resulting URL is emitted via imageUrlChange. When false, the File is
   * held locally (with preview) and emitted via fileChange so the parent
   * can upload it later (e.g. together with a profile save).
   */
  @Input() uploadOnSelect = true;

  @Output() imageUrlChange = new EventEmitter<string>();
  @Output() fileChange = new EventEmitter<File | null>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  previewUrl = '';
  uploading = false;

  private objectUrl: string | null = null;
  private selectedFile: File | null = null;

  constructor(
    private uploadService: UploadService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.previewUrl = this.imageUrl || '';
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    // Reset the input so selecting the same file again triggers change
    input.value = '';

    if (!file) return;

    // Empty file validation
    if (file.size === 0) {
      this.toastService.error('The selected file is empty. Please choose a valid image.');
      return;
    }

    // File type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.toastService.error('Invalid file type. Please select a JPG, PNG, WEBP or GIF image.');
      return;
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      this.toastService.error('Image is too large. Maximum file size is 5MB.');
      return;
    }

    this.selectedFile = file;
    this.showPreview(file);

    if (this.uploadOnSelect) {
      this.uploadFile(file);
    } else {
      this.fileChange.emit(file);
    }
  }

  removeImage(): void {
    this.revokeObjectUrl();
    this.previewUrl = '';
    this.selectedFile = null;
    this.imageUrlChange.emit('');
    this.fileChange.emit(null);
  }

  /**
   * Uploads the currently selected file (used by parents that hold the
   * file locally, e.g. profile settings saving together with the form).
   */
  uploadSelectedFile(): Promise<string | null> {
    if (!this.selectedFile) {
      return Promise.resolve(this.imageUrl || null);
    }

    this.uploading = true;
    return new Promise((resolve) => {
      this.uploadService.uploadImage(this.selectedFile!).subscribe({
        next: (response) => {
          this.uploading = false;
          this.toastService.success('Image uploaded successfully!');
          const url = response.data.imageUrl;
          this.imageUrl = url;
          this.previewUrl = url;
          this.imageUrlChange.emit(url);
          resolve(url);
        },
        error: (error) => {
          this.uploading = false;
          this.toastService.error(error.error?.message || 'Failed to upload image');
          resolve(null);
        }
      });
    });
  }

  hasSelectedFile(): boolean {
    return this.selectedFile !== null;
  }

  private showPreview(file: File): void {
    this.revokeObjectUrl();
    this.objectUrl = URL.createObjectURL(file);
    this.previewUrl = this.objectUrl;
  }

  private uploadFile(file: File): void {
    this.uploading = true;

    this.uploadService.uploadImage(file).subscribe({
      next: (response) => {
        this.uploading = false;
        this.toastService.success('Image uploaded successfully!');
        this.imageUrl = response.data.imageUrl;
        this.previewUrl = response.data.imageUrl;
        this.imageUrlChange.emit(response.data.imageUrl);
      },
      error: (error) => {
        this.uploading = false;
        this.toastService.error(error.error?.message || 'Failed to upload image');
        // Revert the preview to the previous image
        this.revokeObjectUrl();
        this.previewUrl = this.imageUrl || '';
        this.selectedFile = null;
      }
    });
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }
}
