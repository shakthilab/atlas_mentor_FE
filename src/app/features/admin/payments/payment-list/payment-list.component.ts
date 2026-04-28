import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">Payment Tracking</h1>
          <p class="page-subtitle">Manage student fees, referral commissions, and approvals.</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher mr-3">
            <button class="switcher-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="List View">
              <span class="material-icons">list</span>
            </button>
            <button class="switcher-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Card View">
              <span class="material-icons">grid_view</span>
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

      <div class="empty-state-container" *ngIf="payments.length === 0">
        <div class="empty-state-content">
          <span class="material-icons empty-icon">payments</span>
          <h3>No Payments Found</h3>
          <p>There are currently no payments recorded. Record your first payment to get started.</p>
        </div>
      </div>

      <!-- Payment Table Card -->
      <div class="table-card" *ngIf="payments.length > 0 && viewMode === 'list'">
        <div class="table-card-header">
          <div class="table-header-title">
            <h2>Recent transactions</h2>
            <span class="count-badge">{{ payments.length }} txns</span>
          </div>
          <button class="btn-icon">
            <span class="material-icons">more_vert</span>
          </button>
        </div>

        <div style="overflow-x: auto;">
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
                  <span class="tx-id">{{ payment.id }}</span>
                </td>
                <td>
                  <div class="user-info">
                    <div class="avatar">{{ payment.user.charAt(0) }}</div>
                    <span>{{ payment.user }}</span>
                  </div>
                </td>
                <td>
                  <span class="category-tag">{{ payment.category }}</span>
                </td>
                <td class="amount-cell">{{ payment.amount | currency }}</td>
                <td>{{ payment.method }}</td>
                <td>
                  <span class="status-badge" [ngClass]="payment.status.toLowerCase()">
                    {{ payment.status }}
                  </span>
                </td>
                <td>{{ payment.date }}</td>
                <td style="text-align: right;">
                  <button class="btn-icon">
                    <span class="material-icons">visibility</span>
                  </button>
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
      <div class="grid-container-wrapper" *ngIf="payments.length > 0 && viewMode === 'grid'">
        <div class="grid-container">
          <div class="payment-card shadow-premium" *ngFor="let payment of payments | slice:0:displayedCardsCount">
            <div class="card-header">
              <div class="user-info-grid">
                <div class="avatar">{{ payment.user.charAt(0) }}</div>
                <div class="details">
                  <span class="name">{{ payment.user }}</span>
                  <span class="tx-id">{{ payment.id }}</span>
                </div>
              </div>
              <span class="status-badge" [ngClass]="payment.status.toLowerCase()">
                {{ payment.status }}
              </span>
            </div>
            
            <div class="card-body">
              <div class="metrics-grid">
                <div class="metric-box">
                  <span class="label">Amount</span>
                  <span class="value amount-cell">{{ payment.amount | currency }}</span>
                </div>
                <div class="metric-box">
                  <span class="label">Category</span>
                  <span class="value category-tag">{{ payment.category }}</span>
                </div>
              </div>
              <div class="info-row">
                <span class="material-icons">payment</span>
                <span>{{ payment.method }}</span>
              </div>
            </div>
            
            <div class="card-footer">
              <span class="date">{{ payment.date }}</span>
              <button class="btn-icon">
                <span class="material-icons">visibility</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="load-more-container" *ngIf="payments.length > displayedCardsCount">
          <button class="btn btn-secondary load-more-btn" (click)="loadMoreCards()">
            <span>Load More Transactions</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .module-container { padding-bottom: 2rem; }
    .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .page-subtitle { color: var(--color-gray-600); margin: 0.25rem 0 0; font-size: 1rem; }

    .empty-state-container { padding: 4rem 2rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--color-gray-300); text-align: center; display: flex; justify-content: center; align-items: center; margin-bottom: 2rem; }
    .empty-state-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .empty-icon { font-size: 3rem; color: var(--color-gray-300); margin-bottom: 0.5rem; }
    .empty-state-content h3 { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-800); margin: 0; }
    .empty-state-content p { color: var(--color-gray-500); margin: 0; font-size: 0.875rem; max-width: 300px; }


    /* Stats Grid */
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
    .stat-mini-card { background: white; padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-sm); }
    .stat-mini-card .label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-gray-500); letter-spacing: 0.05em; }
    .stat-mini-card .value { font-size: 1.75rem; font-weight: 600; color: var(--color-gray-900); }
    .stat-mini-card .value.orange { color: #f79009; }
    .stat-mini-card .value.red { color: #f04438; }

    /* Filters */
    .filters-card { background: white; padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; box-shadow: var(--shadow-sm); }
    .search-bar { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid var(--color-gray-300); padding: 0.625rem 0.875rem; border-radius: var(--radius-md); flex: 1; box-shadow: var(--shadow-xs); transition: all var(--transition-fast); }
    .search-bar:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-light); }
    .search-bar input { background: none; border: none; width: 100%; font-size: 0.95rem; color: var(--color-gray-900); outline: none; }
    .search-bar .material-icons { color: var(--color-gray-400); font-size: 20px; }
    
    .filter-actions { display: flex; gap: 0.75rem; }
    .filter-select { background: white; border: 1px solid var(--color-gray-300); padding: 0.625rem 0.875rem; border-radius: var(--radius-md); color: var(--color-gray-700); font-weight: 500; font-size: 0.875rem; outline: none; box-shadow: var(--shadow-xs); transition: all var(--transition-fast); }
    .filter-select:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-light); }


    /* Table */
    /* Handled by global styles */
    
    .tx-id { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-600); background: var(--color-gray-100); padding: 0.125rem 0.375rem; border-radius: 4px; border: 1px solid var(--color-gray-200); }
    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.75rem; border: 1px solid var(--color-primary-border); }
    .category-tag { background: var(--color-gray-100); color: var(--color-gray-700); padding: 0.125rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; border: 1px solid var(--color-gray-200); }
    .amount-cell { font-weight: 600; color: var(--color-gray-900); }
    
    .status-badge { padding: 0.125rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; display: inline-flex; border: 1px solid transparent; }
    .status-badge.paid { background: #ecfdf3; color: #027a48; border-color: #abefc6; }
    .status-badge.pending { background: #fffaeb; color: #b54708; border-color: #fede87; }
    .status-badge.rejected { background: #fef3f2; color: #b42318; border-color: #fecdca; }


    /* View Switcher */
    .view-switcher { display: flex; background: var(--color-gray-100); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-200); }
    .switcher-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--color-gray-500); cursor: pointer; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
    .switcher-btn .material-icons { font-size: 20px; }
    .switcher-btn:hover { color: var(--color-gray-700); }
    .switcher-btn.active { background: white; color: var(--color-gray-700); box-shadow: var(--shadow-sm); }

    /* Grid Layout */
    .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .payment-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); overflow: hidden; display: flex; flex-direction: column; transition: all var(--transition-fast); box-shadow: var(--shadow-sm); }
    .payment-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--color-primary); }
    .card-header { padding: 1.25rem; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--color-gray-100); }
    .user-info-grid { display: flex; align-items: center; gap: 0.75rem; }
    .details { display: flex; flex-direction: column; gap: 0.25rem; }
    .name { font-weight: 500; color: var(--color-gray-900); }
    .card-body { padding: 1.25rem; flex: 1; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
    .metric-box { background: var(--color-gray-50); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--color-gray-100); display: flex; flex-direction: column; }
    .metric-box .label { font-size: 0.7rem; text-transform: uppercase; color: var(--color-gray-500); font-weight: 700; margin-bottom: 4px; }
    .metric-box .value { font-size: 1rem; font-weight: 600; color: var(--color-gray-900); }
    .info-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--color-gray-600); }
    .info-row .material-icons { font-size: 18px; color: var(--color-gray-400); }
    .card-footer { padding: 1rem 1.25rem; background: var(--color-gray-50); border-top: 1px solid var(--color-gray-100); display: flex; justify-content: space-between; align-items: center; }
    .date { font-size: 0.75rem; color: var(--color-gray-500); }

    .load-more-container { display: flex; justify-content: center; margin-top: 2.5rem; padding-bottom: 1rem; }
    .load-more-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-weight: 600; }

    @media (max-width: 1024px) {
      .header-actions { width: 100%; justify-content: space-between; }
      .module-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .desktop-only { display: none !important; }
      .stats-grid { grid-template-columns: 1fr; }
      .premium-table th:nth-child(4), .premium-table td:nth-child(4),
      .premium-table th:nth-child(5), .premium-table td:nth-child(5) { display: none; }
    }
  `]
})
export class PaymentListComponent {
  searchQuery = '';
  filterStatus = '';
  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;

  loadMoreCards() {
    this.displayedCardsCount += 10;
  }

  payments = [
    { id: 'TX-9921', user: 'Mukul Sharma', category: 'Tuition Fee', amount: 4500, method: 'Swift/Wire', status: 'Paid', date: '12 Apr 2024' },
    { id: 'TX-9922', user: 'Priya Rai', category: 'Consultation', amount: 250, method: 'Stripe', status: 'Pending', date: '11 Apr 2024' },
    { id: 'TX-9923', user: 'Global Partners', category: 'Commission', amount: 800, method: 'Bank Transfer', status: 'Pending', date: '10 Apr 2024' },
    { id: 'TX-9924', user: 'Amit Kumar', category: 'Visa Fee', amount: 150, method: 'UPI', status: 'Paid', date: '08 Apr 2024' }
  ];
}
