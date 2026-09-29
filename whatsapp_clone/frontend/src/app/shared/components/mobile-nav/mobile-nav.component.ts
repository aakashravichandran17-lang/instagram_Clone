import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mobile-nav',
  template: `
    <nav
      class="fixed-bottom d-lg-none d-flex justify-content-around align-items-center py-2"
      style="background: var(--card); border-top: 1px solid var(--border); z-index: 1000;"
    >
      <a
        class="nav-link-custom flex-column"
        routerLink="/dashboard"
        routerLinkActive="active"
      >
        <i class="bi bi-house-door fs-5"></i>
        <small>Home</small>
      </a>
      <a
        class="nav-link-custom flex-column"
        routerLink="/explore"
        routerLinkActive="active"
      >
        <i class="bi bi-compass fs-5"></i>
        <small>Explore</small>
      </a>
      <a
        class="nav-link-custom flex-column"
        routerLink="/messages"
        routerLinkActive="active"
      >
        <i class="bi bi-chat-dots fs-5"></i>
        <small>Chat</small>
      </a>
      <a
        class="nav-link-custom flex-column"
        routerLink="/notifications"
        routerLinkActive="active"
      >
        <i class="bi bi-bell fs-5"></i>
        <small>Alerts</small>
      </a>
      <a
        class="nav-link-custom flex-column"
        [routerLink]="['/profile', currentUser?.username]"
        routerLinkActive="active"
      >
        <i class="bi bi-person fs-5"></i>
        <small>Profile</small>
      </a>
    </nav>
  `,
  styles: [`
    .nav-link-custom {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 4px 8px;
      border-radius: var(--radius);
      color: var(--text-muted);
      font-size: 0.7rem;
      text-decoration: none;
    }
    .nav-link-custom.active {
      color: var(--primary);
    }
  `]
})
export class MobileNavComponent {
  currentUser: any;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }
}
