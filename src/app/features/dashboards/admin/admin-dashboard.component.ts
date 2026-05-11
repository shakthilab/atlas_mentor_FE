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
   

    /* Breadcrumbs */
   

   

   

   

   

   

    /* KPI Grid */
   

   

   

   

   

   

   

   
   

   

   

   


    /* Charts Grid */
   

   

   

   

   

    /* Data Grid */
   

   



   

   
   
   


    @media (max-width: 1280px) {
      .charts-grid-tp,
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
