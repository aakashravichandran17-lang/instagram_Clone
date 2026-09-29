import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SocketService } from '../../../services/socket.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private socketService: SocketService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30),
            Validators.pattern(/^[a-zA-Z0-9_]+$/)
          ]
        ],
        fullName: ['', [Validators.required, Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        profileImage: ['']
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { username, fullName, email, password, confirmPassword, profileImage } =
      this.registerForm.value;

    this.authService
      .register({ username, fullName, email, password, confirmPassword, profileImage })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.toastService.success(response.message);
          this.socketService.connect();
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.toastService.error(error.error?.message || 'Registration failed. Please try again.');
        }
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
