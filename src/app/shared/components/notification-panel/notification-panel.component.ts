import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-overlay" *ngIf="isOpen" (click)="close.emit()"></div>
    <div class="notification-panel" [class.open]="isOpen">
      <div class="panel-header">
        <div class="header-main">
          <h2 class="panel-title">Notifications</h2>
          <span class="unread-count">4 New</span>
        </div>
        <div class="header-actions">
          <button class="btn-icon" (click)="close.emit()">
            <i data-lucide="x"></i>
          </button>
        </div>
      </div>

      <div class="panel-tabs">
        <button class="tab active">All</button>
        <button class="tab">Unread</button>
        <button class="tab">Archived</button>
      </div>

      <div class="notification-list">
        <div class="notification-item" *ngFor="let note of notifications" [class.unread]="note.unread">
          <div class="note-avatar-wrap">
            <div class="note-avatar" [ngClass]="note.type">
              <i [attr.data-lucide]="getIcon(note.type)"></i>
            </div>
            <div class="status-indicator" *ngIf="note.unread"></div>
          </div>
          <div class="note-body">
            <p class="note-text">
              <span class="note-user">{{ note.user }}</span>
              {{ note.message }}
            </p>
            <div class="note-footer">
              <span class="note-time">{{ note.time }}</span>
              <span class="dot-sep"></span>
              <button class="note-action-btn">Mark as read</button>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-footer">
        <button class="btn-mark-all">Mark all as read</button>
        <button class="btn-view-all">View all notifications</button>
      </div>
    </div>
  `,
  styles: [`
    .notification-overlay {
      position: fixed;
      inset: 0;
      background: rgba(16, 24, 40, 0.4);
      backdrop-filter: blur(4px);
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    .notification-panel {
      position: fixed;
      top: 0;
      right: -420px;
      width: 400px;
      height: 100vh;
      background: white;
      z-index: 1001;
      box-shadow: var(--shadow-xl);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--color-gray-200);
    }

    .notification-panel.open {
      right: 0;
    }

    .panel-header {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-gray-200);
    }

    .header-main {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .panel-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-gray-900);
      margin: 0;
    }

    .unread-count {
      background: var(--color-primary-light);
      color: var(--color-primary);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid var(--color-primary-border);
    }

    .panel-tabs {
      display: flex;
      padding: 0 1.5rem;
      border-bottom: 1px solid var(--color-gray-200);
      gap: 1rem;
    }

    .tab {
      background: none;
      border: none;
      padding: 0.875rem 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-gray-500);
      cursor: pointer;
      position: relative;
      transition: all var(--transition-fast);
    }

    .tab.active {
      color: var(--color-primary);
    }

    .tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--color-primary);
    }

    .notification-list {
      flex: 1;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      border-bottom: 1px solid var(--color-gray-100);
    }

    .notification-item:hover {
      background: var(--color-gray-50);
    }

    .notification-item.unread {
      background: #fdfbff;
    }

    .note-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .note-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-gray-200);
    }

    .note-avatar.payment { background: #ecfdf3; color: #027a48; border-color: #abefc6; }
    .note-avatar.user { background: #f0f9ff; color: #026aa2; border-color: #b9e6fe; }
    .note-avatar.task { background: #fffcf5; color: #b54708; border-color: #fedf89; }

    .note-avatar i { width: 20px; height: 20px; }

    .status-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      background: var(--color-primary);
      border: 2px solid white;
      border-radius: 50%;
    }

    .note-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .note-text {
      font-size: 0.875rem;
      color: var(--color-gray-600);
      margin: 0;
      line-height: 1.5;
    }

    .note-user {
      color: var(--color-gray-900);
      font-weight: 600;
    }

    .note-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .note-time {
      font-size: 0.75rem;
      color: var(--color-gray-500);
    }

    .dot-sep {
      width: 3px;
      height: 3px;
      background: var(--color-gray-300);
      border-radius: 50%;
    }

    .note-action-btn {
      background: none;
      border: none;
      color: var(--color-primary);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .panel-footer {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      border-top: 1px solid var(--color-gray-200);
    }

    .btn-mark-all {
      background: none;
      border: none;
      color: var(--color-gray-600);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem;
    }
    .btn-mark-all:hover { color: var(--color-gray-900); }

    .btn-view-all {
      background: var(--color-primary);
      color: white;
      border: 1px solid var(--color-primary);
      padding: 0.625rem;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-xs);
    }

    .btn-view-all:hover {
      background: var(--color-primary-hover);
      border-color: var(--color-primary-hover);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 480px) {
      .notification-panel {
        width: 100%;
        right: -100%;
      }
    }
  `],
})
export class NotificationPanelComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  notifications = [
    { type: 'payment', user: 'Mukul Sharma', message: 'has successfully paid the Tuition Fee deposit.', time: '2 mins ago', unread: true },
    { type: 'user', user: 'New Student', message: 'has registered from Delhi Branch.', time: '1 hour ago', unread: true },
    { type: 'task', user: 'System', message: 'Visa Application for Priya Rai is overdue.', time: '3 hours ago', unread: true },
    { type: 'user', user: 'Rohan Gupta', message: 'updated the status of 4 tasks.', time: 'Yesterday', unread: false }
  ];

  getIcon(type: string) {
    switch(type) {
      case 'payment': return 'credit-card';
      case 'user': return 'user-plus';
      case 'task': return 'alert-circle';
      default: return 'bell';
    }
  }

  ngAfterViewChecked() {
    if (typeof (window as any).lucide !== 'undefined') {
      (window as any).lucide.createIcons();
    }
  }
}
