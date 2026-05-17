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
        
        <a [routerLink]="getRoutePath('')" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
          <div class="link-content">
            <i data-lucide="layout-dashboard"></i>
            <span>Dashboard</span>
          </div>
        </a>

        <!-- Admin/Manager specific menu items -->
        <ng-container *ngIf="isAdminOrManager()">
          <a [routerLink]="getRoutePath('tasks')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="check-square"></i>
              <span>Tasks</span>
            </div>
          </a>

          <div class="nav-subtitle" *ngIf="!isCollapsed">MANAGEMENT</div>

          <a [routerLink]="getRoutePath('leads')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="users"></i>
              <span>Leads</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('students')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="graduation-cap"></i>
              <span>Students</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('employees')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="user-cog"></i>
              <span>Employees</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('hierarchy')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="git-branch"></i>
              <span>Hierarchy</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('referrals')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="user-plus"></i>
              <span>Referrals</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('companies')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="briefcase"></i>
              <span>Companies</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('resources')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="package"></i>
              <span>Resources</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('branches')" routerLinkActive="active" class="nav-link" *ngIf="isAdmin()">
            <div class="link-content">
              <i data-lucide="building-2"></i>
              <span>Branches</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('payments')" routerLinkActive="active" class="nav-link" *ngIf="isAdmin()">
            <div class="link-content">
              <i data-lucide="credit-card"></i>
              <span>Payments</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('documents')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="folder-open"></i>
              <span>Documents</span>
            </div>
          </a>
        </ng-container>

        <!-- Company/Referral specific menu items -->
        <ng-container *ngIf="isCompanyOrReferral()">
          <div class="nav-subtitle" *ngIf="!isCollapsed">MANAGEMENT</div>

          <a [routerLink]="getRoutePath('leads')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="users"></i>
              <span>Leads</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('students')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="graduation-cap"></i>
              <span>Students</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('payments')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="credit-card"></i>
              <span>Payments</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('resources')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="package"></i>
              <span>Resources</span>
            </div>
          </a>
        </ng-container>

        <!-- Student specific menu items -->
        <ng-container *ngIf="isStudent()">
          <div class="nav-subtitle" *ngIf="!isCollapsed">MY ACCOUNT</div>

          <a [routerLink]="getRoutePath('profile')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="user"></i>
              <span>Profile</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('documents')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="folder-open"></i>
              <span>Documents</span>
            </div>
          </a>
        </ng-container>

        <!-- Employee specific menu items -->
        <ng-container *ngIf="isEmployee()">
          <div class="nav-subtitle" *ngIf="!isCollapsed">MY WORK</div>

          <a [routerLink]="getRoutePath('tasks')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="check-square"></i>
              <span>Tasks</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('leads')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="users"></i>
              <span>Leads</span>
            </div>
          </a>

          <a [routerLink]="getRoutePath('students')" routerLinkActive="active" class="nav-link">
            <div class="link-content">
              <i data-lucide="graduation-cap"></i>
              <span>Students</span>
            </div>
          </a>
        </ng-container>

        <div class="nav-subtitle" *ngIf="!isCollapsed">OTHERS</div>

        <a [routerLink]="getRoutePath('settings')" routerLinkActive="active" class="nav-link">
          <div class="link-content">
            <i data-lucide="settings"></i>
            <span>Settings</span>
          </div>
        </a>
      </nav>

      <!-- Sidebar Footer Logout -->
      <div class="sidebar-logout">
        <button (click)="openLogoutConfirm()" class="logout-footer-btn">
          <span class="material-icons" style="font-size: 18px;">logout</span>
          <span *ngIf="!isCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Logout Confirmation Modal -->
    <div class="modal-overlay logout-modal" *ngIf="showLogoutConfirm" (click)="closeLogoutConfirm()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-body text-center">
          <div class="logout-icon-wrap">
            <span class="material-icons">logout</span>
          </div>
          <h2 class="modal-title">Confirm Logout</h2>
          <p class="modal-subtitle">Are you sure you want to log out of your account?</p>
          
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="closeLogoutConfirm()">Cancel</button>
            <button class="btn btn-primary btn-logout" (click)="confirmLogout()">Logout</button>
          </div>
        </div>
      </div>
    </div>
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

    .logout-footer-btn i, .logout-footer-btn .material-icons {
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

    /* Logout Modal Styles */
    .modal-overlay.logout-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease-out;
    }

    .logout-modal .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .logout-icon-wrap {
      width: 56px;
      height: 56px;
      background: #fee4e2;
      color: #d92d20;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .logout-icon-wrap .material-icons {
      font-size: 28px;
    }

    .logout-modal .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #101828;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .logout-modal .modal-subtitle {
      font-size: 0.9375rem;
      color: #667085;
      margin-bottom: 2rem;
      text-align: center;
    }

    .modal-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .btn-logout {
      background: #d92d20 !important;
      border-color: #d92d20 !important;
      color: white !important;
    }

    .btn-logout:hover {
      background: #b42318 !important;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class DashboardSidebarComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  authService = inject(AuthService);
  showLogoutConfirm = false;

  openLogoutConfirm() {
    this.showLogoutConfirm = true;
  }

  closeLogoutConfirm() {
    this.showLogoutConfirm = false;
  }

  confirmLogout() {
    this.showLogoutConfirm = false;
    this.authService.logout();
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

  /**
   * Generate route path based on user role
   * @param path - The route path (e.g., 'tasks', 'students')
   * @returns Full route path with role prefix (e.g., '/admin/tasks', '/manager/tasks')
   */
  getRoutePath(path: string): string {
    const currentUser = this.authService.currentUserValue;
    const userRole = currentUser?.role?.toUpperCase();
    const isEmployee = currentUser?.isEmployee;
    
    // Determine base route based on role
    let baseRoute = '/admin'; // default
    
    if (userRole === 'MANAGER') {
      baseRoute = '/manager';
    } else if (userRole === 'BRANCH_PARTNER') {
      baseRoute = '/branch-partner';
    } else if (userRole === 'STUDENT') {
      baseRoute = '/student';
    } else if (isEmployee || userRole === 'EMPLOYEE' || userRole === 'SENIOR_COUNSELLOR' || userRole === 'JUNIOR_COUNSELLOR') {
      baseRoute = '/employee';
    } else if (userRole === 'COMPANY') {
      baseRoute = '/company';
    } else if (userRole === 'REFERRAL') {
      baseRoute = '/referral';
    }
    
    // Return base route for empty path, or base + path
    return path ? `${baseRoute}/${path}` : baseRoute;
  }

  /**
   * Check if current user is admin
   * @returns true if user is admin, false otherwise
   */
  isAdmin(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role?.toUpperCase() === 'ADMIN';
  }

  /**
   * Check if current user is admin or manager
   * @returns true if user is admin or manager, false otherwise
   */
  isAdminOrManager(): boolean {
    const currentUser = this.authService.currentUserValue;
    const userRole = currentUser?.role?.toUpperCase();
    return userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'BRANCH_PARTNER';
  }

  /**
   * Check if current user is company or referral
   * @returns true if user is company or referral, false otherwise
   */
  isCompanyOrReferral(): boolean {
    const currentUser = this.authService.currentUserValue;
    const userRole = currentUser?.role?.toUpperCase();
    return userRole === 'COMPANY' || userRole === 'REFERRAL';
  }

  /**
   * Check if current user is student
   * @returns true if user is student, false otherwise
   */
  isStudent(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role?.toUpperCase() === 'STUDENT';
  }

  /**
   * Check if current user is employee
   * @returns true if user has isEmployee flag, false otherwise
   */
  isEmployee(): boolean {
    const currentUser = this.authService.currentUserValue;
    const userRole = currentUser?.role?.toUpperCase();
    return currentUser?.isEmployee === true || userRole === 'EMPLOYEE' || userRole === 'SENIOR_COUNSELLOR' || userRole === 'JUNIOR_COUNSELLOR';
  }
}
