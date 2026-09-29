import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center">
      <div class="text-center p-5">
        <h1 class="display-1 fw-bold text-gradient">404</h1>
        <h3 class="fw-bold mb-3">Page Not Found</h3>
        <p class="text-muted mb-4">The page you are looking for does not exist or has been moved.</p>
        <a routerLink="/" class="btn btn-primary btn-lg">
          <i class="bi bi-house-door me-2"></i>Go Home
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class NotFoundComponent {}
