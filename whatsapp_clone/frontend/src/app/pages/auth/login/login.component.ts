import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SocketService } from '../../../services/socket.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private socketService: SocketService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastService.success(response.message);
        this.socketService.connect();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'Login failed. Please try again.');
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
