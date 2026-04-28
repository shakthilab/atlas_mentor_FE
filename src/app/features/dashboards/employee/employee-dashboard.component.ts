import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-card">
      <div class="card-header">
        <h2 class="card-title">Employee Overview</h2>
      </div>
      <div *ngIf="authService.currentUser$ | async as user">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
          <div class="info-block">
            <label style="display: block; font-size: 0.75rem; color: var(--dash-text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Role</label>
            <div style="font-weight: 600;">{{ $any(user).role }}</div>
          </div>
          <div class="info-block" *ngIf="$any(user).employeeType">
            <label style="display: block; font-size: 0.75rem; color: var(--dash-text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Specialization</label>
            <div style="font-weight: 600;">{{ $any(user).employeeType }}</div>
          </div>
          <div class="info-block">
            <label style="display: block; font-size: 0.75rem; color: var(--dash-text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Status</label>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="status-dot" style="background: #22c55e;"></span>
              <span style="font-weight: 600;">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
  `]
})
export class EmployeeDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
