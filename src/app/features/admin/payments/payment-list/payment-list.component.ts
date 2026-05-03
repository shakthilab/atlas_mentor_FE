import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RoleConfigService } from '../../../../core/services/role-config.service';
import { StudentService } from '../../../../core/services/student.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { DatePipe } from '@angular/common';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { PaymentDetailPanelComponent } from '../payment-detail-panel/payment-detail-panel.component';
import { BranchService } from '../../../../core/services/branch.service';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent, PaymentFormComponent, PaymentDetailPanelComponent],
  providers: [DatePipe],
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
          <button class="btn btn-primary" (click)="openRecordPaymentModal()" *ngIf="isAdminOrManager()">
            <span class="material-icons">add_card</span>
            Record Payment
          </button>
        </div>
      </div>

      <!-- Stats row for payments -->
      <div class="stats-grid">
        <!-- Admin/Manager Stats -->
        <ng-container *ngIf="isAdminOrManager()">
          <div class="stat-mini-card">
            <span class="label">Total Assigned</span>
            <span class="value">{{ dashboardStats.totalAssigned | currency }}</span>
          </div>
          <div class="stat-mini-card">
            <span class="label">Total Paid</span>
            <span class="value success">{{ dashboardStats.totalPaid | currency }}</span>
          </div>
          <div class="stat-mini-card">
            <span class="label">Total Pending</span>
            <span class="value orange">{{ dashboardStats.totalPending | currency }}</span>
          </div>
          <div class="stat-mini-card">
            <span class="label">Pending Approvals</span>
            <span class="value yellow">{{ dashboardStats.pendingApprovals }}</span>
          </div>
          <div class="stat-mini-card">
            <span class="label">Disputes</span>
            <span class="value red">{{ dashboardStats.disputes }}</span>
          </div>
        </ng-container>

        <!-- Referral/Company Stats -->
        <ng-container *ngIf="!isAdminOrManager()">
          <div class="stat-mini-card">
            <span class="label">Total Students</span>
            <span class="value">{{ payments.length }}</span>
          </div>
          <div class="stat-mini-card">
            <span class="label">Total Earnings</span>
            <span class="value">{{ dashboardStats.totalEarnings | currency }}</span>
          </div>
          <div class="stat-mini-card">
            <span class="label">Paid Amount</span>
            <span class="value success">{{ dashboardStats.totalPaid | currency }}</span>
          </div>
          <div class="stat-mini-card">
            <span class="label">Pending Amount</span>
            <span class="value orange">{{ dashboardStats.totalPending | currency }}</span>
          </div>
          <div class="stat-mini-card">
            <span class="label">Approval Requests</span>
            <span class="value yellow">{{ dashboardStats.pendingApprovals }}</span>
          </div>
        </ng-container>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search by student, source or ID..." [(ngModel)]="searchQuery">
        </div>
        <div class="filter-actions">
          <!-- Admin/Manager Only Filters -->
          <ng-container *ngIf="isAdminOrManager()">
            <select class="filter-select" [(ngModel)]="filterSourceType" *ngIf="roleConfig.getCurrentUserRole() === 'ADMIN'">
              <option value="">All Source Types</option>
              <option value="Referral">Referral</option>
              <option value="Company">Company</option>
              <option value="Direct">Direct</option>
            </select>
            <select class="filter-select" [(ngModel)]="filterBranch" *ngIf="roleConfig.getCurrentUserRole() === 'ADMIN'">
              <option value="">All Branches</option>
              <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
            </select>
          </ng-container>

          <select class="filter-select" [(ngModel)]="filterStatus">
            <option value="">Payment Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PENDING">Pending</option>
            <option value="DISPUTED">Disputed</option>
          </select>

          <select class="filter-select" [(ngModel)]="filterApprovalStatus">
            <option value="">Approval Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button class="btn btn-secondary">
            <span class="material-icons">calendar_today</span>
            This Month
          </button>
        </div>
      </div>

      <app-empty-state 
        *ngIf="payments.length === 0 && !loading"
        title="No Payments Found"
        message="There are currently no payments recorded for referred students."
        [showAction]="false">
      </app-empty-state>

      <div class="loading-overlay" *ngIf="loading" style="display: flex; justify-content: center; padding: 3rem;">
        <div class="loader"></div>
      </div>

      <!-- Payment Table Card -->
      <div class="table-card" *ngIf="payments.length > 0 && viewMode === 'list'">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th style="width: 40px;"><input type="checkbox"></th>
                <th>Student Name</th>
                <th>Source</th>
                <th>Assigned | Paid | Balance</th>
                <th>Student Status</th>
                <th>Payment Status</th>
                <th>Approval</th>
                <th>Date</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let payment of filteredPayments" class="clickable-row" (click)="openDetailPanel(payment)">
                <td><input type="checkbox" (click)="$event.stopPropagation()"></td>
                <td>
                  <div class="entity-meta">
                    <div class="avatar-circle" [style.background]="getAvatarColor(payment.user)">
                      {{ getInitials(payment.user) }}
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ payment.user }}</span>
                      <span class="entity-subtext">{{ payment.category }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="source-info">
                    <span class="badge-status gray">{{ payment.sourceType }}</span>
                    <span class="source-name">{{ payment.sourceName }}</span>
                  </div>
                </td>
                <td>
                  <div class="amount-stack">
                    <span class="amt-assigned">{{ payment.assignedAmount | currency }}</span>
                    <div class="amt-breakdown">
                      <span class="amt-paid success">{{ payment.paidAmount | currency }}</span>
                      <span class="amt-sep">|</span>
                      <span class="amt-balance orange">{{ payment.balanceAmount | currency }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-status gray">{{ payment.studentStatus }}</span>
                </td>
                <td>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span class="badge-status" [ngClass]="getStatusClass(payment.status)">
                      {{ payment.status }}
                    </span>
                    <span class="badge-status error" *ngIf="payment.status === 'DISPUTED'">DISPUTE</span>
                  </div>
                </td>
                <td>
                  <span class="badge-status" [ngClass]="getApprovalStatusClass(payment.approvalStatus)">
                    {{ payment.approvalStatus }}
                  </span>
                </td>
                <td>{{ payment.date }}</td>
                <td style="text-align: right;" (click)="$event.stopPropagation()">
                  <div class="action-btns">
                    <!-- Admin Actions -->
                    <ng-container *ngIf="isAdminOrManager()">
                      <button class="btn-icon" (click)="openRecordPaymentModal(payment.id)" title="Edit/Record">
                        <span class="material-icons">edit</span>
                      </button>
                      <button class="btn-icon" style="color: var(--color-error);" (click)="rejectPayment(payment.id)" title="Reject Student" *ngIf="payment.approvalStatus === 'PENDING'">
                        <span class="material-icons">person_remove</span>
                      </button>
                    </ng-container>

                    <!-- Referral/Company Actions -->
                    <ng-container *ngIf="!isAdminOrManager()">
                      <button class="btn-icon" (click)="openDetailPanel(payment)" title="View Details">
                        <span class="material-icons">visibility</span>
                      </button>
                    </ng-container>
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
      <div class="grid-container" *ngIf="filteredPayments.length > 0 && viewMode === 'grid'">
        <div class="table-card card-hover" *ngFor="let payment of filteredPayments | slice:0:displayedCardsCount" style="padding: 1.25rem;" (click)="openDetailPanel(payment)">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;">
            <div class="entity-meta">
              <div class="avatar-circle" [style.background]="getAvatarColor(payment.user)">
                {{ getInitials(payment.user) }}
              </div>
              <div class="entity-info">
                <span class="entity-name">{{ payment.user }}</span>
                <span class="entity-subtext">{{ payment.sourceName }} · {{ payment.sourceType }}</span>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
              <span class="badge-status" [ngClass]="getStatusClass(payment.status)">
                {{ payment.status }}
              </span>
              <span class="badge-status" [ngClass]="getApprovalStatusClass(payment.approvalStatus)" style="font-size: 0.65rem;">
                {{ payment.approvalStatus }}
              </span>
            </div>
          </div>
          
          <div class="payment-card-grid">
            <div class="payment-card-item">
              <span class="label">Assigned</span>
              <span class="val">{{ payment.assignedAmount | currency }}</span>
            </div>
            <div class="payment-card-item">
              <span class="label">Paid</span>
              <span class="val success">{{ payment.paidAmount | currency }}</span>
            </div>
            <div class="payment-card-item">
              <span class="label">Balance</span>
              <span class="val orange">{{ payment.balanceAmount | currency }}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100); margin-top: 1rem;">
            <div style="display: flex; align-items: center; gap: 6px; color: var(--color-gray-500); font-size: 0.75rem;">
              <span class="material-icons" style="font-size: 16px;">calendar_today</span>
              {{ payment.date }}
            </div>
            <div class="action-btns" (click)="$event.stopPropagation()">
              <button class="btn-icon" *ngIf="isAdminOrManager()" (click)="openRecordPaymentModal(payment.id)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-icon" (click)="openDetailPanel(payment)">
                <span class="material-icons">visibility</span>
              </button>
            </div>
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

      <!-- Payment Form Modal -->
      <app-payment-form 
        *ngIf="showPaymentModal" 
        [paymentId]="selectedPaymentId"
        (onClose)="closePaymentModal()"
        (onSuccess)="onPaymentSuccess()">
      </app-payment-form>

      <!-- Payment Detail Side Panel -->
      <app-payment-detail-panel
        *ngIf="showDetailPanel"
        [payment]="selectedPayment"
        (close)="closeDetailPanel()"
        (actionTriggered)="handleDetailAction($event)">
      </app-payment-detail-panel>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-mini-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--color-gray-200); display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-sm); }
    .stat-mini-card .label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-gray-500); letter-spacing: 0.05em; }
    .stat-mini-card .value { font-size: 1.5rem; font-weight: 700; color: var(--color-gray-900); }
    .stat-mini-card .value.success { color: var(--color-success); }
    .stat-mini-card .value.orange { color: #f79009; }
    .stat-mini-card .value.red { color: #f04438; }
    .stat-mini-card .value.yellow { color: #eab308; }

    .amount-stack { display: flex; flex-direction: column; gap: 4px; }
    .amt-assigned { font-weight: 700; color: var(--color-gray-900); font-size: 0.9375rem; }
    .amt-breakdown { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; font-weight: 600; }
    .amt-paid.success { color: var(--color-success); }
    .amt-balance.orange { color: #f79009; }
    .amt-sep { color: var(--color-gray-300); }

    .source-info { display: flex; flex-direction: column; gap: 4px; }
    .source-name { font-size: 0.8125rem; color: var(--color-gray-600); font-weight: 500; }

    .payment-card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: var(--color-gray-50); padding: 0.75rem; border-radius: 8px; }
    .payment-card-item { display: flex; flex-direction: column; gap: 2px; }
    .payment-card-item .label { font-size: 0.65rem; font-weight: 700; color: var(--color-gray-500); text-transform: uppercase; }
    .payment-card-item .val { font-size: 0.875rem; font-weight: 700; color: var(--color-gray-900); }
    .payment-card-item .val.success { color: var(--color-success); }
    .payment-card-item .val.orange { color: #f79009; }

    .card-hover { transition: all 0.2s; cursor: pointer; }
    .card-hover:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--color-primary-border); }

    .badge-status.yellow { background: #fffaeb; color: #b54708; }
  `]
})
export class PaymentListComponent implements OnInit {
  roleConfig = inject(RoleConfigService);
  studentService = inject(StudentService);
  paymentService = inject(PaymentService);
  datePipe = inject(DatePipe);

  searchQuery = '';
  filterStatus = '';
  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;
  loading = false;
  payments: any[] = [];
  
  showPaymentModal = false;
  selectedPaymentId: string | number | null = null;

  showDetailPanel = false;
  selectedPayment: any = null;

  // Role-based stats

  filterSourceType = '';
  filterBranch = '';
  filterApprovalStatus = '';
  branches: any[] = [];
  private branchService = inject(BranchService);

  ngOnInit() {
    this.loadPayments();
    if (this.roleConfig.getCurrentUserRole() === 'ADMIN') {
      this.loadBranches();
    }
  }

  loadBranches() {
    this.branchService.getAllBranches().subscribe(data => this.branches = data);
  }

  get filteredPayments() {
    return this.payments.filter(p => {
      const matchesSearch = !this.searchQuery || 
        p.user.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        p.id.toString().toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.sourceName.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = !this.filterStatus || p.status === this.filterStatus;
      const matchesApproval = !this.filterApprovalStatus || p.approvalStatus === this.filterApprovalStatus;
      const matchesSourceType = !this.filterSourceType || p.sourceType === this.filterSourceType;
      const matchesBranch = !this.filterBranch || p.branchId === this.filterBranch;
      
      return matchesSearch && matchesStatus && matchesApproval && matchesSourceType && matchesBranch;
    });
  }

  loadPayments() {
    this.loading = true;
    this.studentService.getStudentsWithPayments().subscribe({
      next: (data: any[]) => {
        this.payments = data.map(item => ({
          id: item.paymentId,
          studentId: item.studentId,
          user: `${item.firstName} ${item.lastName}`,
          category: item.courseName,
          assignedAmount: item.assignedAmount,
          paidAmount: item.paidAmount,
          balanceAmount: (item.assignedAmount || 0) - (item.paidAmount || 0),
          studentStatus: item.status,
          status: item.paymentStatus,
          approvalStatus: item.approvalStatus || 'PENDING',
          sourceType: item.sourceType,
          sourceName: item.referralName || item.companyName || 'Direct',
          date: this.datePipe.transform(item.paymentCreatedAt || item.createdAt, 'dd MMM yyyy'),
          rejectionReason: item.rejectionReason,
          disputeReason: item.disputeReason,
          proofUrl: item.proofUrl
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching payments:', err);
        this.loading = false;
      }
    });
  }

  get dashboardStats() {
    const list = this.filteredPayments;
    return {
      totalAssigned: list.reduce((acc, curr) => acc + (curr.assignedAmount || 0), 0),
      totalPaid: list.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0),
      totalPending: list.reduce((acc, curr) => acc + (curr.balanceAmount || 0), 0),
      pendingApprovals: list.filter(p => p.approvalStatus === 'PENDING').length,
      disputes: list.filter(p => p.status === 'DISPUTED').length,
      totalEarnings: list.reduce((acc, curr) => acc + (curr.assignedAmount || 0), 0)
    };
  }

  openDetailPanel(payment: any) {
    this.selectedPayment = payment;
    this.showDetailPanel = true;
  }

  closeDetailPanel() {
    this.showDetailPanel = false;
    this.selectedPayment = null;
  }

  handleDetailAction(event: { type: string, paymentId: any }) {
    if (event.type === 'APPROVE_REJECTION') {
      this.approveRejection(event.paymentId);
    } else if (event.type === 'RAISE_DISPUTE') {
      this.raiseDispute(event.paymentId);
    } else if (event.type === 'REFRESH') {
      this.loadPayments();
    }
  }

  approveRejection(id: any) {
    if (confirm('Are you sure you want to approve this student rejection?')) {
      this.paymentService.processRejection(id, 'APPROVED', 'Approved by ' + this.roleConfig.getCurrentUserRole()).subscribe({
        next: () => {
          this.loadPayments();
          this.closeDetailPanel();
        },
        error: (err) => alert(err.error?.message || 'Error processing rejection')
      });
    }
  }

  raiseDispute(id: any) {
    const payment = this.payments.find(p => p.id === id);
    if (!payment) return;

    const reason = prompt('Please enter the reason for dispute:');
    if (reason) {
      this.paymentService.raiseDispute({
        studentId: payment.studentId,
        disputeReason: reason,
        priority: 'HIGH'
      }).subscribe({
        next: () => {
          this.loadPayments();
          this.closeDetailPanel();
        },
        error: (err) => alert(err.error?.message || 'Error raising dispute')
      });
    }
  }

  getApprovalStatusClass(status: string): string {
    if (!status) return 'gray';
    switch (status.toUpperCase()) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'gray';
    }
  }

  loadMoreCards() {
    this.displayedCardsCount += 10;
  }

  isAdminOrManager(): boolean {
    const role = this.roleConfig.getCurrentUserRole();
    return role === 'ADMIN' || role === 'MANAGER';
  }

  openRecordPaymentModal(id: string | number | null = null) {
    this.selectedPaymentId = id;
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedPaymentId = null;
  }

  onPaymentSuccess() {
    this.loadPayments();
  }

  approvePayment(id: string | number) {
    if (confirm('Are you sure you want to approve this payment?')) {
      this.paymentService.approvePayment(id).subscribe({
        next: () => this.loadPayments(),
        error: (err) => alert(err.error?.message || 'Error approving payment')
      });
    }
  }

  rejectPayment(id: string | number) {
    const reason = prompt('Please enter a reason for rejection:');
    if (reason !== null) {
      this.paymentService.rejectPayment(id, reason).subscribe({
        next: () => this.loadPayments(),
        error: (err) => alert(err.error?.message || 'Error rejecting payment')
      });
    }
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

  getStatusClass(status: string): string {
    if (!status) return 'gray';
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'APPROVED':
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
      case 'PROCESSING':
        return 'warning';
      case 'REJECTED':
      case 'FAILED':
      case 'LOST':
        return 'error';
      default:
        return 'gray';
    }
  }

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
