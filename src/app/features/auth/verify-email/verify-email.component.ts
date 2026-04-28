import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verify-page">
      <div class="background-blobs">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>

      <div class="verify-container">
        <div class="verify-card glass-effect">
          <!-- Loading State -->
          <div *ngIf="state === 'loading'" class="state-content">
            <div class="spinner"></div>
            <h2>Verifying Email</h2>
            <p>Please wait while we verify your account...</p>
          </div>

          <!-- Success State -->
          <div *ngIf="state === 'success'" class="state-content">
            <div class="icon-wrapper success shadow-pulse">
              <span class="material-icons">check_circle</span>
            </div>
            <h2>Email Verified!</h2>
            <p>Your email has been successfully verified. You can now log in to your account.</p>
            <button class="btn btn-primary btn-block mt-4" routerLink="/auth/login">
              Continue to Login
            </button>
          </div>

          <!-- Error State -->
          <div *ngIf="state === 'error'" class="state-content">
            <div class="icon-wrapper error">
              <span class="material-icons">error_outline</span>
            </div>
            <h2>Verification Failed</h2>
            <p class="error-msg">{{ errorMessage }}</p>
            <div class="d-flex flex-column gap-3 mt-4 w-100">
                <button class="btn btn-primary" routerLink="/auth/login">
                    Back to Login
                </button>
                <button class="btn btn-outline" (click)="retryVerification()" *ngIf="token">
                    Retry Verification
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .verify-page {
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

      .verify-container {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 480px;
        padding: 2rem;
      }

      .verify-card {
        padding: 3.5rem 2.5rem;
        border-radius: 2rem;
        background: rgba(255, 255, 255, 0.7);
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .glass-effect {
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
      }

      .state-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: fadeIn 0.5s ease-out;
      }

      h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--color-text-main);
        margin: 1.5rem 0 0.75rem;
      }

      p {
        color: var(--color-text-muted);
        line-height: 1.6;
        margin-bottom: 1rem;
      }

      .icon-wrapper {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .icon-wrapper .material-icons {
        font-size: 4rem;
      }

      .icon-wrapper.success {
        color: var(--color-success);
        background: rgba(34, 197, 94, 0.1);
      }

      .icon-wrapper.error {
        color: var(--color-error);
        background: rgba(239, 68, 68, 0.1);
      }

      .spinner {
        width: 80px;
        height: 80px;
        border: 4px solid var(--color-primary-light);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .error-msg {
        background: rgba(239, 68, 68, 0.05);
        padding: 1rem;
        border-radius: 0.75rem;
        border-left: 4px solid var(--color-error);
        font-size: 0.9rem;
      }

      .shadow-pulse {
        animation: pulse 2s infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
        70% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
        100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
      }

      .gap-3 { gap: 0.75rem; }
      .w-100 { width: 100%; }
      .flex-column { flex-direction: column; }
    </style>
  `
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  state: 'loading' | 'success' | 'error' = 'loading';
  errorMessage = '';
  token: string | null = null;

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.state = 'error';
      this.errorMessage = 'Verification token is missing. Please check your link.';
      return;
    }

    this.verify();
  }

  verify() {
    this.state = 'loading';
    this.authService.verifyEmail(this.token!).subscribe({
      next: () => {
        this.state = 'success';
      },
      error: (err: any) => {
        this.state = 'error';
        this.errorMessage = err.message || 'The verification link may have expired or is invalid.';
      }
    });
  }

  retryVerification() {
    this.verify();
  }
}
