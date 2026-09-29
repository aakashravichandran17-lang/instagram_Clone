import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  saving = false;
  currentUser: User | null = null;
  darkMode = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.darkMode = localStorage.getItem('darkMode') === 'true';

    this.profileForm = this.fb.group({
      fullName: [this.currentUser?.fullName || '', [Validators.required, Validators.maxLength(50)]],
      bio: [this.currentUser?.bio || '', [Validators.maxLength(160)]],
      profileImage: [this.currentUser?.profileImage || '']
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const { fullName, bio, profileImage } = this.profileForm.value;

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
  }
}
