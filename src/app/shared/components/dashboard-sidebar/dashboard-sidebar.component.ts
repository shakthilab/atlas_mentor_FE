import { Component, Input, Output, EventEmitter, inject, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

declare const lucide: any;

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="dash-sidebar" [class.open]="isOpen" [class.collapsed]="isCollapsed">
      <!-- Sidebar Logo -->
      <div class="sidebar-brand">
        <div class="brand-image-container" *ngIf="!isCollapsed">
          <img src="assets/Atlas-Mentor-Pvt-Ltd.webp" alt="Atlas Mentor Logo" class="brand-img">
        </div>
        <div class="brand-logo-small" *ngIf="isCollapsed">AM</div>
        <button class="collapse-btn-mobile" (click)="toggleCollapse.emit()" *ngIf="isOpen">
          <i data-lucide="x"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="nav-section">
        <div class="nav-subtitle" *ngIf="!isCollapsed">MAIN MENU</div>
        
        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
          <div class="link-content">
            <i data-lucide="layout-dashboard"></i>
            <span>Dashboard</span>
          </div>
        </a>

        <a routerLink="/admin/tasks" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="check-square"></i>
            <span>Tasks</span>
          </div>
        </a>

        <div class="nav-subtitle" *ngIf="!isCollapsed">MANAGEMENT</div>

        <a routerLink="/admin/leads" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="users"></i>
            <span>Leads</span>
          </div>
        </a>

        <a routerLink="/admin/students" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="graduation-cap"></i>
            <span>Students</span>
          </div>
        </a>

        <a routerLink="/admin/employees" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="user-cog"></i>
            <span>Employees</span>
          </div>
        </a>

        <a routerLink="/admin/hierarchy" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="git-branch"></i>
            <span>Hierarchy</span>
          </div>
        </a>

        <a routerLink="/admin/referrals" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="user-plus"></i>
            <span>Referrals</span>
          </div>
        </a>

        <a routerLink="/admin/companies" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="briefcase"></i>
            <span>Companies</span>
          </div>
        </a>

        <a routerLink="/admin/branches" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="building-2"></i>
            <span>Branches</span>
          </div>
        </a>

        <a routerLink="/admin/payments" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="credit-card"></i>
            <span>Payments</span>
          </div>
        </a>

        <a routerLink="/admin/documents" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="folder-open"></i>
            <span>Documents</span>
          </div>
        </a>

        <div class="nav-subtitle" *ngIf="!isCollapsed">OTHERS</div>

        <a routerLink="/admin/settings" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="settings"></i>
            <span>Settings</span>
          </div>
        </a>
      </nav>

      <!-- Sidebar Footer Logout -->
      <div class="sidebar-logout">
        <button (click)="authService.logout()" class="logout-footer-btn">
          <i data-lucide="log-out"></i>
          <span *ngIf="!isCollapsed">Logout</span>
        </button>
      </div>
    </aside>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: [`
    :host { display: contents; }
    
    .dash-sidebar {
      width: var(--dash-sidebar-width);
      height: 100vh;
      background: #ffffff;
      border-right: 1px solid var(--dash-border);
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .sidebar-brand {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--dash-border);
      height: var(--dash-header-height);
    }

    .brand-image-container {
      display: flex;
      align-items: center;
      overflow: hidden;
      max-width: 180px;
    }

    .brand-img {
      height: 32px;
      width: auto;
      object-fit: contain;
    }

    .brand-logo-small {
      width: 32px;
      height: 32px;
      background: var(--color-primary);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .nav-section {
      flex: 1;
      padding: 1.5rem 0.75rem;
      overflow-y: auto;
    }

    .nav-subtitle {
      padding: 0 1rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .nav-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0.75rem;
      margin: 0.125rem 0;
      border-radius: var(--radius-md);
      color: var(--color-gray-700);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9375rem;
      transition: all var(--transition-fast);
    }

    .link-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-link i {
      width: 20px;
      height: 20px;
      color: var(--color-gray-500);
      stroke-width: 2;
    }

    .nav-link:hover {
      background: var(--color-gray-50);
      color: var(--color-gray-900);
    }

    .nav-link:hover i {
      color: var(--color-gray-700);
    }

    .nav-link.active {
      background: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: 600;
    }

    .nav-link.active i {
      color: var(--color-primary);
    }

    /* Sidebar Footer Logout */
    .sidebar-logout {
      padding: 1.25rem;
      border-top: 1px solid var(--dash-border);
    }

    .logout-footer-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: white;
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-md);
      color: var(--color-gray-700);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-xs);
    }

    .logout-footer-btn:hover {
      background: var(--color-gray-50);
      color: var(--color-gray-900);
      border-color: var(--color-gray-300);
    }

    .logout-footer-btn i {
      width: 18px;
      height: 18px;
      color: var(--color-gray-500);
    }

    .collapse-btn-mobile {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: white;
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-md);
      color: var(--color-gray-500);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .collapse-btn-mobile:hover {
      background: var(--color-gray-50);
      color: var(--color-gray-900);
    }

    /* Responsive Sidebar */
    @media (max-width: 1024px) {
      .dash-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 1000;
        transform: translateX(-100%);
        box-shadow: var(--shadow-xl);
        width: 280px;
      }

      .dash-sidebar.open {
        transform: translateX(0);
      }
    }

    /* Collapsed State (Desktop) */
    @media (min-width: 1025px) {
      .dash-sidebar.collapsed {
        width: var(--dash-sidebar-collapsed);
      }

      .dash-sidebar.collapsed .sidebar-brand {
        justify-content: center;
        padding: 1.5rem 0.5rem;
      }

      .dash-sidebar.collapsed .nav-link {
        justify-content: center;
        padding: 0.75rem;
      }

      .dash-sidebar.collapsed .link-content span,
      .dash-sidebar.collapsed .nav-subtitle,
      .dash-sidebar.collapsed .logout-footer-btn span,
      .dash-sidebar.collapsed .chevron-icon {
        display: none;
      }

      .dash-sidebar.collapsed .logout-footer-btn {
        justify-content: center;
        padding: 0.625rem;
      }
    }
  `]
})
export class DashboardSidebarComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  authService = inject(AuthService);

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
