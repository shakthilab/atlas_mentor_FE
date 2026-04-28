import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { passwordMatchValidator, calculatePasswordStrength } from '../../../core/utils/password-utils';
import { CountryService, CountryMobileCode } from '../../../core/services/country.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="text-center mb-4">
      <h3 class="mb-2">Employee Request</h3>
      <p class="text-muted text-sm" *ngIf="currentStep === 1">Step 1: Personal Details & Role</p>
      <p class="text-muted text-sm" *ngIf="currentStep === 2">Step 2: Experience & Notes</p>
    </div>

    <!-- Success Output -->
    <div *ngIf="isSubmitted" class="text-center">
      <div class="mb-4 d-flex justify-content-center">
        <span class="material-icons" style="font-size: 48px; color: var(--color-primary);">pending_actions</span>
      </div>
      <h4>Request Submitted</h4>
      <p class="text-muted text-sm mb-4">Your account is pending admin approval. You will be notified once activated.</p>
      <a routerLink="/auth/login" class="btn btn-primary">Return to Login</a>
    </div>

    <div *ngIf="!isSubmitted">
      <div class="stepper-wrapper">
        <div class="stepper-item" [class.completed]="currentStep > 1" [class.active]="currentStep === 1">
          <div class="step-counter">
            <span *ngIf="currentStep <= 1">1</span>
            <span *ngIf="currentStep > 1" class="material-icons" style="font-size: 16px;">check</span>
          </div>
          <div class="step-name">Account</div>
        </div>
        <div class="stepper-item" [class.completed]="currentStep > 2" [class.active]="currentStep === 2">
          <div class="step-counter">
            <span *ngIf="currentStep <= 2">2</span>
            <span *ngIf="currentStep > 2" class="material-icons" style="font-size: 16px;">check</span>
          </div>
          <div class="step-name">Details</div>
        </div>
      </div>

      <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
        
        <!-- Step 1 -->
        <div *ngIf="currentStep === 1" formGroupName="personal">
          <div class="form-group">
            <label class="form-label">Full Name <span class="text-error">*</span></label>
            <input type="text" class="form-control" formControlName="name" placeholder="John Doe">
          </div>
          <div class="form-group">
            <label class="form-label">Email <span class="text-error">*</span></label>
            <input type="email" class="form-control" formControlName="email" placeholder="john@company.com">
          </div>
          <div class="form-group">
            <label class="form-label">Phone <span class="text-error">*</span></label>
            <div class="d-flex" style="gap: 8px;">
              <select class="form-control" formControlName="dialCode" style="width: 120px; flex-shrink: 0; padding-right: 1.5rem;">
                <option *ngFor="let c of countryCodes" [value]="c.mobileCode">{{ c.isoAlpha2 }} ({{ c.mobileCode }})</option>
              </select>
              <input type="text" class="form-control" formControlName="phone" placeholder="Phone without country code">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Requested Role <span class="text-error">*</span></label>
            <select class="form-control" formControlName="employeeType">
              <option value="">Select role</option>
              <option value="Counsellor">Counsellor</option>
              <option value="Video Editor">Video Editor</option>
              <option value="Graphic Designer">Graphic Designer</option>
              <option value="Web Developer">Web Developer</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Password <span class="text-error">*</span></label>
            <input type="password" class="form-control" formControlName="password" placeholder="Create a strong password">
            
            <div class="password-meter" *ngIf="passwordStrength.score > 0">
              <div class="password-meter-segment" [class.segment-weak]="passwordStrength.score >= 1" [class.segment-fair]="passwordStrength.score >= 2" [class.segment-good]="passwordStrength.score >= 3" [class.segment-strong]="passwordStrength.score >= 4"></div>
              <div class="password-meter-segment" [class.segment-fair]="passwordStrength.score >= 2" [class.segment-good]="passwordStrength.score >= 3" [class.segment-strong]="passwordStrength.score >= 4"></div>
              <div class="password-meter-segment" [class.segment-good]="passwordStrength.score >= 3" [class.segment-strong]="passwordStrength.score >= 4"></div>
              <div class="password-meter-segment" [class.segment-strong]="passwordStrength.score >= 4"></div>
            </div>
            <div class="password-feedback" *ngIf="passwordStrength.score > 0" 
                 [ngClass]="{'feedback-weak': passwordStrength.score === 1, 'feedback-fair': passwordStrength.score === 2, 'feedback-good': passwordStrength.score === 3, 'feedback-strong': passwordStrength.score === 4}">
              Password strength: {{ passwordStrength.label }}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Confirm Password <span class="text-error">*</span></label>
            <input type="password" class="form-control" formControlName="confirmPassword" placeholder="Confirm your password">
            <div *ngIf="personalGroup.get('confirmPassword')?.hasError('mismatch') && personalGroup.get('confirmPassword')?.touched" class="invalid-feedback" style="display: block;">
              Passwords do not match.
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div *ngIf="currentStep === 2" formGroupName="professional">
          <div class="form-group">
            <label class="form-label">Experience (Optional)</label>
            <textarea class="form-control" formControlName="experience" placeholder="Detail your previous work experience..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Notes (Optional)</label>
            <textarea class="form-control" formControlName="notes" placeholder="Any messages for the admin..."></textarea>
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button type="button" class="btn btn-outline" *ngIf="currentStep > 1" (click)="prevStep()">Back</button>
          <div style="flex-grow: 1;"></div>
          <button type="button" class="btn btn-primary" *ngIf="currentStep < 2" (click)="nextStep()">Continue</button>
          <button type="submit" class="btn btn-primary" *ngIf="currentStep === 2" [disabled]="employeeForm.invalid || isLoading">
            <span *ngIf="!isLoading">Submit Request</span>
            <span *ngIf="isLoading">Submitting...</span>
          </button>
        </div>

      </form>
    </div>
    
    <div class="mt-4 text-center text-sm" *ngIf="currentStep === 1 && !isSubmitted">
      <a routerLink="/auth/login" class="text-sm">Already have an account? Sign in</a>
    </div>
  `
})
export class RegisterEmployeeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private countryService = inject(CountryService);

  currentStep = 1;
  isLoading = false;
  isSubmitted = false;
  countryCodes: CountryMobileCode[] = [];
  private notificationService = inject(NotificationService);

  employeeForm = this.fb.group({
    personal: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dialCode: ['+91', Validators.required],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      employeeType: ['', Validators.required]
    }, { validators: passwordMatchValidator }),
    professional: this.fb.group({
      experience: [''],
      notes: ['']
    })
  });

  get personalGroup() { return this.employeeForm.get('personal') as FormGroup; }

  ngOnInit() {
    this.countryService.getMobileCountryCodes().subscribe({
      next: (data) => this.countryCodes = data,
      error: (err) => console.error('Failed to load country codes', err)
    });
  }

  get passwordStrength() {
    return calculatePasswordStrength(this.employeeForm.get('personal.password')?.value || '');
  }

  nextStep() {
    if (this.currentStep === 1 && this.personalGroup.invalid) {
      this.personalGroup.markAllAsTouched();
      return;
    }
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  onSubmit() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload = {
      ...this.employeeForm.value.personal,
      ...this.employeeForm.value.professional
    } as Partial<User>;

    this.authService.registerEmployee(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSubmitted = true;
        this.notificationService.success('Request submitted successfully!');
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.error(err.message || 'Submission failed.');
      }
    });
  }
}
