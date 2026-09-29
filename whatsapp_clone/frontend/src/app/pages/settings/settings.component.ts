import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.model';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @ViewChild('imageUpload') imageUpload!: ImageUploadComponent;

  profileForm!: FormGroup;
  loading = false;
  saving = false;
  currentUser: User | null = null;
  darkMode = false;
  currentImageUrl = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.currentImageUrl = this.currentUser?.profileImage || '';

    this.profileForm = this.fb.group({
      fullName: [this.currentUser?.fullName || '', [Validators.required, Validators.maxLength(50)]],
      bio: [this.currentUser?.bio || '', [Validators.maxLength(160)]]
    });
  }

  onProfileImageChange(url: string): void {
    this.currentImageUrl = url;
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toastService.warning('Please fix the errors in the form.');
      return;
    }

    this.saving = true;

    try {
      // Upload a newly selected image first, then update the profile
      if (this.imageUpload.hasSelectedFile()) {
        const uploadedImageUrl = await this.imageUpload.uploadSelectedFile();
        if (!uploadedImageUrl) {
          // Upload failed — error toast already shown by the upload component
          this.saving = false;
          return;
        }
      }

      const { fullName, bio } = this.profileForm.value;
      const profileImage = this.currentImageUrl;

      this.userService.updateProfile({ fullName, bio, profileImage }).subscribe({
        next: (response) => {
          this.saving = false;
          this.currentUser = response.data.user;
          // Update stored user
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.authService.updateCurrentUser(response.data.user);
          this.toastService.success('Profile updated successfully!');
        },
        error: (error) => {
          this.saving = false;
          this.toastService.error(error.error?.message || 'Failed to update profile');
        }
      });
    } catch {
      this.saving = false;
      this.toastService.error('Failed to update profile. Please try again.');
    }
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    if (this.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastService.success('Logged out successfully!');
  }
}
