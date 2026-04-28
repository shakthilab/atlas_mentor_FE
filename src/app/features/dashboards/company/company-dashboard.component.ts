import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-card">
      <div class="card-header">
        <h2 class="card-title">Company Profile</h2>
      </div>
      <div *ngIf="authService.currentUser$ | async as user">
        <div style="padding: 1rem; background: var(--dash-bg-app); border-radius: 12px; border: 1px dashed var(--dash-border);">
           <h3 style="margin: 0; font-size: 1.25rem;">{{ $any(user).name }}</h3>
           <p style="color: var(--dash-text-muted); margin-top: 0.5rem;">Corporate Account Dashboard</p>
        </div>
      </div>
    </div>
  `
})
export class CompanyDashboardComponent {
  authService = inject(AuthService);
}
