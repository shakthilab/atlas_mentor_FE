import { Component, inject, OnInit, HostListener } from '@angular/core';
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
    <style>
      .dropdown-item:hover { background-color: var(--color-gray-50); }
    </style>
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
            <label class="form-label">First Name <span class="text-error">*</span></label>
            <input type="text" class="form-control" formControlName="firstName" placeholder="John">
            <div *ngIf="personalGroup.get('firstName')?.touched && personalGroup.get('firstName')?.invalid" class="text-error" style="font-size: 0.75rem; margin-top: 0.25rem;">
              First name is required.
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Last Name <span class="text-error">*</span></label>
            <input type="text" class="form-control" formControlName="lastName" placeholder="Doe">
            <div *ngIf="personalGroup.get('lastName')?.touched && personalGroup.get('lastName')?.invalid" class="text-error" style="font-size: 0.75rem; margin-top: 0.25rem;">
              Last name is required.
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email <span class="text-error">*</span></label>
            <input type="email" class="form-control" formControlName="email" placeholder="john@company.com">
            <div *ngIf="personalGroup.get('email')?.touched && personalGroup.get('email')?.invalid" class="text-error" style="font-size: 0.75rem; margin-top: 0.25rem;">
              Please enter a valid email address.
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Phone <span class="text-error">*</span></label>
            <div class="d-flex" style="gap: 12px;">
              <div class="custom-dropdown" style="position: relative; width: 120px; flex-shrink: 0;" tabindex="0" (click)="toggleCountryDropdown()">
                <div class="form-control d-flex align-items-center justify-content-between" style="cursor: pointer; height: 100%; padding: 0.5rem 0.75rem;">
                  <div class="d-flex align-items-center" style="gap: 8px;">
                    <img *ngIf="selectedCountry?.flagUrl" [src]="selectedCountry?.flagUrl" alt="flag" style="width: 20px; height: 15px; object-fit: cover; border-radius: 2px;">
                    <span style="font-size: 0.875rem; font-weight: 500;">{{ selectedCountry?.mobileCode || '+91' }}</span>
                  </div>
                  <span class="material-icons" style="font-size: 16px; color: var(--color-gray-500);">expand_more</span>
                </div>
                <div class="dropdown-menu shadow-premium" *ngIf="isCountryDropdownOpen" style="display: block; position: absolute; top: calc(100% + 4px); left: 0; width: 220px; z-index: 1000; max-height: 250px; overflow-y: auto; background: white; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: 0.5rem 0;">
                  <div class="dropdown-item d-flex align-items-center" *ngFor="let c of countryCodes" (click)="selectCountry(c, $event)" style="gap: 10px; padding: 0.5rem 1rem; cursor: pointer; transition: background 0.2s;">
                    <img *ngIf="c.flagUrl" [src]="c.flagUrl" alt="flag" style="width: 20px; height: 15px; object-fit: cover; border-radius: 2px;">
                    <span style="font-size: 0.875rem; font-weight: 500; width: 40px;">{{ c.mobileCode }}</span>
                    <span class="text-muted" style="font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ c.countryName }}</span>
                  </div>
                </div>
              </div>
              <input type="text" class="form-control" formControlName="phone" placeholder="Phone without country code" [maxlength]="selectedCountry?.mobileNumberLength || 20">
            </div>
            <div *ngIf="personalGroup.get('phone')?.touched && personalGroup.get('phone')?.invalid" class="text-error" style="font-size: 0.75rem; margin-top: 0.25rem;">
              <span *ngIf="personalGroup.get('phone')?.hasError('required')">Phone number is required.</span>
              <span *ngIf="personalGroup.get('phone')?.hasError('minlength') || personalGroup.get('phone')?.hasError('maxlength')">Phone number must be exactly {{ selectedCountry?.mobileNumberLength }} digits for {{ selectedCountry?.countryName }}.</span>
              <span *ngIf="personalGroup.get('phone')?.hasError('pattern')">Only numeric digits allowed.</span>
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
            <div *ngIf="personalGroup.get('employeeType')?.touched && personalGroup.get('employeeType')?.invalid" class="text-error" style="font-size: 0.75rem; margin-top: 0.25rem;">
              Role selection is required.
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Password <span class="text-error">*</span></label>
            <input type="password" class="form-control" formControlName="password" placeholder="Create a strong password">
            <div *ngIf="personalGroup.get('password')?.touched && personalGroup.get('password')?.invalid" class="text-error" style="font-size: 0.75rem; margin-top: 0.25rem;">
              Password is required.
            </div>
            
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
          <button type="submit" class="btn btn-primary" *ngIf="currentStep === 2" [disabled]="isLoading">
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
  isCountryDropdownOpen = false;
  selectedCountry: CountryMobileCode | null = null;
  private notificationService = inject(NotificationService);

  employeeForm = this.fb.group({
    personal: this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
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
      next: (data) => {
        this.countryCodes = data;
        const defaultCode = this.employeeForm.get('personal')?.get('dialCode')?.value;
        if (defaultCode && this.countryCodes.length > 0) {
          this.selectedCountry = this.countryCodes.find(c => c.mobileCode === defaultCode) || this.countryCodes[0];
          this.updatePhoneValidation();
        } else if (this.countryCodes.length > 0) {
          this.selectCountry(this.countryCodes[0], new Event('init'));
        }
      },
      error: (err) => console.error('Failed to load country codes', err)
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isCountryDropdownOpen = false;
    }
  }

  toggleCountryDropdown() {
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }

  selectCountry(country: CountryMobileCode, event: Event) {
    if (event.type !== 'init') event.stopPropagation();
    this.selectedCountry = country;
    this.employeeForm.get('personal')?.get('dialCode')?.setValue(country.mobileCode);
    this.isCountryDropdownOpen = false;
    this.updatePhoneValidation();
  }

  updatePhoneValidation() {
    const phoneControl = this.employeeForm.get('personal')?.get('phone');
    if (!phoneControl || !this.selectedCountry || !this.selectedCountry.mobileNumberLength) return;
    
    const length = this.selectedCountry.mobileNumberLength;
    phoneControl.setValidators([
      Validators.required,
      Validators.minLength(length),
      Validators.maxLength(length),
      Validators.pattern('^[0-9]*$')
    ]);
    phoneControl.updateValueAndValidity();
  }

  get passwordStrength() {
    return calculatePasswordStrength(this.employeeForm.get('personal.password')?.value || '');
  }

  nextStep() {
    if (this.currentStep === 1 && this.personalGroup.invalid) {
      this.personalGroup.markAllAsTouched();
      this.notificationService.error('Please fill all required fields correctly.');
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
      this.notificationService.error('Please fill all required fields correctly.');
      return;
    }

    this.isLoading = true;

    const professionalData = this.employeeForm.value.professional || {};

    const payload = {
      firstName: personalData.firstName,
      lastName: personalData.lastName,
      email: personalData.email,
      phone: personalData.phone,
      mobileCountryCodeId: this.selectedCountry?.id,
      password: personalData.password,
      employeeType: personalData.employeeType,
      experience: professionalData.experience,
      notes: professionalData.notes
    };

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
