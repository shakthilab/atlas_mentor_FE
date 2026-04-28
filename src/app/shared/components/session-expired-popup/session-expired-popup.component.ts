import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-expired-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="session-expired-overlay">
      <div class="session-expired-modal">
        <div class="session-expired-content">
          <div class="session-expired-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3>Session Expired</h3>
          <p>Your session has timed out. For security reasons, please log in again to continue.</p>
          <button (click)="handleLoginClick()" class="btn-primary-expired">
            Go to Login
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .session-expired-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 20px;
    }
    .session-expired-modal {
      background: white;
      border-radius: 20px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: popupIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .session-expired-content {
      padding: 32px;
      text-align: center;
    }
    .session-expired-icon {
      width: 64px;
      height: 64px;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .session-expired-icon svg {
      width: 32px;
      height: 32px;
    }
    h3 {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px;
    }
    p {
      color: #6b7280;
      margin: 0 0 32px;
      line-height: 1.5;
    }
    .btn-primary-expired {
      width: 100%;
      background: var(--color-primary, #667cb0);
      color: white;
      border: none;
      padding: 14px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 6px -1px rgba(102, 124, 176, 0.2);
    }
    .btn-primary-expired:hover {
      background: var(--color-primary-hover, #00267C);
      transform: translateY(-1px);
    }
    .btn-primary-expired:active {
      transform: scale(0.98);
    }
    @keyframes popupIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class SessionExpiredPopupComponent implements OnInit {
  @Output() onLogin = new EventEmitter<void>();

  ngOnInit() {
    console.log('SessionExpiredPopupComponent initialized');
  }

  handleLoginClick() {
    console.log('Login button clicked in popup');
    this.onLogin.emit();
  }
}
