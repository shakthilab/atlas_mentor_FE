import { Component, inject, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { catchError, of } from 'rxjs';

declare const lucide: any;

@Component({
  selector: 'app-referral-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="dashboard-wrapper">

      <!-- Header -->
      <div class="dashboard-header-tp">
        <div class="header-main-tp">
          <div class="header-info-tp">
            <h1 class="welcome-title">Referral Dashboard</h1>
            <p class="welcome-subtitle">Welcome back! Here's what's happening with your referrals today.</p>
          </div>
        </div>
      </div>

      <!-- ===== STUDENT ONBOARDING & PAYMENT TRACKING SECTION ===== -->
      <div class="section-label-row">
        <div class="section-label-left">
          <div class="section-label-icon"><i data-lucide="credit-card"></i></div>
          <div>
            <h2 class="section-label-title">Student Onboarding & Payment Tracking</h2>
            <p class="section-label-sub">Real-time status of all student onboarding and commission payments</p>
          </div>
        </div>
        <div class="section-label-right">
          <div class="live-dot"></div>
          <span class="live-text">Live Data</span>
        </div>
      </div>

      <!-- Payment Status Metric Cards -->
      <div class="payment-kpi-grid">
        <div class="payment-kpi-card card-total">
          <div class="pkpi-top">
            <div class="pkpi-icon"><i data-lucide="graduation-cap"></i></div>
            <span class="pkpi-trend-badge">All Time</span>
          </div>
          <div class="pkpi-body">
            <div class="pkpi-value">{{ isLoading ? '—' : paymentStats.totalOnboarded }}</div>
            <div class="pkpi-label">Total Onboarded Students</div>
            <div class="pkpi-progress-row">
              <div class="pkpi-progress-bar">
                <div class="pkpi-progress-fill total" style="width: 100%"></div>
              </div>
              <span class="pkpi-progress-pct">100%</span>
            </div>
          </div>
        </div>

        <div class="payment-kpi-card card-paid">
          <div class="pkpi-top">
            <div class="pkpi-icon"><i data-lucide="check-circle"></i></div>
            <span class="pkpi-trend-badge success">Cleared</span>
          </div>
          <div class="pkpi-body">
            <div class="pkpi-value">{{ isLoading ? '—' : paymentStats.paidCount }}</div>
            <div class="pkpi-label">Payments Received</div>
            <div class="pkpi-amount">{{ paymentStats.paidAmount | currency }}</div>
            <div class="pkpi-progress-row">
              <div class="pkpi-progress-bar">
                <div class="pkpi-progress-fill paid" [style.width]="getPaidPct() + '%'"></div>
              </div>
              <span class="pkpi-progress-pct">{{ getPaidPct() }}%</span>
            </div>
          </div>
        </div>

        <div class="payment-kpi-card card-pending">
          <div class="pkpi-top">
            <div class="pkpi-icon"><i data-lucide="hourglass"></i></div>
            <span class="pkpi-trend-badge warning">Balance Due</span>
          </div>
          <div class="pkpi-body">
            <div class="pkpi-value">{{ isLoading ? '—' : paymentStats.pendingBalance | currency:'USD':'symbol':'1.0-0' }}</div>
            <div class="pkpi-label">Pending Balance</div>
            <div class="pkpi-progress-row">
              <div class="pkpi-progress-bar">
                <div class="pkpi-progress-fill pending" [style.width]="getPendingPct() + '%'"></div>
              </div>
              <span class="pkpi-progress-pct">{{ getPendingPct() }}%</span>
            </div>
          </div>
        </div>

        <div class="payment-kpi-card card-rejected">
          <div class="pkpi-top">
            <div class="pkpi-icon"><i data-lucide="x-circle"></i></div>
            <span class="pkpi-trend-badge danger">Declined</span>
          </div>
          <div class="pkpi-body">
            <div class="pkpi-value">{{ isLoading ? '—' : paymentStats.rejectedCount }}</div>
            <div class="pkpi-label">Rejected Payments</div>
            <div class="pkpi-progress-row">
              <div class="pkpi-progress-bar">
                <div class="pkpi-progress-fill rejected" [style.width]="getRejectedPct() + '%'"></div>
              </div>
              <span class="pkpi-progress-pct">{{ getRejectedPct() }}%</span>
            </div>
          </div>
        </div>

        <div class="payment-kpi-card card-dispute">
          <div class="pkpi-top">
            <div class="pkpi-icon"><i data-lucide="alert-triangle"></i></div>
            <span class="pkpi-trend-badge dispute">In Review</span>
          </div>
          <div class="pkpi-body">
            <div class="pkpi-value">{{ isLoading ? '—' : paymentStats.disputeCount }}</div>
            <div class="pkpi-label">Disputed Payments</div>
            <div class="pkpi-amount">{{ paymentStats.disputeAmount | currency }}</div>
            <div class="pkpi-progress-row">
              <div class="pkpi-progress-bar">
                <div class="pkpi-progress-fill dispute" [style.width]="getDisputePct() + '%'"></div>
              </div>
              <span class="pkpi-progress-pct">{{ getDisputePct() }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Charts Row -->
      <div class="payment-charts-row">
        <!-- Commission Revenue Bar Chart -->
        <div class="payment-chart-main">
          <div class="card-tp-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
            <div>
              <h3 class="card-tp-title">Commission Revenue</h3>
              <p class="card-tp-subtitle">Commission received vs pending balance over selected period</p>
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
          <div id="revenueBarChart" style="min-height: 320px;"></div>
        </div>

        <!-- Payment Status Donut -->
        <div class="payment-chart-side">
          <div class="card-tp-header" style="margin-bottom:1.25rem;">
            <h3 class="card-tp-title">Payment Status</h3>
            <p class="card-tp-subtitle">Current distribution</p>
          </div>
          <div id="paymentStatusDonut" style="min-height: 220px;"></div>
          <div class="payment-status-legend">
            <div class="legend-row">
              <div class="legend-left">
                <span class="legend-dot" style="background:#10b981;"></span>
                <span class="legend-name">Paid</span>
              </div>
              <div class="legend-right">
                <span class="legend-count">{{ paymentStats.paidCount }}</span>
                <span class="legend-pct">{{ getPaidPct() }}%</span>
              </div>
            </div>
            <div class="legend-row">
              <div class="legend-left">
                <span class="legend-dot" style="background:#f59e0b;"></span>
                <span class="legend-name">Pending</span>
              </div>
              <div class="legend-right">
                <span class="legend-count">{{ paymentStats.pendingCount }}</span>
                <span class="legend-pct">{{ getPendingPct() }}%</span>
              </div>
            </div>
            <div class="legend-row">
              <div class="legend-left">
                <span class="legend-dot" style="background:#ef4444;"></span>
                <span class="legend-name">Rejected</span>
              </div>
              <div class="legend-right">
                <span class="legend-count">{{ paymentStats.rejectedCount }}</span>
                <span class="legend-pct">{{ getRejectedPct() }}%</span>
              </div>
            </div>
            <div class="legend-row">
              <div class="legend-left">
                <span class="legend-dot" style="background:#8b5cf6;"></span>
                <span class="legend-name">Dispute</span>
              </div>
              <div class="legend-right">
                <span class="legend-count">{{ paymentStats.disputeCount }}</span>
                <span class="legend-pct">{{ getDisputePct() }}%</span>
              </div>
            </div>
            <div class="legend-total-row">
              <span class="legend-total-label">Total Assigned</span>
              <span class="legend-total-value">{{ paymentStats.totalAssignedAmount | currency }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Onboarding Payment Table — commented out, enable when API provides student-level data -->
      <!-- <div class="onboarding-table-wrap">
        <div class="table-card-premium">
          <div class="table-card-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid #eaecf0;">
            <div class="header-left" style="flex:1;">
              <h2 class="table-title">Student Onboarding & Payment Status</h2>
              <p class="table-subtitle">Track payment progress for every referred student</p>
            </div>
            <div class="table-header-controls">
              [Status Filter Tabs]
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
                <button class="filter-tab dispute-tab" [class.active]="activeFilter === 'DISPUTE'" (click)="setFilter('DISPUTE')">
                  Dispute <span class="tab-count">{{ paymentStats.disputeCount }}</span>
                </button>
              </div>
              [Search]
              <div class="table-search-box">
                <i data-lucide="search"></i>
                <input type="text" placeholder="Search students..." [(ngModel)]="searchText">
              </div>
            </div>
          </div>

          [Loading]
          <div class="table-loading-state" *ngIf="isLoading">
            <div class="loading-spinner"></div>
            <p>Loading student payment data...</p>
          </div>

          [Empty]
          <div class="table-empty-state" *ngIf="!isLoading && filteredStudents.length === 0">
            <div class="empty-icon"><i data-lucide="inbox"></i></div>
            <p class="empty-title">No students found</p>
            <p class="empty-subtitle">Try changing the filter or search term.</p>
          </div>

          [Table]
          <div class="table-responsive-tp" *ngIf="!isLoading && filteredStudents.length > 0">
            <table class="premium-table-tp">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Source</th>
                  <th>Counsellor</th>
                  <th>Onboarding Date</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
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
                    <button class="btn-icon-tp" (click)="viewStudentDetail(s.id)">
                      <i data-lucide="eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          [Table Footer Summary]
          <div class="table-summary-footer" *ngIf="!isLoading && filteredStudents.length > 0">
            <span class="summary-info">Showing {{ filteredStudents.length }} of {{ paymentStats.totalOnboarded }} students</span>
            <div class="summary-pills">
              <span class="summary-pill paid-pill">
                <span class="dot"></span>{{ paymentStats.paidCount }} Paid
              </span>
              <span class="summary-pill pending-pill">
                <span class="dot"></span>{{ paymentStats.pendingCount }} Pending
              </span>
              <span class="summary-pill rejected-pill">
                <span class="dot"></span>{{ paymentStats.rejectedCount }} Rejected
              </span>
            </div>
            <button class="btn-ghost-sm" (click)="navigateToPayments()">View All Payments →</button>
          </div>
        </div>
      </div> -->

    </div>
  `,
  styles: [`
    /* ---- Header ---- */
    .dashboard-header-tp { margin-bottom: 2rem; }
    .header-main-tp { display: flex; justify-content: space-between; align-items: flex-end; }
    .header-actions-tp { display: flex; gap: 0.75rem; }

    .btn-action-primary {
      background: #2563eb; color: white; border: none;
      padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600;
      font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-action-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
    .btn-action-outline {
      background: white; color: #3c4257; border: 1px solid #dcdfe4;
      padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600;
      font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-action-outline:hover { background: #f7f8f9; }

    /* ---- Referral Link Card ---- */
    .quick-link-card {
      background: white; border: 1px solid #eaecf0; border-radius: 12px;
      padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);
    }
    .link-info { display: flex; gap: 1.25rem; align-items: center; }
    .icon-box-link { width: 48px; height: 48px; background: #eff6ff; color: #2563eb; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .icon-box-link i { width: 24px; height: 24px; }
    .link-text-content h3 { font-size: 1.125rem; font-weight: 600; margin: 0; }
    .link-text-content p { font-size: 0.875rem; color: #697386; margin: 0.25rem 0 0; }
    .copy-input-wrap { display: flex; background: #f8f9fc; border: 1px solid #dcdfe4; border-radius: 8px; padding: 0.25rem; min-width: 400px; }
    .copy-input-wrap input { flex: 1; background: transparent; border: none; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #3c4257; outline: none; }
    .copy-btn { background: white; border: 1px solid #dcdfe4; border-radius: 6px; padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 600; color: #3c4257; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
    .copy-btn:hover { background: #f7f8f9; }
    .copy-btn i { width: 14px; height: 14px; }

    /* ---- Referral KPI Grid ---- */
    .stats-grid-tp { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card-premium { background: white; border: 1px solid #eaecf0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1); transition: transform 0.2s; }
    .stat-card-premium:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(16, 24, 40, 0.05); }
    .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .stat-icon-tp { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .stat-icon-tp i { width: 20px; height: 20px; }
    .stat-badge { display: flex; align-items: center; gap: 0.25rem; padding: 0.125rem 0.5rem; border-radius: 100px; font-size: 0.75rem; font-weight: 600; }
    .stat-badge.up { background: #ecfdf5; color: #10b981; }
    .stat-badge.down { background: #fef2f2; color: #ef4444; }
    .stat-badge i { width: 12px; height: 12px; }
    .stat-label-tp { font-size: 0.875rem; color: #697386; font-weight: 500; }
    .stat-value-tp { font-size: 1.75rem; font-weight: 700; color: #1a1f36; margin: 0.25rem 0; letter-spacing: -0.02em; }
    .stat-comparison { font-size: 0.75rem; color: #697386; }

    /* ---- Section Label ---- */
    .section-label-row {
      display: flex; justify-content: space-between; align-items: center;
      margin: 0.5rem 0 1.5rem;
      padding: 1rem 1.25rem;
      background: white;
      border: 1px solid #eaecf0;
      border-radius: 12px;
      border-left: 4px solid #2563eb;
      box-shadow: 0 1px 3px rgba(16, 24, 40, 0.08);
    }
    .section-label-left { display: flex; align-items: center; gap: 1rem; }
    .section-label-icon { width: 40px; height: 40px; background: #eff6ff; color: #2563eb; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .section-label-icon i { width: 20px; height: 20px; }
    .section-label-title { font-size: 1.0625rem; font-weight: 700; color: #1a1f36; margin: 0; }
    .section-label-sub { font-size: 0.8125rem; color: #697386; margin: 0.125rem 0 0; }
    .section-label-right { display: flex; align-items: center; gap: 0.5rem; }
    .live-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse-dot 2s infinite; }
    .live-text { font-size: 0.75rem; font-weight: 600; color: #10b981; }
    @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.3); } }

    /* ---- Payment KPI Cards ---- */
    .payment-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.25rem; margin-bottom: 1.75rem; }
    .payment-kpi-card {
      background: white; border: 1px solid #eaecf0; border-radius: 14px;
      padding: 1.25rem; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.08);
      transition: all 0.2s; position: relative; overflow: hidden;
    }
    .payment-kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
    .card-total::before { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
    .card-paid::before { background: linear-gradient(90deg, #10b981, #059669); }
    .card-pending::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .card-rejected::before { background: linear-gradient(90deg, #ef4444, #dc2626); }
    .card-dispute::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
    .payment-kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(16, 24, 40, 0.1); }

    .pkpi-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .pkpi-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .pkpi-icon i { width: 18px; height: 18px; }
    .card-total .pkpi-icon { background: #eef2ff; color: #6366f1; }
    .card-paid .pkpi-icon { background: #ecfdf5; color: #10b981; }
    .card-pending .pkpi-icon { background: #fffbeb; color: #f59e0b; }
    .card-rejected .pkpi-icon { background: #fef2f2; color: #ef4444; }
    .card-dispute .pkpi-icon { background: #f5f3ff; color: #8b5cf6; }

    .pkpi-trend-badge { font-size: 0.6875rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 100px; letter-spacing: 0.04em; text-transform: uppercase; }
    .pkpi-trend-badge.success { background: #ecfdf5; color: #059669; }
    .pkpi-trend-badge.warning { background: #fffbeb; color: #d97706; }
    .pkpi-trend-badge.danger { background: #fef2f2; color: #dc2626; }
    .pkpi-trend-badge.dispute { background: #f5f3ff; color: #7c3aed; }
    .pkpi-trend-badge:not(.success):not(.warning):not(.danger):not(.dispute) { background: #eef2ff; color: #6366f1; }

    .pkpi-value { font-size: 2rem; font-weight: 800; color: #1a1f36; line-height: 1; margin-bottom: 0.25rem; letter-spacing: -0.03em; }
    .pkpi-label { font-size: 0.8125rem; color: #697386; font-weight: 500; margin-bottom: 0.5rem; }
    .pkpi-amount { font-size: 0.875rem; font-weight: 700; color: #3c4257; margin-bottom: 0.75rem; }

    .pkpi-progress-row { display: flex; align-items: center; gap: 0.5rem; }
    .pkpi-progress-bar { flex: 1; height: 5px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
    .pkpi-progress-fill { height: 100%; border-radius: 100px; transition: width 0.8s ease; }
    .pkpi-progress-fill.total { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
    .pkpi-progress-fill.paid { background: linear-gradient(90deg, #10b981, #059669); }
    .pkpi-progress-fill.pending { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .pkpi-progress-fill.rejected { background: linear-gradient(90deg, #ef4444, #dc2626); }
    .pkpi-progress-fill.dispute { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
    .pkpi-progress-pct { font-size: 0.6875rem; font-weight: 700; color: #697386; white-space: nowrap; }

    /* ---- Payment Charts Row ---- */
    .payment-charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .payment-chart-main, .payment-chart-side {
      background: white; border: 1px solid #eaecf0; border-radius: 12px;
      padding: 1.5rem; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1);
    }
    .card-tp-subtitle { font-size: 0.8125rem; color: #697386; margin: 0.2rem 0 0; }

    .trend-filter-bar { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
    .range-btn-group { display: flex; background: #f1f5f9; border-radius: 8px; padding: 3px; gap: 2px; }
    .range-btn { background: transparent; border: none; border-radius: 6px; padding: 0.3rem 0.75rem; font-size: 0.8125rem; font-weight: 600; color: #697386; cursor: pointer; transition: all 0.15s; }
    .range-btn.active { background: white; color: #1a1f36; box-shadow: 0 1px 3px rgba(16,24,40,0.1); }
    .custom-date-row { display: flex; align-items: center; gap: 0.5rem; }
    .date-input-sm { padding: 0.3rem 0.6rem; border: 1px solid #dcdfe4; border-radius: 6px; font-size: 0.8125rem; color: #3c4257; outline: none; background: white; }
    .date-input-sm:focus { border-color: #667cb0; }
    .date-sep { font-size: 0.8125rem; color: #697386; }
    .chart-loading-overlay { display: flex; justify-content: center; padding: 1rem 0; }

    /* Payment Status Legend */
    .payment-status-legend { border-top: 1px solid #f1f5f9; padding-top: 1rem; margin-top: 0.5rem; }
    .legend-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px dashed #f1f5f9; }
    .legend-row:last-child { border-bottom: none; }
    .legend-left { display: flex; align-items: center; gap: 0.5rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-name { font-size: 0.8125rem; color: #3c4257; font-weight: 500; }
    .legend-right { display: flex; align-items: center; gap: 0.75rem; }
    .legend-count { font-size: 0.875rem; font-weight: 700; color: #1a1f36; }
    .legend-pct { font-size: 0.75rem; color: #697386; background: #f8f9fc; padding: 0.1rem 0.4rem; border-radius: 4px; }
    .legend-total-row { display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; margin-top: 0.25rem; border-top: 2px solid #eaecf0; }
    .legend-total-label { font-size: 0.8125rem; font-weight: 600; color: #697386; }
    .legend-total-value { font-size: 1rem; font-weight: 800; color: #1a1f36; }

    /* ---- Onboarding Table ---- */
    .onboarding-table-wrap { margin-bottom: 2rem; }
    .table-card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .table-title { font-size: 1.125rem; font-weight: 600; margin: 0; }
    .table-subtitle { font-size: 0.875rem; color: #697386; margin: 0.25rem 0 0; }

    .table-header-controls { display: flex; align-items: center; gap: 0.875rem; flex-wrap: wrap; }

    .filter-tabs-group { display: flex; background: #f8f9fc; border: 1px solid #eaecf0; border-radius: 8px; padding: 3px; gap: 2px; }
    .filter-tab {
      background: transparent; border: none; border-radius: 6px;
      padding: 0.375rem 0.75rem; font-size: 0.8125rem; font-weight: 600;
      color: #697386; cursor: pointer; transition: all 0.15s;
      display: flex; align-items: center; gap: 0.375rem;
    }
    .filter-tab.active { background: white; color: #1a1f36; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1); }
    .filter-tab.paid-tab.active { color: #059669; }
    .filter-tab.pending-tab.active { color: #d97706; }
    .filter-tab.rejected-tab.active { color: #dc2626; }
    .filter-tab.dispute-tab.active { color: #7c3aed; }
    .tab-count { background: #eaecf0; color: #697386; font-size: 0.6875rem; font-weight: 700; padding: 0.05rem 0.4rem; border-radius: 100px; }
    .filter-tab.active .tab-count { background: #f1f5f9; }

    .table-search-box {
      display: flex; align-items: center; gap: 0.5rem;
      background: white; border: 1px solid #dcdfe4; border-radius: 8px;
      padding: 0.375rem 0.75rem;
    }
    .table-search-box i { width: 15px; height: 15px; color: #697386; flex-shrink: 0; }
    .table-search-box input { border: none; outline: none; font-size: 0.8125rem; color: #3c4257; width: 180px; background: transparent; }
    .table-search-box input::placeholder { color: #98a2b3; }

    /* Loading / Empty States */
    .table-loading-state { padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .table-loading-state p { font-size: 0.875rem; color: #697386; }
    .table-empty-state { padding: 3.5rem 2rem; text-align: center; }
    .empty-icon { width: 56px; height: 56px; background: #f8f9fc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
    .empty-icon i { width: 24px; height: 24px; color: #98a2b3; }
    .empty-title { font-size: 1rem; font-weight: 600; color: #3c4257; margin: 0; }
    .empty-subtitle { font-size: 0.875rem; color: #697386; margin: 0.375rem 0 0; }

    /* Table */
    .table-responsive-tp { overflow-x: auto; }
    .premium-table-tp { width: 100%; border-collapse: collapse; }
    .premium-table-tp th { background: #f9fafb; padding: 0.75rem 1.5rem; font-size: 0.75rem; font-weight: 600; color: #697386; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; }
    .premium-table-tp td { padding: 0.875rem 1.5rem; border-bottom: 1px solid #eaecf0; font-size: 0.875rem; color: #3c4257; }
    .hover-row:hover { background: #f9fafb; cursor: pointer; }

    .student-cell { display: flex; align-items: center; gap: 0.875rem; }
    .student-avatar { width: 36px; height: 36px; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 700; flex-shrink: 0; }
    .student-info { display: flex; flex-direction: column; }
    .student-info .name { font-weight: 600; color: #1a1f36; }
    .student-info .email { font-size: 0.75rem; color: #697386; }

    .source-tag { background: #eef2ff; color: #4338ca; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 6px; }

    .status-pill { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.25rem 0.625rem; border-radius: 100px; font-size: 0.75rem; font-weight: 600; }
    .status-pill.paid { background: #ecfdf5; color: #059669; }
    .status-pill.pending { background: #fffbeb; color: #d97706; }
    .status-pill.rejected { background: #fef2f2; color: #dc2626; }
    .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .amount-cell { font-weight: 700; color: #1a1f36; }

    .btn-icon-tp { width: 32px; height: 32px; border-radius: 6px; border: 1px solid #dcdfe4; background: white; color: #697386; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .btn-icon-tp:hover { background: #f7f8f9; color: #1a1f36; border-color: #c1c9d2; }
    .btn-icon-tp i { width: 16px; height: 16px; }

    /* Table Summary Footer */
    .table-summary-footer {
      padding: 0.875rem 1.5rem; border-top: 1px solid #eaecf0;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;
    }
    .summary-info { font-size: 0.8125rem; color: #697386; }
    .summary-pills { display: flex; gap: 0.5rem; }
    .summary-pill { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.625rem; border-radius: 100px; }
    .paid-pill { background: #ecfdf5; color: #059669; }
    .pending-pill { background: #fffbeb; color: #d97706; }
    .rejected-pill { background: #fef2f2; color: #dc2626; }
    .summary-pill .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

    .btn-ghost-sm { background: transparent; border: none; color: #2563eb; font-size: 0.8125rem; font-weight: 600; cursor: pointer; padding: 0.375rem 0.5rem; border-radius: 6px; transition: all 0.2s; }
    .btn-ghost-sm:hover { background: #eff6ff; }

    .card-tp-title { font-size: 1.0625rem; font-weight: 700; color: #1a1f36; margin: 0; }
    .table-card-premium { background: white; border: 1px solid #eaecf0; border-radius: 12px; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1); overflow: hidden; }

    /* ---- Responsive ---- */
    @media (max-width: 1440px) {
      .stats-grid-tp { grid-template-columns: repeat(2, 1fr); }
      .payment-kpi-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 1024px) {
      .payment-charts-row { grid-template-columns: 1fr; }
      .quick-link-card { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .copy-input-wrap { min-width: 100%; }
    }
    @media (max-width: 768px) {
      .stats-grid-tp, .payment-kpi-grid { grid-template-columns: 1fr; }
      .table-header-controls { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class ReferralDashboardComponent implements AfterViewInit, OnInit {
  authService = inject(AuthService);
  studentService = inject(StudentService);
  router = inject(Router);

  referralLink = 'https://atlasmentor.com/register/student?ref=REF1284';
  linkCopied = false;
  isLoading = true;
  trendLoading = false;
  trendRange: '7d' | '15d' | '30d' | 'custom' = '7d';
  trendFrom = '';
  trendTo = '';
  activeFilter = '';
  searchText = '';
  private revenueChart: any = null;

  paymentStats = {
    totalOnboarded: 0,
    totalAssignedAmount: 0,
    paidCount: 0, paidAmount: 0,
    pendingCount: 0, pendingBalance: 0,
    rejectedCount: 0,
    disputeCount: 0, disputeAmount: 0
  };

  studentsWithPayments: any[] = [];
  monthlyTrend: any[] = [];


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
  getDisputePct(): number {
    if (!this.paymentStats.totalOnboarded) return 0;
    return Math.round((this.paymentStats.disputeCount / this.paymentStats.totalOnboarded) * 100);
  }

  getAvatarColor(name: string): string {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6', '#0ea5e9', '#14b8a6'];
    const index = (name || '').charCodeAt(0) % colors.length;
    return colors[index];
  }

  getInitials(name: string): string {
    return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  setFilter(status: string) {
    this.activeFilter = status;
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    this.initIcons();
  }

  private loadDashboardData() {
    this.studentService.getDashboardSummary().pipe(catchError(() => of(null))).subscribe({
      next: (res: any) => {
        const payoutStats = res?.payoutStats || {};
        const statusCounts = payoutStats.statusCounts || {};

        this.paymentStats = {
          totalOnboarded: payoutStats.totalRecords || 0,
          totalAssignedAmount: payoutStats.totalAssignedAmount || 0,
          paidCount: statusCounts.PAID || 0,
          paidAmount: payoutStats.totalPaidAmount || 0,
          pendingCount: statusCounts.PENDING || 0,
          pendingBalance: payoutStats.totalPendingBalance || 0,
          rejectedCount: statusCounts.REJECTED || 0,
          disputeCount: statusCounts.DISPUTE || 0,
          disputeAmount: payoutStats.totalDisputedAmount || 0
        };

        if (Array.isArray(res?.monthlyTrend) && res.monthlyTrend.length) {
          this.monthlyTrend = res.monthlyTrend;
        }

        const studentList: any[] = Array.isArray(res?.students) ? res.students : [];
        this.studentsWithPayments = studentList.map((s: any) => ({
          id: s.id,
          name: s.name || 'Unknown',
          email: s.email || '',
          counsellor: s.counsellor || '—',
          onboardingDate: s.onboardingDate || new Date().toISOString(),
          paymentAmount: s.paymentAmount || 0,
          paymentStatus: (s.paymentStatus || 'PENDING').toUpperCase()
        }));

        this.isLoading = false;
        setTimeout(() => { this.initCharts(); this.initIcons(); }, 150);
      },
      error: () => {
        this.isLoading = false;
        setTimeout(() => { this.initCharts(); this.initIcons(); }, 150);
      }
    });
  }

  private initIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  copyLink(link: string) {
    navigator.clipboard.writeText(link).then(() => {
      this.linkCopied = true;
      setTimeout(() => this.linkCopied = false, 2000);
    });
  }

  navigateToAddLead() { this.router.navigate(['/referral/leads']); }
  navigateToPayments() { this.router.navigate(['/referral/leads']); }
  viewStudentDetail(id: string) { this.router.navigate(['/referral/students', id]); }
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
        this.updateRevenueChart(points);
        this.trendLoading = false;
      },
      error: () => { this.trendLoading = false; }
    });
  }

  private updateRevenueChart(points: any[]) {
    const labels = points.map((p: any) => p.label || '');
    const received = points.map((p: any) => p.commissionReceived || 0);
    const pending = points.map((p: any) => p.pendingBalance || 0);

    if (this.revenueChart) {
      this.revenueChart.updateSeries([
        { name: 'Commission Received', data: received },
        { name: 'Pending Balance', data: pending }
      ]);
      this.revenueChart.updateOptions({
        xaxis: { categories: labels }
      });
    }
  }

  private initCharts() {
    const ApexCharts = (window as any).ApexCharts;
    if (!ApexCharts) return;

    // 1. Commission Revenue Bar Chart
    const revenueEl = document.querySelector('#revenueBarChart');
    if (revenueEl) {
      this.revenueChart = new ApexCharts(revenueEl, {
        series: [
          { name: 'Commission Received', data: [] },
          { name: 'Pending Balance', data: [] }
        ],
        chart: { height: 320, type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', stacked: false },
        colors: ['#10b981', '#f59e0b'],
        plotOptions: { bar: { borderRadius: 6, columnWidth: '50%', dataLabels: { position: 'top' } } },
        dataLabels: { enabled: false },
        xaxis: { categories: [], axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { formatter: (v: number) => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v) } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        legend: { position: 'top', horizontalAlign: 'left', fontSize: '13px' },
        tooltip: { theme: 'light', y: { formatter: (v: number) => '$' + v.toLocaleString() } },
        noData: { text: 'No data for selected period', align: 'center', verticalAlign: 'middle', style: { color: '#697386', fontSize: '14px' } }
      });
      this.revenueChart.render();
      this.loadTrend();
    }

    // 2. Payment Status Donut
    const donutEl = document.querySelector('#paymentStatusDonut');
    if (donutEl) {
      const total = this.paymentStats.totalOnboarded;
      new ApexCharts(donutEl, {
        series: [this.paymentStats.paidCount || 0, this.paymentStats.pendingCount || 0, this.paymentStats.rejectedCount || 0, this.paymentStats.disputeCount || 0],
        chart: { type: 'donut', height: 220, fontFamily: 'Inter, sans-serif' },
        labels: ['Paid', 'Pending', 'Rejected', 'Dispute'],
        colors: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        legend: { show: false },
        dataLabels: { enabled: false },
        plotOptions: {
          pie: {
            donut: {
              size: '72%',
              labels: {
                show: true,
                name: { show: true, fontSize: '13px', fontWeight: 600, color: '#697386' },
                value: { show: true, fontSize: '22px', fontWeight: 800, color: '#1a1f36' },
                total: { show: true, label: 'Total Students', fontSize: '12px', fontWeight: 600, color: '#697386',
                  formatter: () => String(total) }
              }
            }
          }
        },
        stroke: { width: 0 }
      }).render();
    }

  }
}
