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
  selector: 'app-register-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .register-title {
      font-size: 1.875rem;
      font-weight: 600;
      color: var(--color-gray-900);
      margin-bottom: 0.5rem;
    }
    .register-subtitle {
      font-size: 1rem;
      color: var(--color-gray-600);
    }

    /* Stepper - Untitled UI Style */
    .stepper-wrapper {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2.5rem;
      position: relative;
    }
    .stepper-wrapper::before {
      content: '';
      position: absolute;
      top: 1.25rem;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--color-gray-200);
      z-index: 0;
    }
    .stepper-item {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
    .step-counter {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background: white;
      border: 2px solid var(--color-gray-200);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: var(--color-gray-500);
      margin-bottom: 0.5rem;
      transition: all var(--transition-fast);
    }
    .step-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-gray-500);
    }
    .stepper-item.active .step-counter {
      border-color: var(--color-primary);
      color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-primary-light);
    }
    .stepper-item.active .step-name {
      color: var(--color-primary);
      font-weight: 600;
    }
    .stepper-item.completed .step-counter {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
    }
    .stepper-item.completed .step-name {
      color: var(--color-gray-900);
    }

    /* Password Meter */
    .password-meter {
      display: flex;
      gap: 4px;
      margin-top: 8px;
    }
    .password-meter-segment {
      height: 4px;
      flex: 1;
      background: var(--color-gray-200);
      border-radius: 2px;
    }
    .segment-weak { background: var(--color-error); }
    .segment-fair { background: #f79009; }
    .segment-good { background: #12b76a; }
    .segment-strong { background: #027a48; }

    .password-feedback {
      font-size: 0.75rem;
      margin-top: 4px;
      font-weight: 500;
    }
    .feedback-weak { color: var(--color-error); }
    .feedback-fair { color: #f79009; }
    .feedback-good { color: #12b76a; }
    .feedback-strong { color: #027a48; }

    /* Modal - Untitled UI Style */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(16, 24, 40, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.3s ease-out;
    }
    .modal-content {
      background: white;
      padding: 2.5rem;
      border-radius: var(--radius-xl);
      width: 90%;
      max-width: 440px;
      text-align: center;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .success-icon-wrapper {
      width: 3rem;
      height: 3rem;
      background: #ecfdf3;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #027a48;
      margin: 0 auto 1.5rem;
      border: 8px solid #f6fef9;
    }
    .success-icon-wrapper .material-icons { font-size: 1.5rem; }
    .modal-content h2 { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-900); margin-bottom: 0.5rem; }
    .modal-content p { font-size: 0.875rem; color: var(--color-gray-600); line-height: 1.5; margin-bottom: 2rem; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
  template: `
    <div class="register-header">
      <h3 class="register-title">Create an account</h3>
      <p class="register-subtitle">Join us and start your journey today.</p>
    </div>

    <div class="stepper-wrapper">
      <div class="stepper-item" [class.completed]="currentStep > 1" [class.active]="currentStep === 1">
        <div class="step-counter">
          <span *ngIf="currentStep <= 1">1</span>
          <span *ngIf="currentStep > 1" class="material-icons" style="font-size: 18px;">check</span>
        </div>
        <div class="step-name">Account</div>
      </div>
      <div class="stepper-item" [class.completed]="currentStep > 2" [class.active]="currentStep === 2">
        <div class="step-counter">
          <span *ngIf="currentStep <= 2">2</span>
          <span *ngIf="currentStep > 2" class="material-icons" style="font-size: 18px;">check</span>
        </div>
        <div class="step-name">Preferences</div>
      </div>
      <div class="stepper-item" [class.completed]="currentStep > 3" [class.active]="currentStep === 3">
        <div class="step-counter">
          <span *ngIf="currentStep <= 3">3</span>
          <span *ngIf="currentStep > 3" class="material-icons" style="font-size: 18px;">check</span>
        </div>
        <div class="step-name">Details</div>
      </div>
    </div>

    <form [formGroup]="studentForm" (ngSubmit)="onSubmit()">
      
      <!-- Step 1 -->
      <div *ngIf="currentStep === 1" formGroupName="personal">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control" formControlName="name" placeholder="Enter your full name">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" formControlName="email" placeholder="olivia@untitledui.com">
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <div class="d-flex" style="gap: 12px;">
            <select class="form-control" formControlName="dialCode" style="width: 100px; flex-shrink: 0;">
              <option *ngFor="let c of countryCodes" [value]="c.mobileCode">{{ c.isoAlpha2 }}</option>
            </select>
            <input type="text" class="form-control" formControlName="phone" placeholder="Phone number">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" formControlName="password" placeholder="Create a password">
          
          <div class="password-meter" *ngIf="passwordStrength.score > 0">
            <div class="password-meter-segment" [class.segment-weak]="passwordStrength.score >= 1" [class.segment-fair]="passwordStrength.score >= 2" [class.segment-good]="passwordStrength.score >= 3" [class.segment-strong]="passwordStrength.score >= 4"></div>
            <div class="password-meter-segment" [class.segment-fair]="passwordStrength.score >= 2" [class.segment-good]="passwordStrength.score >= 3" [class.segment-strong]="passwordStrength.score >= 4"></div>
            <div class="password-meter-segment" [class.segment-good]="passwordStrength.score >= 3" [class.segment-strong]="passwordStrength.score >= 4"></div>
            <div class="password-meter-segment" [class.segment-strong]="passwordStrength.score >= 4"></div>
          </div>
          <div class="password-feedback" *ngIf="passwordStrength.score > 0" 
               [ngClass]="{'feedback-weak': passwordStrength.score === 1, 'feedback-fair': passwordStrength.score === 2, 'feedback-good': passwordStrength.score === 3, 'feedback-strong': passwordStrength.score === 4}">
            {{ passwordStrength.label }}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input type="password" class="form-control" formControlName="confirmPassword" placeholder="Confirm password">
          <div *ngIf="personalGroup.get('confirmPassword')?.hasError('mismatch') && personalGroup.get('confirmPassword')?.touched" class="invalid-feedback" style="display: block;">
            Passwords do not match.
          </div>
        </div>
      </div>

      <!-- Step 2 -->
      <div *ngIf="currentStep === 2" formGroupName="preferences">
        <div class="form-group">
          <label class="form-label">Preferred Country</label>
          <select class="form-control" formControlName="country">
            <option value="">Select a country</option>
            <option value="UK">United Kingdom</option>
            <option value="USA">United States</option>
            <option value="Australia">Australia</option>
            <option value="Canada">Canada</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Preferred University</label>
          <input type="text" class="form-control" formControlName="university" placeholder="e.g. Oxford University">
        </div>
        <div class="form-group">
          <label class="form-label">Course</label>
          <select class="form-control" formControlName="course">
            <option value="">Select course</option>
            <option value="MBBS">MBBS</option>
            <option value="MD">MD</option>
            <option value="BDS">BDS</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Intake</label>
          <input type="text" class="form-control" formControlName="intake" placeholder="e.g. Fall 2026">
        </div>
      </div>

      <!-- Step 3 -->
      <div *ngIf="currentStep === 3" formGroupName="academic">
        <div class="form-group">
          <label class="form-label">Referral Code (Optional)</label>
          <div class="position-relative">
            <input type="text" class="form-control" formControlName="referralCode" placeholder="Enter code if any">
            <div *ngIf="academicGroup.get('referralCode')?.value" class="text-success text-sm mt-2 font-medium">
              Referral Applied ✅
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Academic Details</label>
          <textarea class="form-control" formControlName="details" rows="3" placeholder="High school grades, completed degrees..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Optional Notes</label>
          <textarea class="form-control" formControlName="notes" rows="2" placeholder="Any specific requirements..."></textarea>
        </div>
      </div>

      <div class="d-flex justify-content-between mt-4" style="gap: 12px;">
        <button type="button" class="btn btn-outline" style="flex: 1;" *ngIf="currentStep > 1" (click)="prevStep()">Back</button>
        <button type="button" class="btn btn-primary" style="flex: 1;" *ngIf="currentStep < 3" (click)="nextStep()">Continue</button>
        <button type="submit" class="btn btn-primary" style="flex: 1;" *ngIf="currentStep === 3" [disabled]="studentForm.invalid || isLoading">
          <span *ngIf="!isLoading">Get started</span>
          <span *ngIf="isLoading">Registering...</span>
        </button>
      </div>

      <div class="mt-4 text-center text-sm" *ngIf="currentStep === 1">
        <span class="text-muted">Already have an account? </span>
        <a routerLink="/auth/login">Log in</a>
      </div>
    </form>

    <!-- Success Modal -->
    <div class="modal-backdrop" *ngIf="showSuccessModal">
      <div class="modal-content">
        <div class="success-icon-wrapper">
          <span class="material-icons">check</span>
        </div>
        <h2>Registration successful</h2>
        <p>A verification email has been sent to your mail. Please verify it to activate your account.</p>
        <button class="btn btn-primary btn-block" (click)="closeModalAndNavigate()">
          Back to login
        </button>
      </div>
    </div>
  `
})
export class RegisterStudentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private countryService = inject(CountryService);

  currentStep = 1;
  isLoading = false;
  showSuccessModal = false;
  countryCodes: CountryMobileCode[] = [];
  private notificationService = inject(NotificationService);

  studentForm = this.fb.group({
    personal: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dialCode: ['+91', Validators.required],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator }),
    preferences: this.fb.group({
      country: ['', Validators.required],
      university: [''],
      course: ['', Validators.required],
      intake: ['', Validators.required]
    }),
    academic: this.fb.group({
      referralCode: [''],
      details: ['', Validators.required],
      notes: ['']
    })
  });

  get personalGroup() { return this.studentForm.get('personal') as FormGroup; }
  get preferencesGroup() { return this.studentForm.get('preferences') as FormGroup; }
  get academicGroup() { return this.studentForm.get('academic') as FormGroup; }

  ngOnInit() {
    this.countryService.getMobileCountryCodes().subscribe({
      next: (data) => this.countryCodes = data,
      error: (err) => console.error('Failed to load country codes', err)
    });
  }

  get passwordStrength() {
    return calculatePasswordStrength(this.studentForm.get('personal.password')?.value || '');
  }

  nextStep() {
    if (this.currentStep === 1 && this.personalGroup.invalid) {
      this.personalGroup.markAllAsTouched();
      return;
    }
    if (this.currentStep === 2 && this.preferencesGroup.invalid) {
      this.preferencesGroup.markAllAsTouched();
      return;
    }
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  onSubmit() {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Mapping form data to API payload
    const personal = this.personalGroup.value;
    const preferences = this.preferencesGroup.value;
    const academic = this.academicGroup.value;

    const payload = {
      fullName: personal.name,
      email: personal.email,
      phone: (personal.dialCode || '') + (personal.phone || ''),
      password: personal.password,
      preferredCountry: preferences.country,
      preferredUniversity: preferences.university,
      course: preferences.course,
      intake: preferences.intake,
      referralCode: academic.referralCode,
      basicAcademicDetails: academic.details,
      optionalNotes: academic.notes
    };

    this.authService.registerStudent(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccessModal = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notificationService.error(err.message || 'Registration failed.');
      }
    });
  }

  closeModalAndNavigate() {
    this.showSuccessModal = false;
    this.router.navigate(['/auth/login']);
  }
}
