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
      <!-- Breadcrumbs -->
      <nav class="breadcrumb-nav">
        <i data-lucide="home" class="breadcrumb-icon"></i>
        <i data-lucide="chevron-right" class="breadcrumb-sep"></i>
        <span>Referral Dashboard</span>
      </nav>

      <div class="welcome-header">
        <h1 class="welcome-title">Referral Dashboard</h1>
        <p class="welcome-subtitle">Track your performance and earnings</p>
      </div>

      <!-- KPI Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Total Referrals</span>
            <div class="stat-value">142</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>8.4%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap" style="background: #e0f2fe; color: #0ea5e9;">
            <i data-lucide="users"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Successful Reg.</span>
            <div class="stat-value">64</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>12.1%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap" style="background: #ecfdf5; color: #10b981;">
            <i data-lucide="check-circle"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Total Earnings</span>
            <div class="stat-value">$1,420.00</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>15.2%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap" style="background: #fffbeb; color: #f59e0b;">
            <i data-lucide="dollar-sign"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Pending Comm.</span>
            <div class="stat-value">$320.00</div>
            <div class="stat-trend down">
              <i data-lucide="trending-down"></i>
              <span>2.4%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap" style="background: #fef2f2; color: #ef4444;">
            <i data-lucide="clock"></i>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid-tp">
        <div class="chart-card-tp">
          <div class="card-tp-header">
            <h3 class="card-tp-title">Referral Growth</h3>
          </div>
          <div id="referralGrowthChart" class="chart-container-tp"></div>
        </div>

        <div class="chart-card-tp">
          <div class="card-tp-header">
            <h3 class="card-tp-title">Monthly Earnings</h3>
          </div>
          <div id="earningsChart" class="chart-container-tp"></div>
        </div>
      </div>

      <!-- Recent Referrals -->
      <div class="data-grid-tp">
        <div class="table-card" style="grid-column: span 2;">
          <div class="table-card-header">
            <div class="table-header-title">
              <h2>Recent Referrals</h2>
              <span class="count-badge">{{ recentReferrals.length }} total</span>
            </div>
          </div>
          <div style="overflow-x: auto;">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Date</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ref of recentReferrals" class="clickable-row">
                  <td style="font-weight: 600; color: var(--color-gray-900);">{{ ref.name }}</td>
                  <td>{{ ref.date }}</td>
                  <td>{{ ref.amount }}</td>
                  <td>
                    <span class="status-badge-tp" [ngClass]="ref.status.toLowerCase()">{{ ref.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      padding: 1.5rem;
      background: var(--color-gray-50);
      min-height: 100vh;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      color: var(--color-gray-500);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .breadcrumb-icon { width: 14px; height: 14px; }
    .breadcrumb-sep { width: 12px; height: 12px; opacity: 0.5; }

    .welcome-header { margin-bottom: 2rem; }
    .welcome-title { font-size: 1.875rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .welcome-subtitle { font-size: 1rem; color: var(--color-gray-600); margin: 0.25rem 0 0; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-gray-200);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      box-shadow: var(--shadow-sm);
    }

    .stat-label { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-600); }
    .stat-value { font-size: 1.875rem; font-weight: 600; color: var(--color-gray-900); margin: 0.5rem 0; }
    
    .stat-trend { display: flex; align-items: center; gap: 0.25rem; font-size: 0.875rem; font-weight: 600; }
    .stat-trend i { width: 16px; height: 16px; }
    .stat-trend.up { color: #12b76a; }
    .stat-trend.down { color: var(--color-error); }
    .trend-label { color: var(--color-gray-500); font-weight: 400; margin-left: 0.25rem; }

    .stat-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon-wrap i { width: 24px; height: 24px; }

    .charts-grid-tp {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .chart-card-tp {
      background: white;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-gray-200);
      box-shadow: var(--shadow-sm);
    }

    .card-tp-header { margin-bottom: 1.5rem; }
    .card-tp-title { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .chart-container-tp { min-height: 320px; }

    .data-grid-tp {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .status-badge-tp {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.125rem 0.5rem;
      border-radius: 6px;
    }

    .status-badge-tp.paid { background: #ecfdf3; color: #027a48; border: 1px solid #abefc6; }
    .status-badge-tp.pending { background: #fff9f2; color: #b54708; border: 1px solid #fedf89; }
    .status-badge-tp.rejected { background: #fef2f2; color: #b42318; border: 1px solid #fda29b; }

    @media (max-width: 1280px) {
      .charts-grid-tp, .data-grid-tp { grid-template-columns: 1fr; }
    }
  `]
})
export class ReferralDashboardComponent implements AfterViewInit {
  authService = inject(AuthService);
  router = inject(Router);

  recentReferrals = [
    { name: 'Amit Verma', date: 'Oct 12, 2023', amount: '$150.00', status: 'Paid' },
    { name: 'Sarah Wilson', date: 'Oct 15, 2023', amount: '$200.00', status: 'Pending' },
    { name: 'John Doe', date: 'Oct 18, 2023', amount: '$120.00', status: 'Paid' },
    { name: 'Michael Chen', date: 'Oct 20, 2023', amount: '$180.00', status: 'Rejected' }
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

  private initCharts() {
    // Referral Growth Chart
    const growthOptions = {
      series: [{
        name: 'Referrals',
        data: [12, 18, 15, 25, 32, 28, 42]
      }],
      chart: { 
        height: 320, 
        type: 'area', 
        toolbar: { show: false }, 
        fontFamily: 'Inter, sans-serif' 
      },
      colors: ['#2563eb'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: { 
        categories: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4
      }
    };
    new (window as any).ApexCharts(document.querySelector("#referralGrowthChart"), growthOptions).render();

    // Earnings Chart
    const earningsOptions = {
      series: [{
        name: 'Earnings',
        data: [450, 620, 580, 890, 1100, 950, 1420]
      }],
      chart: { 
        height: 320, 
        type: 'bar', 
        toolbar: { show: false }, 
        fontFamily: 'Inter, sans-serif' 
      },
      colors: ['#10b981'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '50%',
        }
      },
      dataLabels: { enabled: false },
      xaxis: { 
        categories: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4
      }
    };
    new (window as any).ApexCharts(document.querySelector("#earningsChart"), earningsOptions).render();
  }
}
