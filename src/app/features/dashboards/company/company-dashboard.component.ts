import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

declare const lucide: any;

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-wrapper">

      <div class="welcome-header" *ngIf="authService.currentUser$ | async as user">
        <h1 class="welcome-title">Dashboard</h1>
        <p class="welcome-subtitle">Welcome back, {{ $any(user).name }}</p>
      </div>

      <!-- KPI Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Total Employees</span>
            <div class="stat-value">428</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>4.2%</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap" style="background: #e0f2fe; color: #0ea5e9;">
            <i data-lucide="users"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Active Programs</span>
            <div class="stat-value">12</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>2 new</span>
              <span class="trend-label">this quarter</span>
            </div>
          </div>
          <div class="stat-icon-wrap" style="background: #ecfdf5; color: #10b981;">
            <i data-lucide="briefcase"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Placement Rate</span>
            <div class="stat-value">94%</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>1.5%</span>
              <span class="trend-label">improvement</span>
            </div>
          </div>
          <div class="stat-icon-wrap" style="background: #fffbeb; color: #f59e0b;">
            <i data-lucide="award"></i>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-content">
            <span class="stat-label">Engagement Score</span>
            <div class="stat-value">8.8</div>
            <div class="stat-trend up">
              <i data-lucide="trending-up"></i>
              <span>0.4</span>
              <span class="trend-label">vs last month</span>
            </div>
          </div>
          <div class="stat-icon-wrap" style="background: #fef2f2; color: #ef4444;">
            <i data-lucide="heart"></i>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid-tp">
        <div class="chart-card-tp">
          <div class="card-tp-header">
            <h3 class="card-tp-title">Performance Trends</h3>
          </div>
          <div id="performanceTrendChart" class="chart-container-tp"></div>
        </div>

        <div class="chart-card-tp">
          <div class="card-tp-header">
            <h3 class="card-tp-title">Department Distribution</h3>
          </div>
          <div id="deptDistributionChart" class="chart-container-tp"></div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="data-grid-tp">
        <div class="table-card" style="grid-column: span 2;">
          <div class="table-card-header">
            <div class="table-header-title">
              <h2>Recent Employee Activity</h2>
              <span class="count-badge">Last 7 days</span>
            </div>
          </div>
          <div style="overflow-x: auto;">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Activity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let activity of recentActivity" class="clickable-row">
                  <td style="font-weight: 600; color: var(--color-gray-900);">{{ activity.name }}</td>
                  <td>{{ activity.action }}</td>
                  <td>
                    <span class="status-badge-tp" [ngClass]="activity.status.toLowerCase()">{{ activity.status }}</span>
                  </td>
                  <td>{{ activity.date }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
   

   

   
   

   
   
   

   

   

   
   
    
   
   
   
   
   

   

   

   

   

   
   
   

   

   

    .status-badge-tp.completed { background: #ecfdf3; color: #027a48; border: 1px solid #abefc6; }
    .status-badge-tp.in-progress { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .status-badge-tp.pending { background: #fff9f2; color: #b54708; border: 1px solid #fedf89; }

    @media (max-width: 1280px) {
      .charts-grid-tp,
    }
  `]
})
export class CompanyDashboardComponent implements AfterViewInit {
  authService = inject(AuthService);
  router = inject(Router);

  recentActivity = [
    { name: 'David Miller', action: 'Completed Training Module A', status: 'Completed', date: '2 hours ago' },
    { name: 'Jessica Lee', action: 'Started Mentorship Program', status: 'In-Progress', date: '5 hours ago' },
    { name: 'Robert Brown', action: 'Submitted Quarterly Review', status: 'Pending', date: 'Yesterday' },
    { name: 'Emily Davis', action: 'Completed Certification B', status: 'Completed', date: '2 days ago' }
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
    // Performance Trend Chart
    const trendOptions = {
      series: [{
        name: 'Performance',
        data: [72, 75, 78, 82, 85, 88, 91]
      }],
      chart: { 
        height: 320, 
        type: 'line', 
        toolbar: { show: false }, 
        fontFamily: 'Inter, sans-serif' 
      },
      colors: ['#2563eb'],
      stroke: { curve: 'smooth', width: 4 },
      xaxis: { 
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4
      },
      markers: {
        size: 4,
        colors: ['#2563eb'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: { size: 6 }
      }
    };
    new (window as any).ApexCharts(document.querySelector("#performanceTrendChart"), trendOptions).render();

    // Distribution Chart
    const distOptions = {
      series: [44, 55, 13, 33],
      chart: { 
        height: 320, 
        type: 'donut',
        fontFamily: 'Inter, sans-serif' 
      },
      labels: ['Engineering', 'Marketing', 'Sales', 'Operations'],
      colors: ['#2563eb', '#10b981', '#f59e0b', '#6366f1'],
      legend: {
        position: 'bottom'
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: () => '145'
              }
            }
          }
        }
      }
    };
    new (window as any).ApexCharts(document.querySelector("#deptDistributionChart"), distOptions).render();
  }
}
