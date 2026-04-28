import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-referral-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-card">
      <div class="card-header">
        <h2 class="card-title">Referral Earnings</h2>
      </div>
      <div style="display: flex; align-items: center; gap: 2rem;">
        <div style="flex: 1;">
          <div style="font-size: 0.75rem; color: var(--dash-text-muted); text-transform: uppercase;">Total Referrals</div>
          <div style="font-size: 2rem; font-weight: 700;">142</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 0.75rem; color: var(--dash-text-muted); text-transform: uppercase;">Total Commissions</div>
          <div style="font-size: 2rem; font-weight: 700; color: #22c55e;">$1,420.00</div>
        </div>
      </div>
    </div>
  `
})
export class ReferralDashboardComponent {
  authService = inject(AuthService);
}
