import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../../core/services/payment.service';
import { RoleConfigService } from '../../../../core/services/role-config.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-payment-detail-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [CurrencyPipe, DatePipe],
  template: `
    <div class="side-panel-overlay" (click)="onClose()">
      <div class="side-panel" (click)="$event.stopPropagation()" [class.open]="payment">
        <div class="panel-header">
          <div class="panel-task-id">
            <span class="material-icons-outlined">payments</span>
            PAYMENT · {{ payment?.id }}
          </div>
          <button class="btn-icon-sm" (click)="onClose()">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="panel-body" *ngIf="payment">
          <div class="title-section">
             <h2 class="panel-title">{{ payment.user }}</h2>
             <p class="task-created-info">{{ payment.category }} · Student Status: <strong>{{ payment.studentStatus }}</strong></p>
          </div>

          <!-- Payment Summary Cards -->
          <div class="summary-cards">
            <div class="summary-card">
              <span class="label">Assigned</span>
              <div class="value">{{ payment.assignedAmount | currency:'INR' }}</div>
            </div>
            <div class="summary-card success">
              <span class="label">Paid</span>
              <span class="value">{{ payment.paidAmount | currency:'INR' }}</span>
            </div>
            <div class="summary-card warning">
              <span class="label">Balance</span>
              <span class="value">{{ payment.balanceAmount | currency:'INR' }}</span>
            </div>
          </div>

          <!-- Administrative Actions Section (Admin/Manager only) -->
          <div class="panel-section admin-actions mt-4" *ngIf="isAdminOrManager()">
            <label class="section-label">ADMINISTRATIVE ACTIONS</label>
            
            <div class="admin-action-grid">
              <!-- Action 1: Assign Amount (Initial Stage) -->
              <div class="admin-action-card" *ngIf="payment.status !== 'PAID'">
                <div class="action-icon-box">
                  <span class="material-icons">edit_note</span>
                </div>
                <div class="action-info">
                  <span class="action-name">Set Assigned Fee</span>
                  <p class="action-desc">Define initial total amount</p>
                </div>
                <button class="btn-action-trigger" (click)="openModal('ASSIGN')">Update</button>
              </div>

              <!-- Action 2: Record Payment (Ongoing Stage) -->
              <div class="admin-action-card highlight">
                <div class="action-icon-box">
                  <span class="material-icons">payments</span>
                </div>
                <div class="action-info">
                  <span class="action-name">Record Payment</span>
                  <p class="action-desc">Add new payment transaction</p>
                </div>
                <button class="btn-action-trigger primary" [disabled]="payment.status === 'PAID'" (click)="openModal('PAY')">
                  {{ payment.status === 'PAID' ? 'Fully Paid' : 'Pay Now' }}
                </button>
              </div>

              <!-- Action 3: Raise Dispute -->
              <div class="admin-action-card highlight-error full-width" *ngIf="payment.status !== 'PAID'">
                <div class="action-icon-box danger">
                  <span class="material-icons">gavel</span>
                </div>
                <div class="action-info">
                  <span class="action-name">Raise Transaction Dispute</span>
                  <p class="action-desc">Flag this student record for review or investigation</p>
                </div>
                <button class="btn-action-trigger danger" (click)="openModal('DISPUTE')">Dispute</button>
              </div>
            </div>
          </div>

          <!-- Referral/Company Verification Section -->
          <div class="panel-section admin-actions mt-4" *ngIf="isReferralOrCompany() && payment.disputeStatus?.toUpperCase() === 'OPEN'">
            <label class="section-label">PAYMENT VERIFICATION</label>
            
            <div class="admin-action-grid">
              <!-- Action 1: Accept Record -->
              <div class="admin-action-card highlight">
                <div class="action-icon-box">
                  <span class="material-icons">check_circle</span>
                </div>
                <div class="action-info">
                  <span class="action-name">Accept Payment Record</span>
                  <p class="action-desc">Verify and confirm this payment details</p>
                </div>
                <button class="btn-action-trigger primary" (click)="openModal('ACCEPT_DISPUTE')">Accept</button>
              </div>

              <!-- Action 2: Raise Dispute / Reject -->
              <div class="admin-action-card highlight-error full-width">
                <div class="action-icon-box danger">
                  <span class="material-icons">block</span>
                </div>
                <div class="action-info">
                  <span class="action-name">Reject / Dispute Record</span>
                  <p class="action-desc">Raise a dispute if details are incorrect</p>
                </div>
                <button class="btn-action-trigger danger" (click)="openModal('REJECT_DISPUTE')">Reject / Dispute</button>
              </div>
            </div>
          </div>

          <div class="panel-section mt-4">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <label class="section-label">TRANSACTION HISTORY</label>
              <span class="badge-status" [ngClass]="getStatusClass(payment.status)">{{ payment.status }}</span>
            </div>
            
            <div class="transaction-list" *ngIf="transactions.length > 0; else noTransactions">
              <div class="transaction-item" *ngFor="let tx of transactions">
                <div class="tx-icon" [ngClass]="tx.type?.toLowerCase() || 'upi'">
                  <span class="material-icons">{{ getTxIcon(tx) }}</span>
                </div>
                <div class="tx-details">
                  <div class="tx-main">
                    <span class="tx-type">{{ tx.transactionType === 'CREDIT' ? 'Payment Received' : (tx.type || 'Transaction') }}</span>
                    <span class="tx-amount" [class.negative]="tx.transactionType === 'DEBIT' || tx.type === 'REFUND'">
                      {{ (tx.transactionType === 'DEBIT' || tx.type === 'REFUND') ? '-' : '+' }}{{ tx.amount | currency:'INR' }}
                    </span>
                  </div>
                  <div class="tx-meta">
                    <span class="tx-date">{{ (tx.createdAt || tx.date) | date:'MMM d, yyyy · h:mm a' }}</span>
                    <span class="tx-method" *ngIf="tx.paymentMethod || tx.method">{{ tx.paymentMethod || tx.method }}</span>
                    <span class="tx-ref" *ngIf="tx.transactionReference">Ref: {{ tx.transactionReference }}</span>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noTransactions>
              <div class="description-box empty">No transactions recorded yet.</div>
            </ng-template>
          </div>

          <!-- Rejection / Dispute Section -->
          <div class="panel-section" *ngIf="payment.status?.toUpperCase() === 'REJECTED_PENDING' || payment.status?.toUpperCase() === 'DISPUTED' || payment.rejectionReason">
            <label class="section-label">{{ payment.status?.toUpperCase() === 'DISPUTED' ? 'DISPUTE DETAILS' : 'REJECTION DETAILS' }}</label>
            <div class="status-box" [ngClass]="payment.status?.toUpperCase() === 'DISPUTED' ? 'disputed' : 'rejected'">
              <div class="status-header">
                <span class="material-icons">{{ payment.status?.toUpperCase() === 'DISPUTED' ? 'report' : 'cancel' }}</span>
                <strong>{{ payment.status?.toUpperCase() === 'DISPUTED' ? 'Dispute Raised' : 'Rejection Requested' }}</strong>
              </div>
              <p class="status-reason">{{ payment.rejectionReason || payment.disputeReason }}</p>
              <div class="status-proof" *ngIf="payment.proofUrl">
                <a [href]="payment.proofUrl" target="_blank" class="btn-link">
                  <span class="material-icons">attach_file</span>
                  View Proof Document
                </a>
              </div>
            </div>

            <!-- Role-based Actions -->
            <div class="action-footer mt-4" *ngIf="canProcessRejection()">
              <button class="btn btn-primary" (click)="onApproveRejection()">
                <span class="material-icons">check</span>
                Approve Rejection
              </button>
              <button class="btn btn-outline" style="color: var(--color-error); border-color: var(--color-error);" (click)="onRaiseDispute()">
                <span class="material-icons">gavel</span>
                Raise Dispute
              </button>
            </div>

            <!-- Dispute Resolution Actions (Referral/Company) -->
            <div class="action-footer mt-4" *ngIf="canProcessDispute()">
              <button class="btn btn-primary" (click)="openModal('ACCEPT_DISPUTE')">
                <span class="material-icons">check_circle</span>
                Accept Dispute
              </button>
              <button class="btn btn-outline" style="color: var(--color-error); border-color: var(--color-error);" (click)="openModal('REJECT_DISPUTE')">
                <span class="material-icons">block</span>
                Reject Dispute
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PREMIUM ACTION MODAL -->
      <div class="modal-overlay" *ngIf="showActionModal" (click)="$event.stopPropagation()">
        <div class="premium-modal">
          <div class="modal-header">
            <h3>{{ getModalTitle() }}</h3>
            <button class="btn-close-sm" (click)="showActionModal = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="modal-body">
            <!-- Amount field (Not for Dispute) -->
            <div class="form-group-premium" *ngIf="modalType !== 'DISPUTE' && modalType !== 'REJECT_DISPUTE' && modalType !== 'ACCEPT_DISPUTE'">
              <label>{{ modalType === 'ASSIGN' ? 'Total Assigned Amount' : 'Payment Amount' }}</label>
              <div class="input-icon-premium">
                <span class="currency-symbol">₹</span>
                <input type="number" [(ngModel)]="modalData.amount" placeholder="0.00">
              </div>
            </div>

            <!-- Payment Method (Only for Pay) -->
            <div class="form-group-premium" *ngIf="modalType === 'PAY'">
              <label>Payment Method</label>
              <select [(ngModel)]="modalData.method" class="select-premium">
                <option value="UPI">UPI (PhonePe/GPay)</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash Payment</option>
              </select>
            </div>

            <!-- Notes / Reason -->
            <div class="form-group-premium" *ngIf="modalType !== 'REJECT_DISPUTE' && modalType !== 'ACCEPT_DISPUTE'">
              <label>{{ modalType === 'DISPUTE' ? 'Dispute Reason' : 'Reference Note' }}</label>
              <textarea [(ngModel)]="modalData.notes" [placeholder]="modalType === 'DISPUTE' ? 'Provide a clear reason for the dispute...' : 'e.g. Revised based on discount or Transaction ID'" rows="3"></textarea>
            </div>

            <!-- Dispute Resolution Fields (Accept/Reject/Dispute) -->
            <div class="form-group-premium" *ngIf="modalType === 'ACCEPT_DISPUTE' || modalType === 'REJECT_DISPUTE' || modalType === 'DISPUTE'">
              <label>{{ modalType === 'DISPUTE' ? 'Dispute Reason' : 'Response Message' }}</label>
              <textarea [(ngModel)]="modalData.notes" [placeholder]="modalType === 'DISPUTE' ? 'Provide a clear reason for the dispute...' : 'Provide a response message...'" rows="3"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" (click)="showActionModal = false">Cancel</button>
            <button class="btn-submit-premium" [class.danger]="modalType === 'DISPUTE' || modalType === 'REJECT_DISPUTE'" [disabled]="submitting" (click)="submitAction()">
              {{ submitting ? 'Processing...' : getSubmitButtonText() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .side-panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(16, 24, 40, 0.4); z-index: 2000; display: flex; justify-content: flex-end; backdrop-filter: blur(4px); }
    .side-panel { width: 480px; max-width: 100%; height: 100vh; background: white; box-shadow: -10px 0 30px rgba(0,0,0,0.1); display: flex; flex-direction: column; transform: translateX(100%); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

    .panel-header { padding: 20px 24px; border-bottom: 1px solid #f2f4f7; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
    .panel-task-id { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 700; color: #667085; letter-spacing: 0.05em; text-transform: uppercase; }
    
    .panel-body { flex: 1; overflow-y: auto; padding: 32px 24px; }
    .title-section { margin-bottom: 24px; }
    .panel-title { font-size: 1.5rem; font-weight: 700; color: #101828; margin: 0 0 4px 0; }
    .task-created-info { font-size: 0.875rem; color: #667085; margin: 0; }

    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
    .summary-card { background: #f9fafb; padding: 16px 12px; border-radius: 12px; border: 1px solid #f2f4f7; display: flex; flex-direction: column; gap: 4px; }
    .summary-card.success { background: #ecfdf3; border-color: #abefc6; }
    .summary-card.success .value { color: #067647; }
    .summary-card.warning { background: #fffbeb; border-color: #fef0c7; }
    .summary-card.warning .value { color: #b54708; }
    .summary-card .label { font-size: 0.7rem; font-weight: 700; color: #667085; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-card .value { font-size: 1.125rem; font-weight: 700; color: #101828; }

    /* Admin Action Grid */
    .admin-action-grid { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
    .admin-action-card { background: #fcfcfd; border: 1px solid #eaecf0; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 16px; transition: all 0.2s; }
    .admin-action-card:hover { border-color: #d0d5dd; background: white; }
    .admin-action-card.highlight { background: #eff8ff; border-color: #b2ddff; }
    .admin-action-card.highlight .action-icon-box { background: #175cd3; color: white; }
    .admin-action-card.highlight:has(.btn-action-trigger:disabled) { background: #f9fafb; border-color: #eaecf0; opacity: 0.7; }
    .admin-action-card.highlight:has(.btn-action-trigger:disabled) .action-icon-box { background: #f2f4f7; color: #475467; }
    .admin-action-card.highlight-error { background: #fef2f2; border-color: #fecaca; }
    .admin-action-card.highlight-error .action-icon-box.danger { background: #f04438; color: white; }
    .admin-action-card.full-width { flex-direction: row; align-items: center; }

    .action-icon-box { width: 44px; height: 44px; border-radius: 10px; background: #f2f4f7; color: #475467; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .action-info { flex: 1; }
    .action-name { font-size: 0.9375rem; font-weight: 600; color: #101828; display: block; }
    .action-desc { font-size: 0.75rem; color: #667085; margin: 2px 0 0; }
    
    .btn-action-trigger { background: white; border: 1px solid #d0d5dd; border-radius: 8px; padding: 8px 16px; font-size: 0.8125rem; font-weight: 600; color: #344054; cursor: pointer; }
    .btn-action-trigger.primary { background: #175cd3; color: white; border: none; }
    .btn-action-trigger.danger { background: #f04438; color: white; border: none; }

    .section-label { display: block; font-size: 0.75rem; font-weight: 700; color: #475467; letter-spacing: 0.05em; text-transform: uppercase; }
    
    .transaction-list { display: flex; flex-direction: column; gap: 16px; }
    .transaction-item { display: flex; gap: 16px; align-items: center; padding: 12px; border-radius: 12px; border: 1px solid #f2f4f7; transition: all 0.2s; }
    
    .tx-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tx-icon.upi { background: #eff8ff; color: #175cd3; }
    .tx-icon.bank { background: #fdf2fa; color: #c11574; }
    .tx-icon.cash { background: #ecfdf3; color: #067647; }
    .tx-icon.refund { background: #fef2f2; color: #b42318; }
    
    .tx-details { flex: 1; }
    .tx-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .tx-type { font-weight: 600; color: #344054; font-size: 0.9375rem; }
    .tx-amount { font-weight: 700; color: #12b76a; }
    .tx-amount.negative { color: #f04438; }
    
    .tx-meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.75rem; color: #667085; }
    .tx-method { background: #f2f4f7; padding: 0 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
    .tx-ref { color: #98a2b3; font-family: monospace; }

    .description-box { padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #f2f4f7; font-size: 0.875rem; color: #667085; }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 3000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
    .premium-modal { background: white; width: 400px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: zoomIn 0.3s ease-out; }
    @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    
    .modal-header { padding: 24px 24px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f2f4f7; }
    .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #101828; }
    .modal-body { padding: 24px; }
    .modal-footer { padding: 16px 24px 24px; display: flex; gap: 12px; }
    
    .form-group-premium { margin-bottom: 20px; }
    .form-group-premium label { display: block; font-size: 0.875rem; font-weight: 600; color: #344054; margin-bottom: 6px; }
    .input-icon-premium { position: relative; display: flex; align-items: center; }
    .currency-symbol { position: absolute; left: 12px; font-weight: 600; color: #667085; }
    .input-icon-premium input { width: 100%; padding: 10px 10px 10px 32px; border: 1px solid #d0d5dd; border-radius: 8px; font-size: 1rem; }
    .select-premium, textarea { width: 100%; padding: 10px 12px; border: 1px solid #d0d5dd; border-radius: 8px; font-size: 0.875rem; }
    
    .btn-submit-premium { flex: 1; background: #175cd3; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .btn-submit-premium.danger { background: #f04438; }
    .btn-cancel { flex: 1; background: white; border: 1px solid #d0d5dd; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; }

    .btn-close-sm { background: none; border: none; cursor: pointer; color: #667085; }

    .status-box { padding: 20px; border-radius: 16px; margin-top: 12px; }
    .status-box.rejected { background: #fef2f2; border: 1px solid #fee2e2; }
    .status-box.disputed { background: #fff1f3; border: 1px solid #ffe4e8; }
    .status-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #b42318; }
    .status-reason { font-size: 0.9375rem; color: #475467; line-height: 1.5; margin-bottom: 16px; }
    
    .btn-link { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; font-weight: 600; color: #b42318; text-decoration: underline; }

    .action-footer { display: flex; gap: 12px; }
    .action-footer .btn { flex: 1; }

    .btn-icon-sm { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: #667085; cursor: pointer; }
    .btn-icon-sm:hover { background: #f2f4f7; color: #101828; }

    .badge-status { padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge-status.success { background: #ecfdf3; color: #027a48; }
    .badge-status.warning { background: #fffaeb; color: #b54708; }
    .badge-status.error { background: #fef2f2; color: #b42318; }
    .badge-status.gray { background: #f2f4f7; color: #344054; }

    @media (max-width: 640px) {
      .side-panel { width: 100%; }
      .premium-modal { width: 90%; }
    }
  `]
})
export class PaymentDetailPanelComponent implements OnInit {
  @Input() payment: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() actionTriggered = new EventEmitter<{ type: string, paymentId: any }>();

  private paymentService = inject(PaymentService);
  private roleConfig = inject(RoleConfigService);
  private notification = inject(NotificationService);

  transactions: any[] = [];
  loading = false;
  submitting = false;

  // Modal logic
  showActionModal = false;
  modalType: 'ASSIGN' | 'PAY' | 'DISPUTE' | 'ACCEPT_DISPUTE' | 'REJECT_DISPUTE' = 'ASSIGN';
  modalData: any = {
    amount: 0,
    method: 'UPI',
    notes: '',
    reference: '',
    reason: '',
    category: 'Documentation Issue',
    requiresFurtherAction: true
  };

  ngOnInit() {
    if (this.payment) {
      this.loadTransactions();
    }
  }

  loadTransactions() {
    this.loading = true;
    this.paymentService.getPaymentTransactions(this.payment.studentId).subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: () => {
        this.transactions = [];
        this.loading = false;
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  isAdminOrManager(): boolean {
    const role = this.roleConfig.getCurrentUserRole();
    return role === 'ADMIN' || role === 'MANAGER' || role === 'BRANCH_PARTNER';
  }

  openModal(type: 'ASSIGN' | 'PAY' | 'DISPUTE' | 'ACCEPT_DISPUTE' | 'REJECT_DISPUTE') {
    this.modalType = type;
    this.modalData = {
      amount: (type === 'ASSIGN') ? this.payment.assignedAmount : (type === 'ACCEPT_DISPUTE' ? this.payment.balanceAmount : this.payment.balanceAmount),
      method: 'UPI',
      notes: '',
      reference: '',
      reason: '',
      category: 'Documentation Issue',
      requiresFurtherAction: true
    };
    this.showActionModal = true;
  }

  getModalTitle(): string {
    switch (this.modalType) {
      case 'ASSIGN': return 'Adjust Assigned Fee';
      case 'PAY': return 'Record New Payment';
      case 'DISPUTE': return 'Raise Transaction Dispute';
      case 'ACCEPT_DISPUTE': return 'Accept Payment Dispute';
      case 'REJECT_DISPUTE': return 'Reject Payment Dispute';
      default: return 'Action';
    }
  }

  getSubmitButtonText(): string {
    switch (this.modalType) {
      case 'ASSIGN': return 'Update Fee';
      case 'PAY': return 'Confirm Payment';
      case 'DISPUTE': return 'Submit Dispute';
      case 'ACCEPT_DISPUTE': return 'Accept Dispute';
      case 'REJECT_DISPUTE': return 'Reject Dispute';
      default: return 'Submit';
    }
  }

  submitAction() {
    if (this.modalType !== 'DISPUTE' && this.modalType !== 'ACCEPT_DISPUTE' && this.modalType !== 'REJECT_DISPUTE' && this.modalData.amount <= 0) {
      this.notification.error('Please enter a valid amount');
      return;
    }

    if (this.modalType === 'DISPUTE' && !this.modalData.notes) {
      this.notification.error('Please enter a reason for the dispute');
      return;
    }

    this.submitting = true;
    if (this.modalType === 'ASSIGN') {
      this.paymentService.updatePaymentAmount(this.payment.id, this.modalData.amount, this.modalData.notes).subscribe({
        next: () => {
          this.payment.assignedAmount = this.modalData.amount;
          this.payment.balanceAmount = this.modalData.amount - (this.payment.paidAmount || 0);
          this.finalizeAction('Fee adjusted successfully');
        },
        error: (err) => this.handleError(err)
      });
    } else if (this.modalType === 'PAY') {
      const payload = {
        studentId: this.payment.studentId,
        amount: this.modalData.amount,
        paymentMethod: this.modalData.method,
        notes: this.modalData.notes,
        transactionReference: 'TXN' + Math.floor(Math.random() * 1000000)
      };
      
      this.paymentService.createPayment(payload).subscribe({
        next: () => {
          this.payment.paidAmount += this.modalData.amount;
          this.payment.balanceAmount -= this.modalData.amount;
          this.finalizeAction('Payment recorded successfully');
        },
        error: (err) => this.handleError(err)
      });
    } else if (this.modalType === 'DISPUTE') {
      this.paymentService.raiseDispute(this.payment.id, this.modalData.notes).subscribe({
        next: () => {
          this.payment.status = 'DISPUTED';
          this.payment.disputeStatus = 'OPEN';
          this.finalizeAction('Dispute raised successfully');
        },
        error: (err) => this.handleError(err)
      });
    } else if (this.modalType === 'ACCEPT_DISPUTE') {
      this.paymentService.acceptDispute(this.payment.id, this.modalData.notes).subscribe({
        next: () => {
          this.payment.status = 'REJECTED'; // As per user requirement: REFERRAL accepts dispute (becomes REJECTED)
          this.payment.disputeStatus = 'CLOSED';
          this.finalizeAction('Dispute accepted successfully');
        },
        error: (err) => this.handleError(err)
      });
    } else if (this.modalType === 'REJECT_DISPUTE') {
      this.paymentService.rejectDispute(this.payment.id, this.modalData.notes).subscribe({
        next: () => {
          // As per user requirement: stays DISPUTE with comments
          this.payment.disputeStatus = 'OPEN'; 
          this.finalizeAction('Dispute rejection submitted');
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  finalizeAction(msg: string) {
    this.submitting = false;
    this.showActionModal = false;
    this.notification.success(msg);
    this.loadTransactions();
    this.actionTriggered.emit({ type: 'REFRESH', paymentId: this.payment.id });
  }

  handleError(err: any) {
    this.submitting = false;
    this.notification.error(err.error?.message || 'Action failed. Please try again.');
  }

  canProcessRejection(): boolean {
    const role = this.roleConfig.getCurrentUserRole();
    return (role === 'REFERRAL' || role === 'COMPANY') && this.payment?.status?.toUpperCase() === 'REJECTED_PENDING';
  }

  canProcessDispute(): boolean {
    const role = this.roleConfig.getCurrentUserRole();
    const isPartner = role === 'REFERRAL' || role === 'COMPANY';
    return isPartner && this.payment?.disputeStatus?.toUpperCase() === 'OPEN';
  }

  isReferralOrCompany(): boolean {
    const role = this.roleConfig.getCurrentUserRole();
    return role === 'REFERRAL' || role === 'COMPANY';
  }

  onApproveRejection() {
    this.actionTriggered.emit({ type: 'APPROVE_REJECTION', paymentId: this.payment.id });
  }

  onRaiseDispute() {
    this.actionTriggered.emit({ type: 'RAISE_DISPUTE', paymentId: this.payment.id });
  }

  getStatusClass(status: string): string {
    if (!status) return 'gray';
    switch (status.toUpperCase()) {
      case 'PAID': return 'success';
      case 'PARTIAL': return 'warning';
      case 'PENDING': return 'gray';
      case 'DISPUTED': return 'error';
      case 'REJECTED_PENDING': return 'warning';
      default: return 'gray';
    }
  }

  getTxIcon(tx: any): string {
    if (!tx) return 'receipt_long';
    const method = (tx.paymentMethod || tx.method || '').toUpperCase();
    const type = (tx.type || '').toUpperCase();
    
    if (type === 'REFUND') return 'history';
    if (method.includes('UPI')) return 'account_balance_wallet';
    if (method.includes('BANK')) return 'account_balance';
    if (method.includes('CASH')) return 'payments';
    return 'receipt_long';
  }
}
