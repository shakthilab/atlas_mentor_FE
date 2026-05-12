import { Component, inject, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { catchError, of } from 'rxjs';

declare const lucide: any;

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="dashboard-wrapper">

      <!-- Header -->
      <div class="comp-header" *ngIf="authService.currentUser$ | async as user">
        <div class="comp-header-left">
          <h1 class="welcome-title">Company Dashboard</h1>
          <p class="welcome-subtitle">Welcome back, {{ $any(user).name }} — here's your workforce & student overview.</p>
        </div>
      </div>

      <!-- ===== STUDENT ONBOARDING & PAYMENT SECTION ===== -->
      <div class="section-label-row">
        <div class="section-label-left">
          <div class="section-label-icon"><i data-lucide="credit-card"></i></div>
          <div>
            <h2 class="section-label-title">Student Onboarding & Payment Overview</h2>
            <p class="section-label-sub">Track student enrollment status and all payment activities from your company</p>
          </div>
        </div>
        <div class="section-label-right">
          <div class="live-dot"></div>
          <span class="live-text">Live Data</span>
        </div>
      </div>

      <!-- Enrollment + Payment KPI Row -->
      <div class="enroll-kpi-grid">
        <div class="enroll-kpi-card card-enroll">
          <div class="ekpi-icon-wrap"><i data-lucide="graduation-cap"></i></div>
          <div class="ekpi-body">
            <div class="ekpi-value">{{ isLoading ? '—' : paymentStats.totalOnboarded }}</div>
            <div class="ekpi-label">Total Enrolled Students</div>
            <div class="ekpi-sub">Company sponsored</div>
          </div>
          <div class="ekpi-sparkline" id="sparkEnroll"></div>
        </div>

        <div class="enroll-kpi-card card-paid">
          <div class="ekpi-icon-wrap"><i data-lucide="check-circle-2"></i></div>
          <div class="ekpi-body">
            <div class="ekpi-value">{{ isLoading ? '—' : paymentStats.paidCount }}</div>
            <div class="ekpi-label">Payments Confirmed</div>
            <div class="ekpi-amount">{{ paymentStats.paidAmount | currency }}</div>
          </div>
          <div class="ekpi-badge success">{{ getPaidPct() }}% cleared</div>
        </div>

        <div class="enroll-kpi-card card-pending">
          <div class="ekpi-icon-wrap"><i data-lucide="timer"></i></div>
          <div class="ekpi-body">
            <div class="ekpi-value">{{ isLoading ? '—' : paymentStats.pendingCount }}</div>
            <div class="ekpi-label">Payments Awaiting</div>
            <div class="ekpi-amount">{{ paymentStats.pendingAmount | currency }}</div>
          </div>
          <div class="ekpi-badge warning">{{ getPendingPct() }}% pending</div>
        </div>

        <div class="enroll-kpi-card card-success-rate">
          <div class="ekpi-icon-wrap"><i data-lucide="bar-chart-2"></i></div>
          <div class="ekpi-body">
            <div class="ekpi-value">{{ getPaidPct() }}<span class="ekpi-unit">%</span></div>
            <div class="ekpi-label">Payment Success Rate</div>
            <div class="ekpi-sub">Based on confirmed payments</div>
          </div>
          <div class="ekpi-badge info">{{ getRejectedPct() }}% rejected</div>
        </div>
      </div>

      <!-- Enrollment & Payment Charts Row -->
      <div class="enroll-charts-row">
        <!-- Enrollment Trend Grouped Bar -->
        <div class="enroll-chart-main">
          <div class="card-tp-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
            <div>
              <h3 class="card-tp-title">Enrollment & Payment Trend</h3>
              <p class="card-sub">Enrolled vs confirmed payments over selected period</p>
            </div>
            <div class="trend-filter-bar">
              <div class="range-btn-group">
                <button class="range-btn" [class.active]="trendRange === '7d'"  (click)="setTrendRange('7d')">7D</button>
                <button class="range-btn" [class.active]="trendRange === '15d'" (click)="setTrendRange('15d')">15D</button>
                <button class="range-btn" [class.active]="trendRange === '30d'" (click)="setTrendRange('30d')">30D</button>
                <button class="range-btn" [class.active]="trendRange === 'custom'" (click)="setTrendRange('custom')">Custom</button>
              </div>
              <div class="custom-date-row" *ngIf="trendRange === 'custom'">
                <input type="date" class="date-input-sm" [(ngModel)]="trendFrom" (change)="onCustomRangeChange()" placeholder="From">
                <span class="date-sep">→</span>
                <input type="date" class="date-input-sm" [(ngModel)]="trendTo" (change)="onCustomRangeChange()" placeholder="To">
              </div>
            </div>
          </div>
          <div class="chart-loading-overlay" *ngIf="trendLoading">
            <div class="loading-spinner"></div>
          </div>
          <div id="enrollmentTrendChart" style="min-height: 320px;"></div>
        </div>

        <!-- Payment Status Radial -->
        <div class="enroll-chart-side">
          <div style="margin-bottom:1.25rem;">
            <h3 class="card-tp-title">Payment Health</h3>
            <p class="card-sub">Radial overview of payment outcomes</p>
          </div>
          <div id="paymentRadialChart" style="min-height: 250px;"></div>

          <div class="radial-legend">
            <div class="radial-legend-item">
              <span class="rl-dot" style="background:#10b981;"></span>
              <span class="rl-label">Payments Cleared</span>
              <span class="rl-value">{{ getPaidPct() }}%</span>
            </div>
            <div class="radial-legend-item">
              <span class="rl-dot" style="background:#f59e0b;"></span>
              <span class="rl-label">Awaiting Approval</span>
              <span class="rl-value">{{ getPendingPct() }}%</span>
            </div>
            <div class="radial-legend-item">
              <span class="rl-dot" style="background:#ef4444;"></span>
              <span class="rl-label">Rejected</span>
              <span class="rl-value">{{ getRejectedPct() }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Onboarding Payment Table -->
      <div class="student-payment-table-wrap">
        <div class="table-card-premium">
          <div class="spt-header">
            <div class="spt-header-left">
              <h2 class="table-title">Student Onboarding & Payment Status</h2>
              <p class="table-subtitle">Full list of enrolled students and their current payment status</p>
            </div>
            <div class="spt-header-controls">
              <div class="filter-tabs-group">
                <button class="filter-tab" [class.active]="activeFilter === ''" (click)="setFilter('')">
                  All <span class="tab-count">{{ paymentStats.totalOnboarded }}</span>
                </button>
                <button class="filter-tab paid-tab" [class.active]="activeFilter === 'PAID'" (click)="setFilter('PAID')">
                  Paid <span class="tab-count">{{ paymentStats.paidCount }}</span>
                </button>
                <button class="filter-tab pending-tab" [class.active]="activeFilter === 'PENDING'" (click)="setFilter('PENDING')">
                  Pending <span class="tab-count">{{ paymentStats.pendingCount }}</span>
                </button>
                <button class="filter-tab rejected-tab" [class.active]="activeFilter === 'REJECTED'" (click)="setFilter('REJECTED')">
                  Rejected <span class="tab-count">{{ paymentStats.rejectedCount }}</span>
                </button>
              </div>
              <div class="table-search-box">
                <i data-lucide="search"></i>
                <input type="text" placeholder="Search students..." [(ngModel)]="searchText">
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div class="table-loading-state" *ngIf="isLoading">
            <div class="loading-spinner"></div>
            <p>Loading student data...</p>
          </div>

          <!-- Empty -->
          <div class="table-empty-state" *ngIf="!isLoading && filteredStudents.length === 0">
            <div class="empty-icon"><i data-lucide="inbox"></i></div>
            <p class="empty-title">No students match the selected filter</p>
          </div>

          <!-- Table -->
          <div class="table-responsive-tp" *ngIf="!isLoading && filteredStudents.length > 0">
            <table class="premium-table-tp">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Source</th>
                  <th>Counsellor</th>
                  <th>Enrollment Date</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Progress</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of filteredStudents" class="hover-row">
                  <td>
                    <div class="student-cell">
                      <div class="student-avatar" [style.background]="getAvatarColor(s.name)">{{ getInitials(s.name) }}</div>
                      <div class="student-info">
                        <span class="name">{{ s.name }}</span>
                        <span class="email">{{ s.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td><span class="source-tag">{{ s.source }}</span></td>
                  <td>{{ s.counsellor }}</td>
                  <td>{{ s.onboardingDate | date:'MMM d, y' }}</td>
                  <td class="amount-cell">{{ s.paymentAmount | currency }}</td>
                  <td>
                    <span class="status-pill" [ngClass]="s.paymentStatus?.toLowerCase()">
                      <span class="dot"></span>
                      {{ s.paymentStatus | titlecase }}
                    </span>
                  </td>
                  <td>
                    <div class="mini-progress-wrap">
                      <div class="mini-progress-bar">
                        <div class="mini-progress-fill"
                          [style.width]="s.paymentStatus === 'PAID' ? '100%' : s.paymentStatus === 'PENDING' ? '50%' : '20%'"
                          [style.background]="s.paymentStatus === 'PAID' ? '#10b981' : s.paymentStatus === 'PENDING' ? '#f59e0b' : '#ef4444'">
                        </div>
                      </div>
                      <span class="mini-progress-label">{{ s.paymentStatus === 'PAID' ? 'Complete' : s.paymentStatus === 'PENDING' ? 'In Review' : 'Action Needed' }}</span>
                    </div>
                  </td>
                  <td>
                    <button class="btn-icon-tp" (click)="viewStudentDetail(s.id)">
                      <i data-lucide="eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="table-summary-footer" *ngIf="!isLoading && filteredStudents.length > 0">
            <span class="summary-info">Showing {{ filteredStudents.length }} of {{ paymentStats.totalOnboarded }} students</span>
            <div class="summary-pills">
              <span class="summary-pill paid-pill"><span class="dot"></span>{{ paymentStats.paidCount }} Paid</span>
              <span class="summary-pill pending-pill"><span class="dot"></span>{{ paymentStats.pendingCount }} Pending</span>
              <span class="summary-pill rejected-pill"><span class="dot"></span>{{ paymentStats.rejectedCount }} Rejected</span>
            </div>
            <div class="summary-total">
              Total Collected: <strong>{{ paymentStats.paidAmount | currency }}</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ---- Header ---- */
    .comp-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .comp-header-right { display: flex; align-items: center; gap: 0.875rem; }
    .btn-action-outline {
      background: white; color: #3c4257; border: 1px solid #dcdfe4;
      padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem;
      display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-action-outline:hover { background: #f7f8f9; }
    .date-badge {
      display: flex; align-items: center; gap: 0.5rem;
      background: #f8f9fc; border: 1px solid #eaecf0; border-radius: 8px;
      padding: 0.5rem 0.875rem; font-size: 0.8125rem; font-weight: 500; color: #3c4257;
    }
    .date-badge i { width: 15px; height: 15px; color: #697386; }

    /* ---- Section Label ---- */
    .section-label-row {
      display: flex; justify-content: space-between; align-items: center;
      margin: 1.5rem 0;
      padding: 1rem 1.25rem;
      background: white; border: 1px solid #eaecf0; border-radius: 12px;
      border-left: 4px solid #10b981;
      box-shadow: 0 1px 3px rgba(16, 24, 40, 0.08);
    }
    .section-label-left { display: flex; align-items: center; gap: 1rem; }
    .section-label-icon { width: 40px; height: 40px; background: #ecfdf5; color: #10b981; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .section-label-icon i { width: 20px; height: 20px; }
    .section-label-title { font-size: 1.0625rem; font-weight: 700; color: #1a1f36; margin: 0; }
    .section-label-sub { font-size: 0.8125rem; color: #697386; margin: 0.125rem 0 0; }
    .section-label-right { display: flex; align-items: center; gap: 0.5rem; }
    .live-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse-dot 2s infinite; }
    .live-text { font-size: 0.75rem; font-weight: 600; color: #10b981; }
    @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }

    /* ---- Enrollment KPI Cards ---- */
    .enroll-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 1.75rem; }
    .enroll-kpi-card {
      background: white; border: 1px solid #eaecf0; border-radius: 14px;
      padding: 1.25rem; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.08);
      display: flex; flex-direction: column; gap: 0.875rem;
      transition: all 0.2s; position: relative; overflow: hidden;
    }
    .enroll-kpi-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
    .card-enroll::after { background: linear-gradient(90deg, #0ea5e9, #6366f1); }
    .card-paid::after { background: linear-gradient(90deg, #10b981, #059669); }
    .card-pending::after { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .card-success-rate::after { background: linear-gradient(90deg, #667cb0, #00267C); }
    .enroll-kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(16, 24, 40, 0.1); }

    .ekpi-icon-wrap { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .ekpi-icon-wrap i { width: 20px; height: 20px; }
    .card-enroll .ekpi-icon-wrap { background: #e0f2fe; color: #0ea5e9; }
    .card-paid .ekpi-icon-wrap { background: #ecfdf5; color: #10b981; }
    .card-pending .ekpi-icon-wrap { background: #fffbeb; color: #f59e0b; }
    .card-success-rate .ekpi-icon-wrap { background: #eff4ff; color: #667cb0; }

    .ekpi-value { font-size: 2rem; font-weight: 800; color: #1a1f36; line-height: 1; letter-spacing: -0.03em; }
    .ekpi-unit { font-size: 1.125rem; font-weight: 700; }
    .ekpi-label { font-size: 0.8125rem; font-weight: 600; color: #3c4257; }
    .ekpi-sub { font-size: 0.75rem; color: #697386; }
    .ekpi-amount { font-size: 0.875rem; font-weight: 700; color: #1a1f36; }

    .ekpi-badge { align-self: flex-start; font-size: 0.6875rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 100px; letter-spacing: 0.04em; text-transform: uppercase; }
    .ekpi-badge.success { background: #ecfdf5; color: #059669; }
    .ekpi-badge.warning { background: #fffbeb; color: #d97706; }
    .ekpi-badge.info { background: #fef2f2; color: #dc2626; }

    /* ---- Enrollment Charts Row ---- */
    .enroll-charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .enroll-chart-main, .enroll-chart-side {
      background: white; border: 1px solid #eaecf0; border-radius: 12px;
      padding: 1.5rem; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);
    }
    .card-sub { font-size: 0.8125rem; color: #697386; margin: 0.2rem 0 0; }
    .trend-filter-bar { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
    .range-btn-group { display: flex; background: #f1f5f9; border-radius: 8px; padding: 3px; gap: 2px; }
    .range-btn { background: transparent; border: none; border-radius: 6px; padding: 0.3rem 0.75rem; font-size: 0.8125rem; font-weight: 600; color: #697386; cursor: pointer; transition: all 0.15s; }
    .range-btn.active { background: white; color: #1a1f36; box-shadow: 0 1px 3px rgba(16,24,40,0.1); }
    .custom-date-row { display: flex; align-items: center; gap: 0.5rem; }
    .date-input-sm { padding: 0.3rem 0.6rem; border: 1px solid #dcdfe4; border-radius: 6px; font-size: 0.8125rem; color: #3c4257; outline: none; background: white; }
    .date-input-sm:focus { border-color: #667cb0; }
    .date-sep { font-size: 0.8125rem; color: #697386; }
    .chart-loading-overlay { display: flex; justify-content: center; padding: 1rem 0; }

    /* Radial Legend */
    .radial-legend { border-top: 1px solid #f1f5f9; padding-top: 1rem; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.625rem; }
    .radial-legend-item { display: flex; align-items: center; gap: 0.5rem; }
    .rl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .rl-label { flex: 1; font-size: 0.8125rem; color: #3c4257; font-weight: 500; }
    .rl-value { font-size: 0.875rem; font-weight: 700; color: #1a1f36; }

    /* ---- Student Payment Table ---- */
    .student-payment-table-wrap { margin-bottom: 2rem; }
    .table-card-premium { background: white; border: 1px solid #eaecf0; border-radius: 12px; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1); overflow: hidden; }
    .spt-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #eaecf0; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .table-title { font-size: 1.125rem; font-weight: 600; margin: 0; }
    .table-subtitle { font-size: 0.875rem; color: #697386; margin: 0.25rem 0 0; }
    .spt-header-controls { display: flex; align-items: center; gap: 0.875rem; flex-wrap: wrap; }

    .filter-tabs-group { display: flex; background: #f8f9fc; border: 1px solid #eaecf0; border-radius: 8px; padding: 3px; gap: 2px; }
    .filter-tab { background: transparent; border: none; border-radius: 6px; padding: 0.375rem 0.75rem; font-size: 0.8125rem; font-weight: 600; color: #697386; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 0.375rem; }
    .filter-tab.active { background: white; color: #1a1f36; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1); }
    .filter-tab.paid-tab.active { color: #059669; }
    .filter-tab.pending-tab.active { color: #d97706; }
    .filter-tab.rejected-tab.active { color: #dc2626; }
    .tab-count { background: #eaecf0; color: #697386; font-size: 0.6875rem; font-weight: 700; padding: 0.05rem 0.4rem; border-radius: 100px; }

    .table-search-box { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #dcdfe4; border-radius: 8px; padding: 0.375rem 0.75rem; }
    .table-search-box i { width: 15px; height: 15px; color: #697386; flex-shrink: 0; }
    .table-search-box input { border: none; outline: none; font-size: 0.8125rem; color: #3c4257; width: 180px; background: transparent; }
    .table-search-box input::placeholder { color: #98a2b3; }

    /* Loading / Empty */
    .table-loading-state { padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .table-loading-state p { font-size: 0.875rem; color: #697386; }
    .table-empty-state { padding: 3rem 2rem; text-align: center; }
    .empty-icon { width: 56px; height: 56px; background: #f8f9fc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
    .empty-icon i { width: 24px; height: 24px; color: #98a2b3; }
    .empty-title { font-size: 1rem; font-weight: 600; color: #3c4257; margin: 0; }

    /* Table */
    .table-responsive-tp { overflow-x: auto; }
    .premium-table-tp { width: 100%; border-collapse: collapse; }
    .premium-table-tp th { background: #f9fafb; padding: 0.75rem 1.25rem; font-size: 0.75rem; font-weight: 600; color: #697386; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; }
    .premium-table-tp td { padding: 0.875rem 1.25rem; border-bottom: 1px solid #eaecf0; font-size: 0.875rem; color: #3c4257; }
    .hover-row:hover { background: #f9fafb; cursor: pointer; }

    .student-cell { display: flex; align-items: center; gap: 0.875rem; }
    .student-avatar { width: 36px; height: 36px; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 700; flex-shrink: 0; }
    .student-info { display: flex; flex-direction: column; }
    .student-info .name { font-weight: 600; color: #1a1f36; }
    .student-info .email { font-size: 0.75rem; color: #697386; }
    .source-tag { background: #f0f4ff; color: #4338ca; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 6px; }
    .amount-cell { font-weight: 700; color: #1a1f36; }

    .status-pill { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.25rem 0.625rem; border-radius: 100px; font-size: 0.75rem; font-weight: 600; }
    .status-pill.paid { background: #ecfdf5; color: #059669; }
    .status-pill.pending { background: #fffbeb; color: #d97706; }
    .status-pill.rejected { background: #fef2f2; color: #dc2626; }
    .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    /* Mini progress */
    .mini-progress-wrap { display: flex; flex-direction: column; gap: 0.25rem; min-width: 100px; }
    .mini-progress-bar { height: 5px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
    .mini-progress-fill { height: 100%; border-radius: 100px; transition: width 0.6s ease; }
    .mini-progress-label { font-size: 0.6875rem; color: #697386; font-weight: 500; }

    .btn-icon-tp { width: 32px; height: 32px; border-radius: 6px; border: 1px solid #dcdfe4; background: white; color: #697386; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .btn-icon-tp:hover { background: #f7f8f9; color: #1a1f36; border-color: #c1c9d2; }
    .btn-icon-tp i { width: 16px; height: 16px; }

    /* Table Footer */
    .table-summary-footer { padding: 0.875rem 1.5rem; border-top: 1px solid #eaecf0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
    .summary-info { font-size: 0.8125rem; color: #697386; }
    .summary-pills { display: flex; gap: 0.5rem; }
    .summary-pill { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.625rem; border-radius: 100px; }
    .paid-pill { background: #ecfdf5; color: #059669; }
    .pending-pill { background: #fffbeb; color: #d97706; }
    .rejected-pill { background: #fef2f2; color: #dc2626; }
    .summary-pill .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
    .summary-total { font-size: 0.8125rem; color: #697386; }
    .summary-total strong { color: #1a1f36; font-weight: 700; }

    .card-tp-title { font-size: 1.0625rem; font-weight: 700; color: #1a1f36; margin: 0; }

    /* ---- Responsive ---- */
    @media (max-width: 1440px) {
      .enroll-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 1024px) {
      .enroll-charts-row { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .enroll-kpi-grid { grid-template-columns: 1fr; }
      .comp-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .spt-header-controls { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class CompanyDashboardComponent implements AfterViewInit, OnInit {
  authService = inject(AuthService);
  studentService = inject(StudentService);
  router = inject(Router);

  today = new Date();
  isLoading = true;
  trendLoading = false;
  trendRange: '7d' | '15d' | '30d' | 'custom' = '7d';
  trendFrom = '';
  trendTo = '';
  activeFilter = '';
  searchText = '';
  private enrollChart: any = null;

  paymentStats = {
    totalOnboarded: 0,
    paidCount: 0, paidAmount: 0,
    pendingCount: 0, pendingAmount: 0,
    rejectedCount: 0, rejectedAmount: 0
  };

  studentsWithPayments: any[] = [];
  monthlyTrend: any[] = [];

  private fallbackStudents = [
    { id: '1', name: 'Rohan Mehta', email: 'rohan.m@company.com', source: 'Company', counsellor: 'Priya Sharma', onboardingDate: '2024-09-10', paymentAmount: 1200, paymentStatus: 'PAID' },
    { id: '2', name: 'Anjali Gupta', email: 'anjali.g@company.com', source: 'Company', counsellor: 'Suresh Kumar', onboardingDate: '2024-09-15', paymentAmount: 1500, paymentStatus: 'PAID' },
    { id: '3', name: 'Kevin James', email: 'k.james@corp.com', source: 'Company', counsellor: 'Rahul Gupta', onboardingDate: '2024-09-20', paymentAmount: 1100, paymentStatus: 'PENDING' },
    { id: '4', name: 'Sneha Patel', email: 'sneha.p@company.com', source: 'Company', counsellor: 'Priya Sharma', onboardingDate: '2024-10-01', paymentAmount: 1350, paymentStatus: 'PAID' },
    { id: '5', name: 'Tom Bradley', email: 't.bradley@corp.com', source: 'Direct', counsellor: 'Suresh Kumar', onboardingDate: '2024-10-05', paymentAmount: 900, paymentStatus: 'REJECTED' },
    { id: '6', name: 'Kavita Rao', email: 'kavita.r@company.com', source: 'Company', counsellor: 'Rahul Gupta', onboardingDate: '2024-10-12', paymentAmount: 1600, paymentStatus: 'PAID' },
    { id: '7', name: 'Marcus Lee', email: 'm.lee@corp.com', source: 'Company', counsellor: 'Priya Sharma', onboardingDate: '2024-10-18', paymentAmount: 1250, paymentStatus: 'PENDING' },
    { id: '8', name: 'Divya Krishnan', email: 'divya.k@company.com', source: 'Company', counsellor: 'Suresh Kumar', onboardingDate: '2024-10-25', paymentAmount: 1400, paymentStatus: 'PAID' }
  ];

  get filteredStudents(): any[] {
    return this.studentsWithPayments.filter(s => {
      const matchStatus = !this.activeFilter || s.paymentStatus === this.activeFilter;
      const matchSearch = !this.searchText ||
        s.name?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        s.email?.toLowerCase().includes(this.searchText.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  getPaidPct(): number {
    if (!this.paymentStats.totalOnboarded) return 0;
    return Math.round((this.paymentStats.paidCount / this.paymentStats.totalOnboarded) * 100);
  }
  getPendingPct(): number {
    if (!this.paymentStats.totalOnboarded) return 0;
    return Math.round((this.paymentStats.pendingCount / this.paymentStats.totalOnboarded) * 100);
  }
  getRejectedPct(): number {
    if (!this.paymentStats.totalOnboarded) return 0;
    return Math.round((this.paymentStats.rejectedCount / this.paymentStats.totalOnboarded) * 100);
  }

  getAvatarColor(name: string): string {
    const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6', '#14b8a6', '#667cb0'];
    return colors[(name || '').charCodeAt(0) % colors.length];
  }

  getInitials(name: string): string {
    return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  setFilter(status: string) { this.activeFilter = status; }
  viewStudentDetail(id: string) { this.router.navigate(['/company/students', id]); }

  setTrendRange(range: '7d' | '15d' | '30d' | 'custom') {
    this.trendRange = range;
    if (range !== 'custom') this.loadTrend();
  }

  onCustomRangeChange() {
    if (this.trendFrom && this.trendTo) this.loadTrend();
  }

  private loadTrend() {
    const params = this.trendRange === 'custom'
      ? { from: this.trendFrom, to: this.trendTo }
      : { range: this.trendRange };

    this.trendLoading = true;
    this.studentService.getCommissionTrend(params).pipe(catchError(() => of(null))).subscribe({
      next: (res: any) => {
        const points: any[] = Array.isArray(res?.data) ? res.data : [];
        if (this.enrollChart) {
          this.enrollChart.updateOptions({
            series: [
              { name: 'Students Enrolled', data: points.map((p: any) => p.enrolled || 0) },
              { name: 'Payments Confirmed', data: points.map((p: any) => p.paid || 0) },
              { name: 'Payments Pending', data: points.map((p: any) => p.pending || 0) }
            ],
            xaxis: { categories: points.map((p: any) => p.label || '') }
          });
        }
        this.trendLoading = false;
      },
      error: () => { this.trendLoading = false; }
    });
  }

  ngOnInit() { this.loadDashboardData(); }
  ngAfterViewInit() { this.initIcons(); }

  private loadDashboardData() {
    this.studentService.getDashboardSummary().pipe(catchError(() => of(null))).subscribe({
      next: (res: any) => {
        if (res?.summary) {
          this.paymentStats = {
            totalOnboarded: res.summary.totalOnboarded || 0,
            paidCount: res.summary.paidCount || 0,
            paidAmount: res.summary.paidAmount || 0,
            pendingCount: res.summary.pendingCount || 0,
            pendingAmount: res.summary.pendingAmount || 0,
            rejectedCount: res.summary.rejectedCount || 0,
            rejectedAmount: res.summary.rejectedAmount || 0
          };
        }

        if (Array.isArray(res?.monthlyTrend) && res.monthlyTrend.length) {
          this.monthlyTrend = res.monthlyTrend;
        }

        const studentList: any[] = Array.isArray(res?.students) ? res.students : [];
        this.studentsWithPayments = studentList.length
          ? studentList.map((s: any) => ({
              id: s.id,
              name: s.name || 'Unknown',
              email: s.email || '',
              counsellor: s.counsellor || '—',
              onboardingDate: s.onboardingDate || new Date().toISOString(),
              paymentAmount: s.paymentAmount || 0,
              paymentStatus: (s.paymentStatus || 'PENDING').toUpperCase(),
              paymentProgress: s.paymentProgress || 0
            }))
          : this.fallbackStudents;

        if (!res?.summary) {
          this.computeStatsFromStudents();
        }

        this.isLoading = false;
        setTimeout(() => { this.initCharts(); this.initIcons(); }, 150);
      },
      error: () => {
        this.studentsWithPayments = this.fallbackStudents;
        this.computeStatsFromStudents();
        this.isLoading = false;
        setTimeout(() => { this.initCharts(); this.initIcons(); }, 150);
      }
    });
  }

  private computeStatsFromStudents() {
    const p = this.studentsWithPayments.filter(s => s.paymentStatus === 'PAID');
    const n = this.studentsWithPayments.filter(s => s.paymentStatus === 'PENDING');
    const r = this.studentsWithPayments.filter(s => s.paymentStatus === 'REJECTED');
    this.paymentStats = {
      totalOnboarded: this.studentsWithPayments.length,
      paidCount: p.length, paidAmount: p.reduce((s, x) => s + x.paymentAmount, 0),
      pendingCount: n.length, pendingAmount: n.reduce((s, x) => s + x.paymentAmount, 0),
      rejectedCount: r.length, rejectedAmount: r.reduce((s, x) => s + x.paymentAmount, 0)
    };
  }

  private initIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  private initCharts() {
    const ApexCharts = (window as any).ApexCharts;
    if (!ApexCharts) return;

    // 1. Enrollment + Payment Grouped Bar
    const enrollEl = document.querySelector('#enrollmentTrendChart');
    if (enrollEl) {
      this.enrollChart = new ApexCharts(enrollEl, {
        series: [
          { name: 'Students Enrolled', data: [] },
          { name: 'Payments Confirmed', data: [] },
          { name: 'Payments Pending', data: [] }
        ],
        chart: { height: 320, type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        colors: ['#6366f1', '#10b981', '#f59e0b'],
        plotOptions: { bar: { borderRadius: 5, columnWidth: '60%', dataLabels: { position: 'top' } } },
        dataLabels: { enabled: false },
        xaxis: { categories: [], axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { formatter: (v: number) => Math.floor(v).toString() } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        legend: { position: 'top', horizontalAlign: 'left', fontSize: '13px' },
        tooltip: { theme: 'light', shared: true, intersect: false },
        noData: { text: 'No data for selected period', align: 'center', verticalAlign: 'middle', style: { color: '#697386', fontSize: '14px' } }
      });
      this.enrollChart.render();
      this.loadTrend();
    }

    // 2. Payment Health Radial Bars
    const radialEl = document.querySelector('#paymentRadialChart');
    if (radialEl) {
      new ApexCharts(radialEl, {
        series: [this.getPaidPct() || 75, this.getPendingPct() || 20, this.getRejectedPct() || 5],
        chart: { height: 250, type: 'radialBar', fontFamily: 'Inter, sans-serif' },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 270,
            hollow: { margin: 5, size: '30%', background: 'transparent' },
            track: { background: '#f1f5f9', strokeWidth: '97%', margin: 5 },
            dataLabels: { name: { show: false }, value: { show: false } }
          }
        },
        colors: ['#10b981', '#f59e0b', '#ef4444'],
        labels: ['Paid', 'Pending', 'Rejected'],
        legend: { show: true, floating: true, fontSize: '13px', position: 'left', offsetX: 50, offsetY: 60,
          labels: { useSeriesColors: true },
          markers: { size: 0 },
          formatter: (seriesName: string, opts: any) => seriesName + ': ' + opts.w.globals.series[opts.seriesIndex] + '%',
          itemMargin: { horizontal: 3, vertical: 0 }
        },
        tooltip: { theme: 'light', y: { formatter: (v: number) => v + '%' } }
      }).render();
    }
  }
}
