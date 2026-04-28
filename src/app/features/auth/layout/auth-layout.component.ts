import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-background-app) 100%);
      padding: 2rem;
    }
    
    .auth-card {
      background: var(--color-background-card);
      width: 100%;
      max-width: 440px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .auth-card.wide {
      max-width: 600px;
    }

    .auth-header {
      padding: 2rem 2rem 1rem;
      text-align: center;
    }

    /* Abstract shapes for visual interest */
    .shape {
      position: absolute;
      border-radius: 50%;
      background: var(--color-primary);
      opacity: 0.05;
      z-index: 0;
    }
    .shape-1 { width: 300px; height: 300px; top: -150px; right: -150px; }
    .shape-2 { width: 200px; height: 200px; bottom: -100px; left: -100px; background: var(--color-accent); }
    
    .auth-content {
      padding: 0 2rem 2rem;
      position: relative;
      z-index: 1;
    }
  `],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        
        <div class="auth-header">
          <h2 class="mb-1">Atlas Mentor</h2>
          <p class="text-muted text-sm">Empowering your medical journey</p>
        </div>

        <div class="auth-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
