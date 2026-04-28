import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './core/components/notification/notification.component';
import { GlobalLoadingComponent } from './shared/components/global-loading/global-loading.component';
import { SessionExpiredPopupComponent } from './shared/components/session-expired-popup/session-expired-popup.component';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent, SessionExpiredPopupComponent, GlobalLoadingComponent, CommonModule],
  template: `
    <router-outlet></router-outlet>
    <app-notification></app-notification>
    <app-global-loading></app-global-loading>
    <app-session-expired-popup 
      *ngIf="authService.sessionExpired$ | async"
      (onLogin)="handleLogout()"
    ></app-session-expired-popup>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Atlas-Mentor-FE';
  authService = inject(AuthService);

  handleLogout() {
    this.authService.logout();
  }
}
