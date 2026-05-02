import { Component, inject, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

declare const lucide: any;

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="main-header">
      <div class="header-left">
        <button class="hamburger-btn" (click)="toggleSidebar.emit()">
          <i data-lucide="menu"></i>
        </button>
        <div class="search-container">
          <i data-lucide="search" class="search-icon"></i>
          <input type="text" placeholder="Search..." class="search-input">
          <div class="search-shortcut">MK</div>
        </div>
      </div>

      <div class="header-right">
        <div class="header-actions">
          <button class="action-btn" title="Help">
            <i data-lucide="help-circle"></i>
          </button>
          
          <button class="action-btn" title="Notifications" (click)="toggleNotifications.emit()">
            <i data-lucide="bell"></i>
            <span class="notification-badge">2</span>
          </button>
        </div>

        <div class="profile-container">
          <div class="user-profile-section" (click)="showProfileMenu = !showProfileMenu">
            <div class="user-avatar-circle" [style.background]="userAvatarBg" [style.color]="userAvatarColor">
              <span>{{ userInitials }}</span>
            </div>
            <div class="user-info">
              <div class="user-name">{{ currentUser?.name || 'User' }}</div>
              <div class="user-role">{{ currentUser?.role || '' }}</div>
            </div>
            <i data-lucide="chevron-down" class="chevron-icon" [class.rotated]="showProfileMenu"></i>
          </div>

          <!-- Profile Dropdown -->
          <div class="profile-dropdown" *ngIf="showProfileMenu">
            <div class="dropdown-header">
              <div class="dropdown-user-name">{{ currentUser?.name || 'User' }}</div>
              <div class="dropdown-user-email">{{ currentUser?.email || '' }}</div>
            </div>
            
            <div class="dropdown-body">
              <a routerLink="/admin/settings" class="dropdown-item" (click)="showProfileMenu = false">
                <i data-lucide="settings"></i>
                <span>Settings</span>
              </a>
            </div>

            <div class="dropdown-footer">
              <button class="dropdown-item logout" (click)="authService.logout()">
                <span class="material-icons" style="font-size: 18px; margin-right: 8px;">logout</span>
                <span>Sign out</span>
              </button>
            </div>
          </div>
          
          <!-- Click outside overlay -->
          <div class="dropdown-overlay" *ngIf="showProfileMenu" (click)="showProfileMenu = false"></div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host { 
      display: block; 
      width: 100%; 
      background: #ffffff;
      border-bottom: 1px solid var(--dash-border);
      position: relative;
    }

    .main-header {
      height: var(--dash-header-height);
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;
    }

    .hamburger-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: none;
      color: var(--color-gray-500);
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .hamburger-btn:hover {
      background: var(--color-gray-50);
      color: var(--color-gray-700);
    }

    .search-container {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-md);
      padding: 0.625rem 0.875rem;
      gap: 0.5rem;
      width: 100%;
      max-width: 320px;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-xs);
    }

    .search-container:focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-primary-light);
    }

    .search-icon {
      width: 18px;
      height: 18px;
      color: var(--color-gray-400);
    }

    .search-input {
      border: none;
      background: none;
      outline: none;
      flex: 1;
      font-size: 0.95rem;
      color: var(--color-gray-900);
    }

    .search-input::placeholder {
      color: var(--color-gray-500);
    }

    .search-shortcut {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-gray-500);
      padding: 2px 6px;
      background: var(--color-gray-100);
      border: 1px solid var(--color-gray-200);
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .action-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--color-gray-500);
      cursor: pointer;
      border-radius: var(--radius-md);
      position: relative;
      transition: all var(--transition-fast);
    }

    .action-btn:hover {
      background: var(--color-gray-50);
      color: var(--color-gray-700);
    }

    .action-btn i {
      width: 20px;
      height: 20px;
    }

    .notification-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: var(--color-error);
      border-radius: 50%;
      border: 2px solid white;
    }

    /* Profile Section & Dropdown */
    .profile-container {
      position: relative;
    }

    .user-profile-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.375rem;
      padding-right: 0.75rem;
      border-radius: var(--radius-xl);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .user-profile-section:hover {
      background: var(--color-gray-50);
    }

    .user-avatar-circle {
      width: 36px;
      height: 36px;
      background: var(--color-primary-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);
      font-weight: 600;
      font-size: 0.875rem;
      border: 1px solid var(--color-primary-border);
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-gray-900);
      line-height: 1.25;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--color-gray-500);
      font-weight: 400;
    }

    .chevron-icon {
      width: 16px;
      height: 16px;
      color: var(--color-gray-400);
      transition: transform 0.2s;
    }

    .chevron-icon.rotated {
      transform: rotate(180deg);
    }

    .profile-dropdown {
      position: absolute;
      top: calc(100% + 0.75rem);
      right: 0;
      width: 240px;
      background: white;
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 1001;
      overflow: hidden;
      animation: dropdownSlide 0.2s ease-out;
    }

    @keyframes dropdownSlide {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dropdown-header {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--color-gray-100);
    }

    .dropdown-user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-gray-900);
    }

    .dropdown-user-email {
      font-size: 0.875rem;
      color: var(--color-gray-600);
      margin-top: 2px;
    }

    .dropdown-body {
      padding: 0.25rem;
    }

    .dropdown-footer {
      padding: 0.25rem;
      border-top: 1px solid var(--color-gray-100);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      color: var(--color-gray-700);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      cursor: pointer;
      width: 100%;
      border: none;
      background: none;
      text-align: left;
    }

    .dropdown-item:hover {
      background: var(--color-gray-50);
      color: var(--color-gray-900);
    }

    .dropdown-item i, .dropdown-item .material-icons {
      width: 18px;
      height: 18px;
      color: var(--color-gray-400);
    }

    .dropdown-item.logout {
      color: var(--color-error);
    }

    .dropdown-item.logout:hover {
      background: var(--color-gray-50);
    }

    .dropdown-item.logout i, .dropdown-item.logout .material-icons {
      color: var(--color-error);
    }

    .dropdown-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
    }

    @media (max-width: 1024px) {
      .main-header {
        padding: 0 1rem;
      }
      
      .search-container {
        max-width: 200px;
      }
      
      .search-shortcut {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .search-container, .user-info, .chevron-icon {
        display: none !important;
      }
      
      .header-actions {
        gap: 0;
      }
      
      .user-profile-section {
        padding-right: 0.375rem;
      }
    }

    @media (max-width: 480px) {
      .action-btn[title="Help"] {
        display: none;
      }
    }
  `]
})
export class DashboardHeaderComponent implements AfterViewInit {
  authService = inject(AuthService);
  showProfileMenu = false;

  @Output() toggleNotifications = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  get currentUser() {
    return this.authService.currentUserValue;
  }

  get userInitials(): string {
    const name = this.currentUser?.name || '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Deterministic color based on name
  get userAvatarBg(): string {
    const colors = [
      '#eff4ff', '#fdf2fa', '#ecfdf3', '#fff8e1',
      '#fef3c7', '#e0f2fe', '#f3e8ff', '#fce7f3'
    ];
    const name = this.currentUser?.name || '';
    const idx = name.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % colors.length;
    return colors[idx];
  }

  get userAvatarColor(): string {
    const colors = [
      '#2e90fa', '#c11574', '#027a48', '#b45309',
      '#d97706', '#0284c7', '#7c3aed', '#db2777'
    ];
    const name = this.currentUser?.name || '';
    const idx = name.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % colors.length;
    return colors[idx];
  }

  ngAfterViewInit() {
    this.initIcons();
  }

  ngAfterViewChecked() {
    this.initIcons();
  }

  private initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}
