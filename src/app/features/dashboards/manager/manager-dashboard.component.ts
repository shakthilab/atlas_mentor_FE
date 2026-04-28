import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-card">
      <div class="card-header">
        <h2 class="card-title">Manager Hub</h2>
      </div>
      <p>Welcome to your management dashboard, {{ ($any(authService.currentUser$ | async))?.name }}!</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
        <div class="stat-card" style="background: var(--dash-primary-light); padding: 1.5rem; border-radius: 12px;">
          <div style="font-size: 0.75rem; color: var(--dash-primary); font-weight: 700; text-transform: uppercase;">Team Size</div>
          <div style="font-size: 1.5rem; font-weight: 700;">24 Members</div>
        </div>
        <div class="stat-card" style="background: #fdf2f8; padding: 1.5rem; border-radius: 12px;">
          <div style="font-size: 0.75rem; color: #db2777; font-weight: 700; text-transform: uppercase;">Active Projects</div>
          <div style="font-size: 1.5rem; font-weight: 700;">8 Projects</div>
        </div>
      </div>
    </div>
  `
})
export class ManagerDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);
}
