import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { passwordMatchValidator, calculatePasswordStrength } from '../../../core/utils/password-utils';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="reset-page">
      <div class="background-blobs">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>

      <div class="reset-container">
        <div class="reset-card glass-effect animate-slide-up">
          <div class="text-center mb-4">
            <h2 class="mb-2">Reset Password</h2>
            <p class="text-muted text-sm">Create a strong password for your account</p>
          </div>

          <!-- Form State -->
          <form *ngIf="!isSuccess" [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input 
                type="password" 
                class="form-control" 
                formControlName="password" 
                placeholder="Enter new password"
                [class.is-invalid]="resetForm.get('password')?.invalid && resetForm.get('password')?.touched">
              
              <div class="password-meter" *ngIf="passwordStrength.score > 0">
                <div class="password-meter-segment" [class.segment-weak]="passwordStrength.score >= 1" [class.segment-fair]="passwordStrength.score >= 2" [class.segment-good]="passwordStrength.score >= 3" [class.segment-strong]="passwordStrength.score >= 4"></div>
                <div class="password-meter-segment" [class.segment-fair]="passwordStrength.score >= 2" [class.segment-good]="passwordStrength.score >= 3" [class.segment-strong]="passwordStrength.score >= 4"></div>
                <div class="password-meter-segment" [class.segment-good]="passwordStrength.score >= 3" [class.segment-strong]="passwordStrength.score >= 4"></div>
                <div class="password-meter-segment" [class.segment-strong]="passwordStrength.score >= 4"></div>
              </div>
              <div class="password-feedback" *ngIf="passwordStrength.score > 0" 
                   [ngClass]="{'feedback-weak': passwordStrength.score === 1, 'feedback-fair': passwordStrength.score === 2, 'feedback-good': passwordStrength.score === 3, 'feedback-strong': passwordStrength.score === 4}">
                Strength: {{ passwordStrength.label }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input 
                type="password" 
                class="form-control" 
                formControlName="confirmPassword" 
                placeholder="Verify new password"
                [class.is-invalid]="resetForm.get('confirmPassword')?.invalid && resetForm.get('confirmPassword')?.touched">
              <div *ngIf="resetForm.get('confirmPassword')?.hasError('mismatch') && resetForm.get('confirmPassword')?.touched" class="invalid-feedback">
                Passwords do not match.
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block mt-4" [disabled]="resetForm.invalid || isLoading">
              <span *ngIf="!isLoading">Update Password</span>
              <span *ngIf="isLoading" class="d-flex align-items-center">
                <div class="mini-spinner mr-2"></div> Updating...
              </span>
            </button>
          </form>

          <!-- Success State -->
          <div *ngIf="isSuccess" class="success-content animate-fade-in">
            <div class="icon-wrapper success shadow-pulse">
              <span class="material-icons">check_circle</span>
            </div>
            <h3>Password Updated!</h3>
            <p>Your password has been reset successfully. You can now use your new password to sign in.</p>
            <button class="btn btn-primary btn-block mt-4" routerLink="/auth/login">
              Go to Login
            </button>
          </div>

          <div class="text-center mt-4" *ngIf="!isSuccess">
             <a routerLink="/auth/login" class="text-sm">Back to Login</a>
          </div>
        </div>
      </div>
    </div>

    <style>
      .reset-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8fafc;
        position: relative;
        overflow: hidden;
      }

      .background-blobs {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 0;
      }

      .blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.15;
      }

      .blob-1 {
        width: 400px;
        height: 400px;
        background: var(--color-primary);
        top: -100px;
        right: -100px;
      }

      .blob-2 {
        width: 350px;
        height: 350px;
        background: var(--color-accent);
        bottom: -50px;
        left: -50px;
      }

      .reset-container {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 440px;
        padding: 2rem;
      }

      .reset-card {
        padding: 2.5rem;
        border-radius: 2rem;
        background: rgba(255, 255, 255, 0.7);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .glass-effect {
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
      }

      .success-content {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      h3 { margin: 1rem 0; font-weight: 700; color: var(--color-text-main); }
      p { color: var(--color-text-muted); line-height: 1.6; }

      .icon-wrapper {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .icon-wrapper .material-icons { font-size: 3rem; }
      .icon-wrapper.success { color: var(--color-success); background: rgba(34, 197, 94, 0.1); }

      .password-meter { display: flex; gap: 4px; margin-top: 8px; }
      .password-meter-segment { height: 4px; flex: 1; border-radius: 2px; background: var(--color-border); transition: background-color 0.3s ease; }
      .segment-weak { background: var(--color-error); }
      .segment-fair { background: orange; }
      .segment-good { background: #eab308; }
      .segment-strong { background: var(--color-success); }

      .password-feedback { font-size: 0.75rem; margin-top: 4px; font-weight: 500; }
      .feedback-weak { color: var(--color-error); }
      .feedback-fair { color: orange; }
      .feedback-good { color: #eab308; }
      .feedback-strong { color: var(--color-success); }

      .mini-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin { to { transform: rotate(360deg); } }
      .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      .animate-fade-in { animation: fadeIn 0.4s ease-out; }

      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
        70% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
        100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      }
      .shadow-pulse { animation: pulse 2s infinite; }
      .mr-2 { margin-right: 0.5rem; }
    </style>
  `
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  isLoading = false;
  isSuccess = false;
  token: string | null = null;

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.notificationService.error('Missing reset token. Please request a new link.');
    }
  }

  get passwordStrength() {
    return calculatePasswordStrength(this.resetForm.get('password')?.value || '');
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    const newPassword = this.resetForm.get('password')?.value || '';

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.notificationService.success('Password updated successfully!');
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notificationService.error(err.message || 'Failed to update password.');
      }
    });
  }
}
