import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    .login-container {
      max-width: 360px;
      margin: 0 auto;
    }
    .brand-title {
      font-size: 1.875rem;
      font-weight: 600;
      text-align: center;
      margin-bottom: 0.5rem;
      color: var(--color-gray-900);
    }
    .brand-subtitle {
      font-size: 1rem;
      text-align: center;
      margin-bottom: 2rem;
      color: var(--color-gray-600);
    }
    .password-toggle {
      position: absolute;
      right: 12px;
      bottom: 10px;
      cursor: pointer;
      color: var(--color-gray-400);
      user-select: none;
      transition: color var(--transition-fast);
    }
    .password-toggle:hover {
      color: var(--color-gray-600);
    }
  `],
  template: `
    <div class="login-container">
      <h3 class="brand-title">Log in</h3>
      <p class="brand-subtitle">Welcome back! Please enter your details.</p>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input 
            id="email" 
            type="text" 
            class="form-control" 
            [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            formControlName="email" 
            placeholder="Enter your email">
          <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="invalid-feedback">
            Valid email is required.
          </div>
        </div>

        <div class="form-group" style="position: relative;">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label class="form-label mb-0" for="password">Password</label>
          </div>
          <div style="position: relative;">
            <input 
              id="password" 
              [type]="showPassword ? 'text' : 'password'" 
              class="form-control" 
              [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              formControlName="password" 
              placeholder="••••••••">
            
            <span class="password-toggle material-icons" (click)="togglePassword()">
              {{ showPassword ? 'visibility_off' : 'visibility' }}
            </span>
          </div>
          
          <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="invalid-feedback">
            Password is required.
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="checkbox-wrap">
            <input type="checkbox" id="rememberMe" formControlName="rememberMe">
            <label for="rememberMe" class="text-sm m-0 user-select-none font-medium">Remember for 30 days</label>
          </div>
          <a routerLink="/auth/forgot-password" class="text-sm">Forgot Password?</a>
        </div>

        <button type="submit" class="btn btn-primary btn-block" [disabled]="loginForm.invalid || isLoading">
          <span *ngIf="!isLoading">Sign In</span>
          <span *ngIf="isLoading">Signing in...</span>
        </button>

        <div class="mt-4 text-center text-sm">
          <span class="text-muted">Don't have an account? </span>
          <a routerLink="/auth/register/student">Sign up</a>
        </div>
      </form>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  loginForm = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  showPassword = false;
  isLoading = false;

  ngOnInit() {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const { email, password, rememberMe } = this.loginForm.value;

    if (rememberMe) {
      localStorage.setItem('remembered_email', email!);
    } else {
      localStorage.removeItem('remembered_email');
    }

    this.authService.login(email!, password!).subscribe({
      next: (user) => {
        this.isLoading = false;
        if(user) {
          const returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'];
          
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else {
            // Role-based redirection
            const role = user.role?.toUpperCase();
            const isEmployee = user.isEmployee;

            if (role === 'ADMIN') {
              this.router.navigate(['/admin']);
            } else if (role === 'MANAGER') {
              this.router.navigate(['/manager']);
            } else if (role === 'REFERRAL') {
              this.router.navigate(['/referral']);
            } else if (role === 'COMPANY') {
              this.router.navigate(['/company']);
            } else if (role === 'STUDENT') {
              this.router.navigate(['/student']);
            } else if (
              role === 'VIDEO_EDITOR' || 
              role === 'JUNIOR_COUNSELLOR' || 
              role === 'SENIOR_COUNSELLOR' || 
              role === 'EMPLOYEE' || 
              isEmployee
            ) {
              this.router.navigate(['/employee']);
            } else {
              this.router.navigate(['/']);
            }
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notificationService.error(err.message || 'Login failed.');
      }
    });
  }
}
