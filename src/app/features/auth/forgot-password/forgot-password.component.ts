import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="text-center mb-4">
      <h3 class="mb-2">Reset Password</h3>
      <p class="text-muted text-sm">Enter your email and we'll send you a reset link</p>
    </div>

    <form *ngIf="!isSubmitted" [formGroup]="resetForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <input 
          id="email" 
          type="email" 
          class="form-control" 
          [class.is-invalid]="resetForm.get('email')?.invalid && resetForm.get('email')?.touched"
          formControlName="email" 
          placeholder="name@example.com">
      </div>

      <button type="submit" class="btn btn-primary btn-block mb-3" [disabled]="resetForm.invalid || isLoading">
        <span *ngIf="!isLoading">Send Reset Link</span>
        <span *ngIf="isLoading">Sending...</span>
      </button>
    </form>

    <!-- Success State -->
    <div *ngIf="isSubmitted" class="success-container animate-fade-in">
      <div class="success-icon-wrapper">
        <span class="material-icons">mark_email_read</span>
      </div>
      <h4 class="mb-3">Check your email</h4>
      <p class="text-muted text-sm mb-4">
        We have sent a password reset link to <br><strong>{{ resetForm.get('email')?.value }}</strong>
      </p>
      <button class="btn btn-outline btn-block" (click)="isSubmitted = false">
        Try another email
      </button>
    </div>
    
    <div class="text-center mt-4">
      <a routerLink="/auth/login" class="text-sm d-flex align-items-center justify-content-center">
        <span class="material-icons" style="font-size: 16px; margin-right: 4px;">arrow_back</span>
        Back to Login
      </a>
    </div>

    <style>
      .success-container {
        text-align: center;
        padding: 1.5rem 0;
      }
      .success-icon-wrapper {
        color: var(--color-primary);
        margin-bottom: 1.5rem;
      }
      .success-icon-wrapper .material-icons {
        font-size: 4rem;
        animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .animate-fade-in {
        animation: fadeIn 0.4s ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); opacity: 0; }
        to { opacity: 1; transform: translateY(0); opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0); }
        to { transform: scale(1); }
      }
    </style>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  
  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  isSubmitted = false;
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  onSubmit() {
    if (this.resetForm.invalid) return;
    
    const email = this.resetForm.get('email')?.value;
    if (!email) return;

    this.isLoading = true;
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSubmitted = true;
        this.notificationService.success('Reset link sent to your email.');
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notificationService.error(err.message || 'Failed to send reset link.');
      }
    });
  }
}
