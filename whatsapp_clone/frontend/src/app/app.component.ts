import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
  `
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    // Connect socket when user is logged in
    if (this.authService.isLoggedIn()) {
      this.socketService.connect();
    }

    // Scroll to top on route change
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0);
      });
  }
}
