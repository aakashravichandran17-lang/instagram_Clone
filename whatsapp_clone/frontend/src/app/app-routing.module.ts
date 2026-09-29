import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/landing/landing.module').then((m) => m.LandingModule)
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/auth/login/login.module').then((m) => m.LoginModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./pages/auth/register/register.module').then((m) => m.RegisterModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:username',
    loadChildren: () =>
      import('./pages/profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'messages',
    loadChildren: () =>
      import('./pages/messages/messages.module').then((m) => m.MessagesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'messages/:conversationId',
    loadChildren: () =>
      import('./pages/messages/messages.module').then((m) => m.MessagesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./pages/notifications/notifications.module').then(
        (m) => m.NotificationsModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'explore',
    loadChildren: () =>
      import('./pages/explore/explore.module').then((m) => m.ExploreModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./pages/settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    loadChildren: () =>
      import('./pages/not-found/not-found.module').then((m) => m.NotFoundModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
