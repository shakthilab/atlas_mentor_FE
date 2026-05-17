import { Component, inject, AfterViewInit } from '@angular/core';
declare const lucide: any;
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper">

      <div class="welcome-header">
        <h1 class="welcome-title">Dashboard</h1>
        <p class="welcome-subtitle">Welcome back</p>
      </div>

      <!-- KPI Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Total Leads</span>
            <div class="stat-value">1,284</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>12.5%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap leads" style="background: #e0f2fe; color: #0ea5e9;">
            <i data-lucide="users"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Registered Students</span>
            <div class="stat-value">842</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>8.2%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap registered" style="background: #ecfdf5; color: #10b981;">
            <i data-lucide="graduation-cap"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Lost Students</span>
            <div class="stat-value">124</div>
            <div class="stat-trend down">
              <i data-lucide="trending-down"></i>
              <span>2.4%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap lost" style="background: #fef2f2; color: #ef4444;">
            <i data-lucide="user-x"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Total Revenue</span>
            <div class="stat-value">$128,400</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>15.1%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap revenue" style="background: #fffbeb; color: #f59e0b;">
            <i data-lucide="dollar-sign"></i>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid-tp">
        <div class="chart-card-tp">
          <div class="card-tp-header">
            <h3 class="card-tp-title">Monthly Growth</h3>
          </div>
          <div id="growthChart" class="chart-container-tp"></div>
        </div>

        <div class="chart-card-tp">
          <div class="card-tp-header">
            <h3 class="card-tp-title">Conversion Funnel</h3>
          </div>
          <div id="funnelChart" class="chart-container-tp"></div>
        </div>
      </div>

      <!-- Tables Grid -->
      <div class="data-grid-tp">
        <div class="table-card" style="grid-column: span 2;">
          <div class="table-card-header">
            <div class="table-header-title">
              <h2>New Registrations</h2>
              <span class="count-badge">{{ newStudents.length }} new</span>
            </div>
            <button class="btn-icon">
              <span class="material-icons">more_vert</span>
            </button>
          </div>
          <div style="overflow-x: auto;">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Country</th>
                  <th>Counsellor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let student of newStudents" class="clickable-row">
                  <td style="font-weight: 600; color: var(--color-gray-900);">{{ student.name }}</td>
                  <td>{{ student.country }}</td>
                  <td>{{ student.counsellor }}</td>
                  <td>
                    <span class="status-badge-tp" [ngClass]="student.status.toLowerCase()">{{ student.status }}</span>
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
    .dashboard-wrapper { padding: 1.5rem; background: #fff; min-height: 100vh; }
    .welcome-header { margin-bottom: 2rem; }
    .welcome-title { font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0; }
    .welcome-subtitle { font-size: 1rem; color: #6b7280; margin-top: 0.25rem; }

    /* KPI Grid */
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 1.5rem; 
      margin-bottom: 2rem; 
    }
    .stat-card { 
      background: #fff; 
      padding: 1.5rem; 
      border-radius: 1rem; 
      border: 1px solid #e5e7eb; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
    }
    .stat-label { font-size: 0.875rem; color: #6b7280; font-weight: 500; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0.5rem 0; }
    .stat-trend { display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; font-weight: 600; }
    .stat-trend.up { color: #10b981; }
    .stat-trend.down { color: #ef4444; }
    .trend-label { color: #9ca3af; font-weight: 400; margin-left: 0.25rem; }
    .stat-icon-wrap { width: 48px; height: 48px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
    .stat-icon-wrap i { width: 24px; height: 24px; }

    /* Charts Grid */
    .charts-grid-tp { 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 1.5rem; 
      margin-bottom: 2rem; 
    }
    .chart-card-tp { 
      background: #fff; 
      padding: 1.5rem; 
      border-radius: 1rem; 
      border: 1px solid #e5e7eb; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
    }
    .card-tp-title { font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0 0 1.5rem 0; }
    .chart-container-tp { min-height: 320px; width: 100%; }

    /* Tables Grid */
    .data-grid-tp { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
    .table-card { 
      background: #fff; 
      border-radius: 1rem; 
      border: 1px solid #e5e7eb; 
      overflow: hidden; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
    }
    .table-card-header { padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
    .table-header-title h2 { font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0; }
    .count-badge { background: #f3f4f6; color: #4b5563; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.625rem; border-radius: 1rem; margin-left: 0.75rem; }
    
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { background: #f9fafb; padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; }
    .premium-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; color: #374151; }
    .status-badge-tp { padding: 0.25rem 0.625rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; }
    .status-badge-tp.registered { background: #ecfdf5; color: #059669; }
    .status-badge-tp.lead { background: #eff6ff; color: #2563eb; }
    .status-badge-tp.lost { background: #fef2f2; color: #dc2626; }

    /* Responsive Queries */
    @media (max-width: 1280px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 1024px) {
      .charts-grid-tp { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
      .dashboard-wrapper { padding: 1rem; }
      .welcome-title { font-size: 1.5rem; }
      .stat-card { padding: 1rem; }
    }
  `]
})
export class AdminDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  recentActivity = [
    { type: 'update', user: 'Siddharth Patel', action: 'updated documents for', target: 'Mukul Sharma', date: '10 mins ago' },
    { type: 'payment', user: 'System', action: 'verified payment of $1,200 for', target: 'John Doe', date: '2 hours ago' },
    { type: 'task', user: 'Rohan Gupta', action: 'completed visa processing task for', target: 'Sarah Jenkins', date: '5 hours ago' },
    { type: 'update', user: 'Admin', action: 'approved registration request from', target: 'University of Debrecen', date: 'Yesterday' }
  ];

  newStudents = [
    { name: 'Mukul Sharma', country: 'Germany', counsellor: 'Siddharth Patel', status: 'Registered' },
    { name: 'Priya Rai', country: 'USA', counsellor: 'Rohan Gupta', status: 'Lead' },
    { name: 'Amit Kumar', country: 'UK', counsellor: 'Siddharth Patel', status: 'Lead' },
    { name: 'Sonal Singh', country: 'Poland', counsellor: 'Admin', status: 'Lost' }
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
    // Growth Chart
    const growthOptions = {
      series: [{
        name: 'Students',
        data: [31, 40, 28, 51, 42, 109, 100]
      }, {
        name: 'Revenue',
        data: [11, 32, 45, 32, 34, 52, 41]
      }],
      chart: { 
        height: 320, 
        type: 'area', 
        toolbar: { show: false }, 
        fontFamily: 'Inter, sans-serif' 
      },
      colors: ['#2563eb', '#10b981'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: { 
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4
      }
    };
    new (window as any).ApexCharts(document.querySelector("#growthChart"), growthOptions).render();

    // Funnel Chart
    const funnelOptions = {
      series: [
        {
          name: "Funnel Series",
          data: [1380, 1100, 990, 880, 740, 548],
        },
      ],
      chart: { type: 'bar', height: 320, toolbar: { show: false } },
      plotOptions: {
        bar: {
          borderRadius: 0,
          horizontal: true,
          barHeight: '80%',
          isFunnel: true,
        },
      },
      colors: ['#2563eb'],
      dataLabels: {
        enabled: true,
        formatter: function (val: any, opt: any) {
          return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val
        },
        dropShadow: { enabled: true },
      },
      xaxis: { categories: ['Leads', 'Qualified', 'Applied', 'Offer Letter', 'Visa Filed', 'Registered'] },
      legend: { show: false },
    };
    new (window as any).ApexCharts(document.querySelector("#funnelChart"), funnelOptions).render();
  }

  goToApprovals() {
    this.router.navigate(['/admin/approvals']);
  }
}
