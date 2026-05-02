import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { DatePipe } from '@angular/common';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RoleConfigService } from '../../../../core/services/role-config.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent],
  providers: [DatePipe],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">{{ roleConfig.getRoleSpecificTitle('Students') }}</h1>
          <p class="page-subtitle">{{ getRoleSpecificSubtitle() }}</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher">
            <button class="switcher-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="List View">
              <span class="material-icons">list</span>
              <span>List</span>
            </button>
            <button class="switcher-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Grid View">
              <span class="material-icons">grid_view</span>
              <span>Grid</span>
            </button>
          </div>
          <button class="btn btn-primary" [routerLink]="['add']">
            <span class="material-icons">add</span>
            <span>Add Student</span>
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search by name, email or phone..." [(ngModel)]="searchQuery" (keyup.enter)="onSearch()">
        </div>
        <div class="filter-actions">
          <select class="filter-select" [(ngModel)]="filterStatus" (change)="onStatusChange()">
            <option value="">All Status</option>
            <option value="LEAD">Lead</option>
            <option value="REGISTERED">Registered</option>
            <option value="LOST">Lost</option>
          </select>
          <button class="btn-icon-secondary" [class.active]="showAdvancedFilters" (click)="showAdvancedFilters = !showAdvancedFilters" title="Advanced Filters">
            <span class="material-icons">tune</span>
          </button>
        </div>
      </div>

      <!-- Advanced Filters Panel -->
      <div class="advanced-filters-panel" [class.show]="showAdvancedFilters">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Country</label>
            <select [(ngModel)]="filterCountry">
              <option value="">All Countries</option>
              <option value="Germany">Germany</option>
              <option value="UK">UK</option>
              <option value="USA">USA</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Joined Date From</label>
            <input type="date" [(ngModel)]="filterDateFrom">
          </div>
          <div class="filter-group">
            <label>Joined Date To</label>
            <input type="date" [(ngModel)]="filterDateTo">
          </div>
          <div class="filter-group">
            <button class="btn-ghost-sm" (click)="resetFilters()">Reset All Filters</button>
          </div>
        </div>
      </div>

      <app-empty-state 
        *ngIf="students.length === 0"
        title="No Students Found"
        message="There are currently no students registered. Add your first student to get started."
        [showAction]="true"
        actionText="Add Student"
        [routerLink]="['add']">
      </app-empty-state>

      <!-- List View -->
      <div class="table-card" *ngIf="students.length > 0 && viewMode === 'list'">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Counsellor</th>
                <th>Country / University</th>
                <th>Joined Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of students" (click)="viewDetail(student.id)" class="clickable-row">
                <td>
                  <div class="entity-meta">
                    <div class="avatar-circle" [style.background]="getAvatarColor(student.name)">
                      {{ getInitials(student.name) }}
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ student.name }}</span>
                      <span class="entity-subtext">#{{ student.id }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-weight: 500;">{{ student.phone }}</span>
                    <span class="entity-subtext">{{ student.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge-status" [ngClass]="getStatusClass(student.status)">
                    {{ student.status }}
                  </span>
                </td>
                <td>{{ student.counsellor }}</td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-weight: 500;">{{ student.country }}</span>
                    <span class="entity-subtext">{{ student.university }}</span>
                  </div>
                </td>
                <td>{{ student.date }}</td>
                <td style="text-align: right;">
                  <div class="action-btns" (click)="$event.stopPropagation()">
                    <button class="btn-icon" [routerLink]="['edit', student.id]">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon" style="color: var(--color-error);">
                      <span class="material-icons">delete_outline</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Grid View -->
      <div class="grid-container" *ngIf="students.length > 0 && viewMode === 'grid'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        <div class="table-card" *ngFor="let student of students | slice:0:displayedCardsCount" (click)="viewDetail(student.id)" style="cursor: pointer; padding: 1.25rem; transition: all 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div class="entity-meta">
              <div class="avatar-circle" [style.background]="getAvatarColor(student.name)">
                {{ getInitials(student.name) }}
              </div>
              <div class="entity-info">
                <span class="entity-name">{{ student.name }}</span>
                <span class="entity-subtext">#{{ student.id }}</span>
              </div>
            </div>
            <span class="badge-status" [ngClass]="getStatusClass(student.status)">{{ student.status }}</span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: var(--color-gray-50); border-radius: 8px;">
            <div class="entity-info">
              <span class="entity-subtext">Phone</span>
              <span class="entity-name" style="font-size: 0.8125rem;">{{ student.phone }}</span>
            </div>
            <div class="entity-info">
              <span class="entity-subtext">Country</span>
              <span class="entity-name" style="font-size: 0.8125rem;">{{ student.country }}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
            <span class="entity-subtext">{{ student.date }}</span>
            <div class="action-btns" (click)="$event.stopPropagation()">
              <button class="btn-icon">
                <span class="material-icons">more_vert</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div *ngIf="students.length > displayedCardsCount" style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 1rem;">
          <button class="btn btn-secondary" (click)="loadMoreCards()">
            <span>Load More Students</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class StudentListComponent implements OnInit {
  router = inject(Router);
  studentService = inject(StudentService);
  datePipe = inject(DatePipe);
  
  searchQuery = '';
  filterStatus = '';
  filterCountry = '';
  filterDateFrom = '';
  filterDateTo = '';
  showAdvancedFilters = false;
  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;
  
  students: any[] = [];
  loading = false;
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading = true;
    this.studentService.getStudents(this.currentPage, this.pageSize, this.searchQuery, this.filterStatus)
      .subscribe({
        next: (data) => {
          this.students = data.content.map((s: any) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            email: s.email,
            status: s.status,
            counsellor: s.createdBy?.fullName || 'Unassigned',
            country: s.country?.name || 'N/A',
            university: s.university?.name || 'N/A',
            date: this.datePipe.transform(s.createdAt, 'dd MMM yyyy')
          }));
          this.totalElements = data.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching students:', err);
          this.loading = false;
        }
      });
  }

  onSearch() {
    this.currentPage = 0;
    this.loadStudents();
  }

  onStatusChange() {
    this.currentPage = 0;
    this.loadStudents();
  }

  loadMoreCards() {
    this.currentPage++;
    this.studentService.getStudents(this.currentPage, this.pageSize, this.searchQuery, this.filterStatus)
      .subscribe({
        next: (data) => {
          const newStudents = data.content.map((s: any) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            email: s.email,
            status: s.status,
            counsellor: s.createdBy?.fullName || 'Unassigned',
            country: s.country?.name || 'N/A',
            university: s.university?.name || 'N/A',
            date: this.datePipe.transform(s.createdAt, 'dd MMM yyyy')
          }));
          this.students = [...this.students, ...newStudents];
          this.currentPage = data.number;
        }
      });
  }

  // Original helper methods kept below...

  get students() {
    return this.roleConfig.applyRoleBasedFilter(this.allStudents);
  }

  getRoleSpecificSubtitle(): string {
    const role = this.roleConfig.getCurrentUserRole();
    switch (role) {
      case 'ADMIN':
        return 'Manage all student leads and registered accounts.';
      case 'MANAGER':
        return 'Manage students for your branch.';
      case 'COMPANY':
        return 'Manage students referred by your company.';
      case 'REFERRAL':
        return 'Manage students you have referred.';
      case 'STUDENT':
        return 'View and manage your student profile.';
      default:
        return 'Manage student information.';
    }
  }

  viewDetail(id: string) {
    this.router.navigate(['/admin/students', id]);
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterCountry = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'registered': return 'success';
      case 'lead': return 'info';
      case 'lost': return 'error';
      default: return 'gray';
    }
  }

  getInitials(name?: string): string {
    if (!name || name.trim() === '') return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getAvatarColor(name?: string): string {
    if (!name) return '#94a3b8'; // default gray
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa', '#e879f9', '#f43f5e'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
