import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RoleConfigService } from '../../../../core/services/role-config.service';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">{{ roleConfig.getRoleSpecificTitle('Payment Tracking') }}</h1>
          <p class="page-subtitle">{{ getRoleSpecificSubtitle() }}</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher mr-3">
            <button class="switcher-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="List View">
              <span class="material-icons">list</span>
              <span>List</span>
            </button>
            <button class="switcher-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Card View">
              <span class="material-icons">grid_view</span>
              <span>Grid</span>
            </button>
          </div>
          <button class="btn btn-primary">
            <span class="material-icons">add_card</span>
            Record Payment
          </button>
        </div>
      </div>

      <!-- Stats row for payments -->
      <div class="stats-grid">
        <div class="stat-mini-card">
          <span class="label">Total Collected</span>
          <span class="value">$48,250</span>
        </div>
        <div class="stat-mini-card">
          <span class="label">Pending Approval</span>
          <span class="value orange">14</span>
        </div>
        <div class="stat-mini-card">
          <span class="label">Payouts Due</span>
          <span class="value red">$12,400</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search by student or transaction ID..." [(ngModel)]="searchQuery">
        </div>
        <div class="filter-actions">
          <select class="filter-select" [(ngModel)]="filterStatus">
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button class="btn btn-secondary">
            <span class="material-icons">calendar_today</span>
            This Month
          </button>
        </div>
      </div>

      <app-empty-state 
        *ngIf="payments.length === 0"
        title="No Payments Found"
        message="There are currently no payments recorded. Record your first payment to get started."
        [showAction]="true"
        actionText="Record Payment"
        actionIcon="add_card">
      </app-empty-state>

      <!-- Payment Table Card -->
      <div class="table-card" *ngIf="payments.length > 0 && viewMode === 'list'">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th style="width: 40px;"><input type="checkbox"></th>
                <th>Transaction ID</th>
                <th>Student / User</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let payment of payments" class="clickable-row">
                <td><input type="checkbox"></td>
                <td>
                  <span class="tx-id" style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-600); background: var(--color-gray-100); padding: 0.125rem 0.375rem; border-radius: 4px; border: 1px solid var(--color-gray-200);">{{ payment.id }}</span>
                </td>
                <td>
                  <div class="entity-meta">
                    <div class="avatar-circle" [style.background]="getAvatarColor(payment.user)">
                      {{ getInitials(payment.user) }}
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ payment.user }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-status gray">{{ payment.category }}</span>
                </td>
                <td><span style="font-weight: 600; color: var(--color-gray-900);">{{ payment.amount | currency }}</span></td>
                <td>{{ payment.method }}</td>
                <td>
                  <span class="badge-status" [ngClass]="payment.status.toLowerCase() === 'paid' ? 'success' : (payment.status.toLowerCase() === 'pending' ? 'warning' : 'error')">
                    {{ payment.status }}
                  </span>
                </td>
                <td>{{ payment.date }}</td>
                <td style="text-align: right;">
                  <div class="action-btns">
                    <button class="btn-icon">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button class="btn-icon">
                      <span class="material-icons">more_vert</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="table-card-footer">
          <button class="pagination-btn" disabled>
            <span class="material-icons">arrow_back</span>
            Previous
          </button>
          
          <div class="pagination-pages">
            <button class="page-num active">1</button>
            <button class="page-num">2</button>
            <button class="page-num">3</button>
            <span class="page-dots">...</span>
            <button class="page-num">5</button>
          </div>

          <button class="pagination-btn">
            Next
            <span class="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
      <!-- Payment Grid View -->
      <div class="grid-container" *ngIf="payments.length > 0 && viewMode === 'grid'">
        <div class="table-card" *ngFor="let payment of payments | slice:0:displayedCardsCount" style="padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;">
            <div class="entity-meta">
              <div class="avatar-circle" [style.background]="getAvatarColor(payment.user)">
                {{ getInitials(payment.user) }}
              </div>
              <div class="entity-info">
                <span class="entity-name">{{ payment.user }}</span>
                <span class="entity-subtext" style="font-family: monospace;">{{ payment.id }}</span>
              </div>
            </div>
            <span class="badge-status" [ngClass]="payment.status.toLowerCase() === 'paid' ? 'success' : (payment.status.toLowerCase() === 'pending' ? 'warning' : 'error')">
              {{ payment.status }}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem; background: var(--color-gray-50); padding: 1rem; border-radius: 8px;">
            <div class="entity-info">
              <span class="entity-subtext">Amount</span>
              <span class="entity-name" style="color: var(--color-gray-900);">{{ payment.amount | currency }}</span>
            </div>
            <div class="entity-info">
              <span class="entity-subtext">Category</span>
              <span class="badge-status gray" style="align-self: flex-start; margin-top: 2px;">{{ payment.category }}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
            <div style="display: flex; align-items: center; gap: 6px; color: var(--color-gray-500); font-size: 0.75rem;">
              <span class="material-icons" style="font-size: 16px;">calendar_today</span>
              {{ payment.date }}
            </div>
            <button class="btn-icon">
              <span class="material-icons">visibility</span>
            </button>
          </div>
        </div>

        <!-- Load More Button -->
        <div *ngIf="payments.length > displayedCardsCount" style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 1rem;">
          <button class="btn btn-secondary" (click)="loadMoreCards()">
            <span>Load More Transactions</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-mini-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--color-gray-200); display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-sm); }
    .stat-mini-card .label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-gray-500); letter-spacing: 0.05em; }
    .stat-mini-card .value { font-size: 1.75rem; font-weight: 700; color: var(--color-gray-900); }
    .stat-mini-card .value.orange { color: #f79009; }
    .stat-mini-card .value.red { color: #f04438; }
  `]
})
export class PaymentListComponent {
  roleConfig = inject(RoleConfigService);
  searchQuery = '';
  filterStatus = '';
  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;

  loadMoreCards() {
    this.displayedCardsCount += 10;
  }

  getRoleSpecificSubtitle(): string {
    const role = this.roleConfig.getCurrentUserRole();
    switch (role) {
      case 'ADMIN':
        return 'Manage student fees, referral commissions, and approvals.';
      case 'MANAGER':
        return 'Manage payments for your branch.';
      case 'COMPANY':
        return 'Manage payments for your company referrals.';
      case 'REFERRAL':
        return 'Manage your referral commissions and payments.';
      case 'STUDENT':
        return 'View your payment history and pending fees.';
      default:
        return 'Manage payment information.';
    }
  }

  payments = [
    { id: 'TX-9921', user: 'Mukul Sharma', category: 'Tuition Fee', amount: 4500, method: 'Swift/Wire', status: 'Paid', date: '12 Apr 2024' },
    { id: 'TX-9922', user: 'Priya Rai', category: 'Consultation', amount: 250, method: 'Stripe', status: 'Pending', date: '11 Apr 2024' },
    { id: 'TX-9923', user: 'Global Partners', category: 'Commission', amount: 800, method: 'Bank Transfer', status: 'Pending', date: '10 Apr 2024' },
    { id: 'TX-9924', user: 'Amit Kumar', category: 'Visa Fee', amount: 150, method: 'UPI', status: 'Paid', date: '08 Apr 2024' }
  ];

  getInitials(name?: string): string {
    if (!name || name.trim() === '') return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getAvatarColor(name?: string): string {
    if (!name) return '#94a3b8'; // default gray
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa', '#e879f9', '#f43f5e'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
