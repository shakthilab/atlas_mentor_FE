import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

declare const lucide: any;

@Component({
  selector: 'app-referral-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper">
      <!-- Top Bar / Breadcrumbs -->
      <div class="dashboard-header-tp">

        
        <div class="header-main-tp">
          <div class="header-info-tp">
            <h1 class="welcome-title">Referral Dashboard</h1>
            <p class="welcome-subtitle">Welcome back! Here's what's happening with your referrals today.</p>
          </div>
          <div class="header-actions-tp">
            <button class="btn-action-outline">
              <i data-lucide="download"></i>
              <span>Export Report</span>
            </button>
            <button class="btn-action-primary" (click)="navigateToAddLead()">
              <i data-lucide="plus-circle"></i>
              <span>Add New Referral</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Access: Referral Link -->
      <div class="quick-link-card">
        <div class="link-info">
          <div class="icon-box-link">
            <i data-lucide="share-2"></i>
          </div>
          <div class="link-text-content">
            <h3>Your Unique Referral Link</h3>
            <p>Share this link to track your referrals and earn rewards.</p>
          </div>
        </div>
        <div class="link-copy-action">
          <div class="copy-input-wrap">
            <input type="text" readonly [value]="referralLink" #linkInput>
            <button class="copy-btn" (click)="copyLink(linkInput.value)">
              <i data-lucide="copy" *ngIf="!linkCopied"></i>
              <i data-lucide="check" *ngIf="linkCopied" class="text-success"></i>
              <span>{{ linkCopied ? 'Copied!' : 'Copy Link' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="stats-grid-tp">
        <div class="stat-card-premium">
          <div class="stat-header">
            <div class="stat-icon-tp" style="background: rgba(37, 99, 235, 0.1); color: #2563eb;">
              <i data-lucide="users"></i>
            </div>
            <div class="stat-badge up">
              <i data-lucide="trending-up"></i>
              <span>12%</span>
            </div>
          </div>
          <div class="stat-body">
            <span class="stat-label-tp">Total Referrals</span>
            <h2 class="stat-value-tp">1,284</h2>
            <div class="stat-footer">
              <span class="stat-comparison">vs last month 1,120</span>
            </div>
          </div>
        </div>

        <div class="stat-card-premium">
          <div class="stat-header">
            <div class="stat-icon-tp" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
              <i data-lucide="user-check"></i>
            </div>
            <div class="stat-badge up">
              <i data-lucide="trending-up"></i>
              <span>8%</span>
            </div>
          </div>
          <div class="stat-body">
            <span class="stat-label-tp">Successful Conversions</span>
            <h2 class="stat-value-tp">432</h2>
            <div class="stat-footer">
              <span class="stat-comparison">vs last month 398</span>
            </div>
          </div>
        </div>

        <div class="stat-card-premium">
          <div class="stat-header">
            <div class="stat-icon-tp" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
              <i data-lucide="dollar-sign"></i>
            </div>
            <div class="stat-badge up">
              <i data-lucide="trending-up"></i>
              <span>24%</span>
            </div>
          </div>
          <div class="stat-body">
            <span class="stat-label-tp">Total Earnings</span>
            <h2 class="stat-value-tp">$12,450.00</h2>
            <div class="stat-footer">
              <span class="stat-comparison">vs last month $9,800</span>
            </div>
          </div>
        </div>

        <div class="stat-card-premium">
          <div class="stat-header">
            <div class="stat-icon-tp" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;">
              <i data-lucide="clock"></i>
            </div>
            <div class="stat-badge down">
              <i data-lucide="trending-down"></i>
              <span>2%</span>
            </div>
          </div>
          <div class="stat-body">
            <span class="stat-label-tp">Pending Payments</span>
            <h2 class="stat-value-tp">$1,280.00</h2>
            <div class="stat-footer">
              <span class="stat-comparison">vs last month $1,310</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Section -->
      <div class="content-grid-tp">
        <!-- Main Chart Section -->
        <div class="main-chart-card">
          <div class="card-tp-header">
            <div class="header-left">
              <h3 class="card-tp-title">Referral Performance</h3>
              <p class="card-tp-subtitle">Performance overview of your referrals over time</p>
            </div>
            <div class="header-right">
              <select class="select-sm">
                <option>Last 7 Days</option>
                <option selected>Last 30 Days</option>
                <option>Last 12 Months</option>
              </select>
            </div>
          </div>
          <div id="referralGrowthChart" class="chart-container-tp"></div>
        </div>

        <!-- Secondary Stats / Rankings -->
        <div class="side-stats-card">
          <div class="card-tp-header">
            <h3 class="card-tp-title">Source Distribution</h3>
          </div>
          <div id="sourceDistributionChart" class="chart-container-tp" style="min-height: 250px;"></div>
          <div class="source-list" style="margin-top: 1rem;">
            <div class="source-item" *ngFor="let source of topSources">
              <div class="source-info">
                <div class="source-icon" [style.background]="source.color + '20'" [style.color]="source.color">
                  <i [attr.data-lucide]="source.icon"></i>
                </div>
                <span>{{ source.name }}</span>
              </div>
              <span class="source-value">{{ source.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Referrals Table -->
      <div class="table-section-tp">
        <div class="table-card-premium">
          <div class="table-card-header">
            <div class="header-left">
              <h2 class="table-title">Recent Referrals</h2>
              <p class="table-subtitle">Latest 10 referrals and their current status</p>
            </div>
            <div class="header-right">
              <button class="btn-ghost-sm" (click)="navigateToLeads()">View All Referrals</button>
            </div>
          </div>
          <div class="table-responsive-tp">
            <table class="premium-table-tp">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Date Referred</th>
                  <th>Assigned Counsellor</th>
                  <th>Status</th>
                  <th>Commission</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ref of recentReferrals" class="hover-row">
                  <td>
                    <div class="student-cell">
                      <div class="student-avatar">{{ getInitials(ref.name) }}</div>
                      <div class="student-info">
                        <span class="name">{{ ref.name }}</span>
                        <span class="email">{{ ref.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ ref.date }}</td>
                  <td>
                    <div class="counsellor-info">
                      <span class="name">{{ ref.counsellor }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="status-pill" [ngClass]="ref.status.toLowerCase()">
                      <span class="dot"></span>
                      {{ ref.status }}
                    </span>
                  </td>
                  <td class="amount-cell">{{ ref.amount }}</td>
                  <td>
                    <button class="btn-icon-tp" (click)="viewDetail(ref.id)">
                      <i data-lucide="eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Recent Activity -->
          <div class="card-tp">
            <div class="card-tp-header">
              <h3 class="card-tp-title">Recent Activity</h3>
              <button class="btn-ghost-sm-tp">View All</button>
            </div>
            <div class="card-content-tp">
              <div class="activity-list-tp">
                <div class="activity-item-tp" *ngFor="let activity of recentActivities">
                  <div class="activity-icon-tp" [ngClass]="activity.type">
                    <i [attr.data-lucide]="activity.icon"></i>
                  </div>
                  <div class="activity-info-tp">
                    <p class="activity-text-tp">
                      <span class="activity-user-tp">{{ activity.user }}</span>
                      {{ activity.action }}
                      <span class="activity-target-tp">{{ activity.target }}</span>
                    </p>
                    <span class="activity-time-tp">{{ activity.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
   

    /* Header Styles */
    .dashboard-header-tp {
      margin-bottom: 2rem;
    }

    .breadcrumb-nav-tp {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #697386;
      font-size: 0.8125rem;
    }

   
   
    .breadcrumb-nav-tp span.active { color: #1a1f36; font-weight: 500; }

    .header-main-tp {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

   
   

    .header-actions-tp { display: flex; gap: 0.75rem; }

    .btn-action-primary {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .btn-action-primary:hover { background: #1d4ed8; transform: translateY(-1px); }

    .btn-action-outline {
      background: white;
      color: #3c4257;
      border: 1px solid #dcdfe4;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-action-outline:hover { background: #f7f8f9; border-color: #c1c9d2; }

    /* Referral Link Card */
    .quick-link-card {
      background: white;
      border: 1px solid #eaecf0;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);
    }

    .link-info { display: flex; gap: 1.25rem; align-items: center; }
    .icon-box-link {
      width: 48px;
      height: 48px;
      background: #eff6ff;
      color: #2563eb;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-box-link i { width: 24px; height: 24px; }
    .link-text-content h3 { font-size: 1.125rem; font-weight: 600; margin: 0; }
    .link-text-content p { font-size: 0.875rem; color: #697386; margin: 0.25rem 0 0; }

    .copy-input-wrap {
      display: flex;
      background: #f8f9fc;
      border: 1px solid #dcdfe4;
      border-radius: 8px;
      padding: 0.25rem;
      min-width: 400px;
    }

    .copy-input-wrap input {
      flex: 1;
      background: transparent;
      border: none;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: #3c4257;
      outline: none;
    }

    .copy-btn {
      background: white;
      border: 1px solid #dcdfe4;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #3c4257;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .copy-btn:hover { background: #f7f8f9; }
    .copy-btn i { width: 14px; height: 14px; }

    /* KPI Grid */
    .stats-grid-tp {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card-premium {
      background: white;
      border: 1px solid #eaecf0;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);
      transition: transform 0.2s;
    }

    .stat-card-premium:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(16, 24, 40, 0.05); }

    .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .stat-icon-tp { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .stat-icon-tp i { width: 20px; height: 20px; }

    .stat-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.5rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .stat-badge.up { background: #ecfdf5; color: #10b981; }
    .stat-badge.down { background: #fef2f2; color: #ef4444; }
    .stat-badge i { width: 12px; height: 12px; }

    .stat-label-tp { font-size: 0.875rem; color: #697386; font-weight: 500; }
    .stat-value-tp { font-size: 1.75rem; font-weight: 700; color: #1a1f36; margin: 0.25rem 0; letter-spacing: -0.02em; }
    .stat-comparison { font-size: 0.75rem; color: #697386; }

    /* Content Grid */
    .content-grid-tp {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .main-chart-card, .side-stats-card, .card-tp {
      background: white;
      border: 1px solid #eaecf0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);
      transition: box-shadow 0.2s ease;
    }

    .main-chart-card:hover, .side-stats-card:hover, .card-tp:hover {
      box-shadow: 0 4px 6px rgba(16, 24, 40, 0.05);
    }

   
   
    .card-tp-subtitle { font-size: 0.875rem; color: #697386; margin: 0.25rem 0 0; }

    .select-sm {
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      border: 1px solid #dcdfe4;
      font-size: 0.8125rem;
      color: #3c4257;
      background: #f8f9fc;
      outline: none;
    }

   

    /* Top Sources List */
    .source-list { display: flex; flex-direction: column; gap: 1.25rem; }
    .source-item { display: flex; justify-content: space-between; align-items: center; }
    .source-info { display: flex; align-items: center; gap: 0.75rem; }
    .source-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
    .source-icon i { width: 16px; height: 16px; }
    .source-info span { font-size: 0.875rem; font-weight: 500; color: #3c4257; }
    .source-value { font-size: 0.875rem; font-weight: 600; color: #1a1f36; }

    .view-all-link { margin-top: 2rem; text-align: center; border-top: 1px solid #eaecf0; padding-top: 1rem; }
    .view-all-link a { font-size: 0.875rem; color: #2563eb; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }

    /* Table Section */
    .table-card-premium {
      background: white;
      border: 1px solid #eaecf0;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);
      overflow: hidden;
    }

   
    .table-title { font-size: 1.125rem; font-weight: 600; margin: 0; }
    .table-subtitle { font-size: 0.875rem; color: #697386; margin: 0.25rem 0 0; }

    .premium-table-tp { width: 100%; border-collapse: collapse; }
    .premium-table-tp th { background: #f9fafb; padding: 0.875rem 1.5rem; font-size: 0.75rem; font-weight: 600; color: #697386; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; }
    .premium-table-tp td { padding: 1rem 1.5rem; border-bottom: 1px solid #eaecf0; font-size: 0.875rem; color: #3c4257; }
    .hover-row:hover { background: #f9fafb; cursor: pointer; }

    .student-cell { display: flex; align-items: center; gap: 0.875rem; }
    .student-avatar { width: 36px; height: 36px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 600; }
    .student-info { display: flex; flex-direction: column; }
    .student-info .name { font-weight: 600; color: #1a1f36; }
    .student-info .email { font-size: 0.75rem; color: #697386; }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-pill.paid { background: #ecfdf5; color: #059669; }
    .status-pill.pending { background: #fffbeb; color: #d97706; }
    .status-pill.rejected { background: #fef2f2; color: #dc2626; }
    .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .amount-cell { font-weight: 600; color: #1a1f36; }

    .btn-icon-tp {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 1px solid #dcdfe4;
      background: white;
      color: #697386;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-icon-tp:hover { background: #f7f8f9; color: #1a1f36; border-color: #c1c9d2; }
    .btn-icon-tp i { width: 16px; height: 16px; }

    @media (max-width: 1440px) {
      .stats-grid-tp { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 1024px) {
      .content-grid-tp { grid-template-columns: 1fr; }
      .quick-link-card { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .copy-input-wrap { min-width: 100%; }
    }
    .activity-list-tp {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .activity-item-tp {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .activity-icon-tp {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon-tp i {
      width: 18px;
      height: 18px;
    }

    .activity-icon-tp.new { background: #eff6ff; color: #2563eb; }
    .activity-icon-tp.success { background: #ecfdf5; color: #059669; }
    .activity-icon-tp.info { background: #fefce8; color: #ca8a04; }
    .activity-icon-tp.sync { background: #f5f3ff; color: #7c3aed; }

    .activity-info-tp {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .activity-text-tp {
      font-size: 0.875rem;
      color: var(--color-gray-600);
      margin: 0;
      line-height: 1.5;
    }

    .activity-user-tp {
      font-weight: 700;
      color: var(--color-gray-900);
    }

    .activity-target-tp {
      font-weight: 600;
      color: var(--color-primary);
    }

    .activity-time-tp {
      font-size: 0.75rem;
      color: var(--color-gray-400);
      font-weight: 500;
    }

    .btn-ghost-sm-tp {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-gray-600);
      background: transparent;
      border: 1px solid var(--color-gray-200);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-ghost-sm-tp:hover {
      
      color: var(--color-gray-900);
      border-color: var(--color-gray-300);
    }
  `]
})
export class ReferralDashboardComponent implements AfterViewInit {
  authService = inject(AuthService);
  recentActivities = [
    { user: 'Siddharth Patel', action: 'submitted 12 new referrals', target: 'worth $4,200', time: '2 hours ago', type: 'new', icon: 'user-plus' },
    { user: 'Admin', action: 'approved bulk payment of', target: '$12,450.00', time: '5 hours ago', type: 'success', icon: 'check-circle' },
    { user: 'System', action: 'processed 45 automated payouts', target: 'successfully', time: 'Yesterday', type: 'info', icon: 'zap' },
    { user: 'Zoho CRM', action: 'synchronized 124 new leads', target: 'into the funnel', time: 'Yesterday', type: 'sync', icon: 'refresh-cw' }
  ];

  constructor(private router: Router) {}

  referralLink = 'https://atlasmentor.com/register/student?ref=REF1284';
  linkCopied = false;

  recentReferrals = [
    { id: '1', name: 'Amit Verma', email: 'amit.verma@example.com', date: 'Oct 12, 2023', counsellor: 'Suresh Kumar', amount: '$150.00', status: 'Paid' },
    { id: '2', name: 'Sarah Wilson', email: 'sarah.w@gmail.com', date: 'Oct 15, 2023', counsellor: 'Priya Sharma', amount: '$200.00', status: 'Pending' },
    { id: '3', name: 'John Doe', email: 'j.doe@outlook.com', date: 'Oct 18, 2023', counsellor: 'Suresh Kumar', amount: '$120.00', status: 'Paid' },
    { id: '4', name: 'Michael Chen', email: 'm.chen@company.com', date: 'Oct 20, 2023', counsellor: 'Rahul Gupta', amount: '$180.00', status: 'Rejected' },
    { id: '5', name: 'Elena Rodriguez', email: 'elena.r@edu.es', date: 'Oct 22, 2023', counsellor: 'Priya Sharma', amount: '$250.00', status: 'Pending' }
  ];

  topSources = [
    { name: 'Direct Link', percentage: 45, icon: 'link', color: '#2563eb' },
    { name: 'Social Media', percentage: 30, icon: 'share-2', color: '#10b981' },
    { name: 'Email Campaign', percentage: 15, icon: 'mail', color: '#f59e0b' },
    { name: 'Others', percentage: 10, icon: 'more-horizontal', color: '#6366f1' }
  ];

  ngAfterViewInit() {
    this.initIcons();
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  private initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  copyLink(link: string) {
    navigator.clipboard.writeText(link).then(() => {
      this.linkCopied = true;
      setTimeout(() => this.linkCopied = false, 2000);
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  navigateToAddLead() {
    this.router.navigate(['/referral/leads']);
  }

  navigateToLeads() {
    this.router.navigate(['/referral/leads']);
  }

  viewDetail(id: string) {
    this.router.navigate(['/referral/students', id]);
  }

  private initCharts() {
    // 1. Referral Performance Area Chart
    const growthOptions = {
      series: [
        {
          name: 'Inquiries',
          data: [120, 150, 180, 240, 210, 280, 350, 320, 400, 450, 480, 520]
        },
        {
          name: 'Referrals',
          data: [45, 52, 68, 74, 88, 95, 110, 125, 140, 155, 170, 195]
        },
        {
          name: 'Conversions',
          data: [12, 18, 22, 28, 35, 42, 48, 55, 62, 70, 78, 85]
        }
      ],
      chart: {
        height: 380,
        type: 'area',
        toolbar: { show: true, tools: { download: true } },
        fontFamily: 'Inter, sans-serif',
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
      },
      colors: ['#6366f1', '#2563eb', '#10b981'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100]
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          formatter: (val: number) => Math.floor(val).toString()
        }
      },
      tooltip: { theme: 'light', x: { show: true } },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      legend: { position: 'top', horizontalAlign: 'left', fontSize: '14px', markers: { radius: 12 } }
    };
    
    // 2. Source Distribution Donut Chart
    const sourceOptions = {
      series: [45, 30, 15, 10],
      chart: {
        type: 'donut',
        height: 250,
        fontFamily: 'Inter, sans-serif'
      },
      labels: ['Direct Link', 'Social Media', 'Email Campaign', 'Others'],
      colors: ['#2563eb', '#10b981', '#f59e0b', '#6366f1'],
      legend: { show: false },
      dataLabels: { enabled: true, dropShadow: { enabled: false } },
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { show: true, fontSize: '14px', fontWeight: 600, color: '#64748b' },
              value: { show: true, fontSize: '20px', fontWeight: 700, color: '#1e293b' },
              total: { show: true, label: 'Total', fontSize: '14px', fontWeight: 600, color: '#64748b' }
            }
          }
        }
      }
    };

    const growthChart = new (window as any).ApexCharts(document.querySelector("#referralGrowthChart"), growthOptions);
    const sourceChart = new (window as any).ApexCharts(document.querySelector("#sourceDistributionChart"), sourceOptions);
    
    growthChart.render();
    sourceChart.render();
  }
}

