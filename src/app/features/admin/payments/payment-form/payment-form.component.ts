import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { BranchService } from '../../../../core/services/branch.service';
import { ReferralService } from '../../../../core/services/referral.service';
import { CompanyService } from '../../../../core/services/company.service';
import { RoleConfigService } from '../../../../core/services/role-config.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ paymentId ? 'Edit' : (formType === 'ASSIGN' ? 'Assign' : 'Record') }} Payment</h2>
          <button class="close-btn" (click)="onClose.emit()">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="form-type-switcher" *ngIf="!paymentId">
          <button [class.active]="formType === 'ASSIGN'" (click)="formType = 'ASSIGN'">
            <span class="material-icons">assignment</span>
            Assign Amount
          </button>
          <button [class.active]="formType === 'RECORD'" (click)="formType = 'RECORD'">
            <span class="material-icons">payments</span>
            Record Payment
          </button>
        </div>

        <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="payment-form">
          <div class="form-grid">
            <!-- Student Selection -->
            <div class="form-group full-width">
              <label class="form-label">Student *</label>
              <select formControlName="studentId" class="form-control" (change)="onStudentChange($event)">
                <option value="">Select Student</option>
                <option *ngFor="let student of students" [value]="student.id">
                  {{ student.name || (student.firstName + ' ' + student.lastName) }} (#{{ student.id }})
                </option>
              </select>
            </div>

            <!-- Amount -->
            <div class="form-group">
              <label class="form-label">{{ formType === 'ASSIGN' ? 'Assigned Amount' : 'Payment Amount' }} *</label>
              <div class="input-with-icon">
                <span class="input-icon">₹</span>
                <input type="number" formControlName="amount" class="form-control" placeholder="0.00">
              </div>
            </div>

            <!-- Payment Method (Only for RECORD) -->
            <div class="form-group" *ngIf="formType === 'RECORD'">
              <label class="form-label">Payment Method *</label>
              <select formControlName="method" class="form-control">
                <option value="UPI">UPI (PhonePe/GPay)</option>
                <option value="BANK">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="REFUND">Refund</option>
              </select>
            </div>

            <!-- Branch Selection (Admin only) -->
            <div class="form-group" *ngIf="isAdmin()">
              <label class="form-label">Branch *</label>
              <select formControlName="branchId" class="form-control">
                <option value="">Select Branch</option>
                <option *ngFor="let branch of branches" [value]="branch.id">
                  {{ branch.name }}
                </option>
              </select>
            </div>

            <!-- Date -->
            <div class="form-group">
              <label class="form-label">Date *</label>
              <input type="date" formControlName="date" class="form-control">
            </div>

            <!-- Notes -->
            <div class="form-group full-width">
              <label class="form-label">Notes / Transaction ID</label>
              <textarea formControlName="notes" class="form-control" rows="2" placeholder="Enter transaction reference or notes..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onClose.emit()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="paymentForm.invalid || loading">
              <span class="material-icons" *ngIf="!loading">save</span>
              {{ loading ? 'Saving...' : (paymentId ? 'Update' : (formType === 'ASSIGN' ? 'Assign Amount' : 'Record Payment')) }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-content { max-width: 520px; }
    .form-type-switcher { display: flex; padding: 1.25rem 1.5rem 0; gap: 1rem; }
    .form-type-switcher button { 
      flex: 1; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 8px; 
      padding: 10px; 
      border-radius: 10px; 
      border: 1px solid var(--color-gray-200); 
      background: var(--color-gray-50); 
      color: var(--color-gray-600); 
      font-weight: 600; 
      font-size: 0.875rem; 
      cursor: pointer; 
      transition: all 0.2s;
    }
    .form-type-switcher button.active { 
      background: var(--color-primary-light); 
      border-color: var(--color-primary); 
      color: var(--color-primary); 
    }
    .form-type-switcher button .material-icons { font-size: 18px; }

    .payment-form { padding: 1.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .full-width { grid-column: 1 / -1; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-label { font-size: 0.8125rem; font-weight: 700; color: var(--color-gray-700); text-transform: uppercase; letter-spacing: 0.025em; }
    .form-control { 
      padding: 0.625rem 0.875rem; 
      border: 1px solid var(--color-gray-300); 
      border-radius: 8px; 
      font-size: 0.9375rem; 
      transition: all 0.2s;
    }
    .form-control:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-light); }
    .input-with-icon { position: relative; }
    .input-icon { 
      position: absolute; 
      left: 12px; 
      top: 50%; 
      transform: translateY(-50%); 
      color: var(--color-gray-500); 
      font-weight: 600; 
    }
    .input-with-icon .form-control { padding-left: 28px; width: 100%; box-sizing: border-box; }
    .modal-footer { 
      margin-top: 2rem; 
      padding-top: 1.25rem; 
      border-top: 1px solid var(--color-gray-200); 
      display: flex; 
      justify-content: flex-end; 
      gap: 0.75rem; 
    }
  `]
})
export class PaymentFormComponent implements OnInit {
  @Input() paymentId: string | number | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private paymentService = inject(PaymentService);
  private branchService = inject(BranchService);
  private referralService = inject(ReferralService);
  private companyService = inject(CompanyService);
  private roleConfig = inject(RoleConfigService);

  paymentForm: FormGroup;
  loading = false;
  students: any[] = [];
  branches: any[] = [];
  referrals: any[] = [];
  companies: any[] = [];
  formType: 'ASSIGN' | 'RECORD' = 'RECORD';

  constructor() {
    this.paymentForm = this.fb.group({
      studentId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      method: ['UPI'],
      branchId: [''],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    if (this.paymentId) {
      this.loadPaymentDetails();
    }
  }

  isAdmin() {
    return this.roleConfig.getCurrentUserRole() === 'ADMIN';
  }

  loadData() {
    // Load Students
    this.studentService.getStudents(0, 100).subscribe((data: any) => this.students = data.content || data);
    
    // Load Branches (if Admin)
    if (this.isAdmin()) {
      this.branchService.getAllBranches().subscribe((data: any) => this.branches = data);
    }

    // Load Referrals & Companies
    this.referralService.getReferrals(0, 100).subscribe((data: any) => this.referrals = data.content || data);
    this.companyService.getCompanies(0, 100).subscribe((data: any) => this.companies = data.content || data);
  }

  loadPaymentDetails() {
    this.loading = true;
    this.paymentService.getPaymentById(this.paymentId!).subscribe({
      next: (payment) => {
        this.paymentForm.patchValue({
          studentId: payment.studentId,
          amount: payment.amount,
          branchId: payment.branchId,
          method: payment.method || 'UPI',
          date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          notes: payment.notes
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onStudentChange(event: any) {
    const studentId = event.target.value;
    const student = this.students.find(s => s.id == studentId);
    if (student) {
      this.paymentForm.patchValue({
        branchId: student.branchId || '',
        referralId: student.referralId || '',
        companyId: student.companyId || ''
      });
    }
  }

  onSubmit() {
    if (this.paymentForm.invalid) return;

    this.loading = true;
    const paymentData = {
      ...this.paymentForm.value,
      type: this.formType
    };

    if (this.paymentId) {
      this.paymentService.updatePayment(this.paymentId, paymentData).subscribe({
        next: () => {
          this.onSuccess.emit();
          this.onClose.emit();
        },
        error: (err) => {
          alert(err.error?.message || 'Error updating payment');
          this.loading = false;
        }
      });
    } else {
      this.paymentService.createPayment(paymentData).subscribe({
        next: () => {
          this.onSuccess.emit();
          this.onClose.emit();
        },
        error: (err) => {
          alert(err.error?.message || 'Error creating payment');
          this.loading = false;
        }
      });
    }
  }
}
