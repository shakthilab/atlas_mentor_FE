import { Component, inject, AfterViewInit } from '@angular/core';
declare const lucide: any;
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-branch-partner-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper">

      <div class="welcome-header">
        <h1 class="welcome-title">Branch Partner Dashboard</h1>
        <p class="welcome-subtitle">Welcome back - {{ getCurrentBranchName() }} Branch</p>
      </div>

      <!-- KPI Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Total Leads</span>
            <div class="stat-value">{{ branchStats.totalLeads }}</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>{{ branchStats.leadsGrowth }}%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap leads" style="background: #e0f2fe; color: #0ea5e9;">
            <i data-lucide="users"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Active Students</span>
            <div class="stat-value">{{ branchStats.activeStudents }}</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>{{ branchStats.studentsGrowth }}%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap registered" style="background: #ecfdf5; color: #10b981;">
            <i data-lucide="graduation-cap"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Team Members</span>
            <div class="stat-value">{{ branchStats.teamMembers }}</div>
            <div class="stat-trend up">
              <i data-lucide="users"></i>
              <span>{{ branchStats.teamGrowth }}%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap team" style="background: #f3e8ff; color: #9333ea;">
            <i data-lucide="briefcase"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Branch Revenue</span>
            <div class="stat-value">{{ branchStats.revenue | currency:'USD':'symbol':'1.0-0' }}</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>{{ branchStats.revenueGrowth }}%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap revenue" style="background: #fffbeb; color: #f59e0b;">
            <i data-lucide="dollar-sign"></i>
          </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="quick-actions-grid">
        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">Quick Actions</h3>
          </div>
          <div class="actions-grid">
            <button class="action-card" (click)="navigateTo('/branch-partner/tasks')">
              <div class="action-icon" style="background: #e0f2fe; color: #0ea5e9;">
                <i data-lucide="check-square"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Tasks</div>
                <div class="action-subtitle">{{ pendingTasks }} pending</div>
              </div>
            </button>
            
            <button class="action-card" (click)="navigateTo('/branch-partner/students')">
              <div class="action-icon" style="background: #ecfdf5; color: #10b981;">
                <i data-lucide="graduation-cap"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Students</div>
                <div class="action-subtitle">{{ branchStats.activeStudents }} total</div>
              </div>
            </button>
            
            <button class="action-card" (click)="navigateTo('/branch-partner/leads')">
              <div class="action-icon" style="background: #fef3c7; color: #f59e0b;">
                <i data-lucide="users"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Leads</div>
                <div class="action-subtitle">{{ branchStats.totalLeads }} total</div>
              </div>
            </button>
            
            <button class="action-card" (click)="navigateTo('/branch-partner/employees')">
              <div class="action-icon" style="background: #f3e8ff; color: #9333ea;">
                <i data-lucide="briefcase"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Employees</div>
                <div class="action-subtitle">{{ branchStats.teamMembers }} members</div>
              </div>
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header">
            <h3 class="section-title">Management Tools</h3>
          </div>
          <div class="actions-grid">
            <button class="action-card" (click)="navigateTo('/branch-partner/hierarchy')">
              <div class="action-icon" style="background: #e0e7ff; color: #6366f1;">
                <i data-lucide="git-branch"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Hierarchy</div>
                <div class="action-subtitle">Team structure</div>
              </div>
            </button>
            
            <button class="action-card" (click)="navigateTo('/branch-partner/referrals')">
              <div class="action-icon" style="background: #fef2f2; color: #ef4444;">
                <i data-lucide="share-2"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Referrals</div>
                <div class="action-subtitle">Manage referrals</div>
              </div>
            </button>
            
            <button class="action-card" (click)="navigateTo('/branch-partner/payments')">
              <div class="action-icon" style="background: #fffbeb; color: #f59e0b;">
                <i data-lucide="credit-card"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Payments</div>
                <div class="action-subtitle">Track payments</div>
              </div>
            </button>
            
            <button class="action-card" (click)="navigateTo('/branch-partner/documents')">
              <div class="action-icon" style="background: #f0fdf4; color: #22c55e;">
                <i data-lucide="file-text"></i>
              </div>
              <div class="action-content">
                <div class="action-title">Documents</div>
                <div class="action-subtitle">Manage files</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity Table -->
      <div class="table-card">
        <div class="table-card-header">
          <div class="table-header-title">
            <h2>Recent Activity</h2>
            <span class="count-badge">{{ recentActivity.length }} new</span>
          </div>
          <button class="btn-icon">
            <span class="material-icons">more_vert</span>
          </button>
        </div>
        <div style="overflow-x: auto;">
          <table class="premium-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Target</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let activity of recentActivity" class="clickable-row">
                <td style="font-weight: 600; color: var(--color-gray-900);">{{ activity.user }}</td>
                <td>{{ activity.action }}</td>
                <td>{{ activity.target }}</td>
                <td>
                  <span class="status-badge-tp" [ngClass]="activity.type">{{ activity.date }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
   

    /* Breadcrumbs */
   

   

   

   

   

   

    /* KPI Grid */
   

   

   

   

   

   

   

   
   

   

   

   

    /* Quick Actions Grid */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .section-card {
      background: white;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-gray-200);
      box-shadow: var(--shadow-sm);
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-gray-900);
      margin: 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: left;
    }

    .action-card:hover {
      background: white;
      border-color: var(--color-gray-300);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .action-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .action-icon i {
      width: 20px;
      height: 20px;
    }

    .action-content {
      flex: 1;
    }

    .action-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-gray-900);
      margin-bottom: 0.25rem;
    }

    .action-subtitle {
      font-size: 0.75rem;
      color: var(--color-gray-600);
    }

    /* Table Styles */
   

   

   

   

   

    .btn-icon {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-icon:hover {
      background: var(--color-gray-100);
    }

   

   

   

    .clickable-row {
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .clickable-row:hover {
      background-color: var(--color-gray-50);
    }

   

    .status-badge-tp.update { background: #e0f2fe; color: #0ea5e9; border: 1px solid #bae6fd; }
    .status-badge-tp.payment { background: #ecfdf5; color: #10b981; border: 1px solid #abefc6; }
    .status-badge-tp.task { background: #fef3c7; color: #f59e0b; border: 1px solid #fde68a; }

    @media (max-width: 768px) {
     
     
      .quick-actions-grid {
        grid-template-columns: 1fr;
      }
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BranchPartnerDashboardComponent implements AfterViewInit {
  authService = inject(AuthService);
  router = inject(Router);

  // Branch-specific statistics
  branchStats = {
    totalLeads: 156,
    leadsGrowth: 8.5,
    activeStudents: 89,
    studentsGrowth: 12.3,
    teamMembers: 12,
    teamGrowth: 5.2,
    revenue: 45600,
    revenueGrowth: 18.7
  };

  pendingTasks = 23;

  recentActivity = [
    { type: 'update', user: 'John Smith', action: 'updated documents for', target: 'Emily Johnson', date: '10 mins ago' },
    { type: 'payment', user: 'System', action: 'verified payment of $1,200 for', target: 'Michael Brown', date: '2 hours ago' },
    { type: 'task', user: 'Sarah Davis', action: 'completed visa processing task for', target: 'Lisa Wilson', date: '5 hours ago' },
    { type: 'update', user: 'Manager', action: 'approved registration request from', target: 'University of Manchester', date: 'Yesterday' }
  ];

  ngAfterViewInit() {
    this.initIcons();
  }

  private initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  getCurrentBranchName(): string {
    const user = (this.authService.currentUser$ as any)?.value;
    return user?.branchName || 'Main';
  }

  getCurrentBranchId(): string {
    const user = (this.authService.currentUser$ as any)?.value;
    return user?.branchId || '1';
  }

  getCurrentUserId(): string {
    const user = (this.authService.currentUser$ as any)?.value;
    return user?.id || '';
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}

