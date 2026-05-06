import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { DatePipe } from '@angular/common';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RoleConfigService } from '../../../../core/services/role-config.service';

import { StudentFormComponent } from '../student-form/student-form.component';
import { StudentDetailComponent } from '../student-detail/student-detail.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { CountryService, CountryMobileCode } from '../../../../core/services/country.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent, StudentFormComponent, StudentDetailComponent],
  providers: [DatePipe],
  template: `
    <div class="module-container" (click)="closeAllDropdowns()">
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
          <button class="btn btn-primary" (click)="openAddModal()">
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
            <option value="PROSPECTIVE">Prospective</option>
            <option value="REGISTERED">Registered</option>
            <option value="STUDENT">Student</option>
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
        (actionClick)="openAddModal()">
      </app-empty-state>

      <!-- List View -->
      <div class="table-card overflow-visible" *ngIf="students.length > 0 && viewMode === 'list'">
        <div class="table-responsive overflow-visible">
          <table class="premium-table" style="min-width: 1100px;">
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Counsellor</th>
                <th>Added by</th>
                <th>Country / University</th>
                <th>Joined Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of students; let i = index" [class.row-active]="openStatusDropdownId === student.id">
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
                    <span class="entity-name" style="font-weight: 500;">{{ getFormattedPhone(student) }}</span>
                    <span class="entity-subtext">{{ student.email }}</span>
                  </div>
                </td>
                <td (click)="$event.stopPropagation()">
                  <div class="status-dropdown-container">
                    <span class="badge-status" [ngClass]="[getStatusClass(student.status), roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY' ? 'clickable' : '']" 
                          (click)="roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY' ? toggleStatusDropdown($event, student.id) : null">
                      {{ student.status }}
                      <span class="material-icons" *ngIf="roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY'" style="font-size: 14px;">expand_more</span>
                    </span>
                    
                    <div class="status-dropdown shadow-premium" [class.open-up]="i >= students.length - 2" *ngIf="openStatusDropdownId === student.id && roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY'" (click)="$event.stopPropagation()">
                      <div class="dropdown-item" *ngFor="let s of statusOptions" (click)="selectNewStatus(student.id, s)">
                        <span class="dot" [ngClass]="getStatusClass(s)"></span>
                        {{ s }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{{ student.counsellor }}</td>
                <td>{{ student.createdBy }}</td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-weight: 500;">{{ student.country }}</span>
                    <span class="entity-subtext">{{ student.university }}</span>
                  </div>
                </td>
                <td>{{ student.date }}</td>
                <td style="text-align: right;">
                  <div class="action-btns" (click)="$event.stopPropagation()">
                    <button class="btn-icon" (click)="openEditModal(student.id)" title="Edit">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon" style="color: var(--color-error);" (click)="deleteStudent(student.id)" title="Delete">
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
        <div class="table-card" *ngFor="let student of students | slice:0:displayedCardsCount" 
             [class.overflow-visible]="openStatusDropdownId === student.id || openActionDropdownId === student.id"
             [style.z-index]="(openStatusDropdownId === student.id || openActionDropdownId === student.id) ? '100' : '1'"
             style="padding: 1.25rem; transition: all 0.2s; position: relative;">
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
            <div class="status-dropdown-container" (click)="$event.stopPropagation()">
              <span class="badge-status" [ngClass]="[getStatusClass(student.status), roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY' ? 'clickable' : '']" 
                    (click)="roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY' ? toggleStatusDropdown($event, student.id) : null">
                {{ student.status }}
                <span class="material-icons" *ngIf="roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY'" style="font-size: 14px;">expand_more</span>
              </span>
              <div class="status-dropdown shadow-premium" *ngIf="openStatusDropdownId === student.id && roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY'" (click)="$event.stopPropagation()">
                <div class="dropdown-item" *ngFor="let s of statusOptions" (click)="selectNewStatus(student.id, s)">
                  <span class="dot" [ngClass]="getStatusClass(s)"></span>
                  {{ s }}
                </div>
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: var(--color-gray-50); border-radius: 8px;">
            <div class="entity-info">
              <span class="entity-subtext">Phone</span>
              <span class="entity-name" style="font-size: 0.8125rem;">{{ getFormattedPhone(student) }}</span>
            </div>
            <div class="entity-info">
              <span class="entity-subtext">Country</span>
              <span class="entity-name" style="font-size: 0.8125rem;">{{ student.country }}</span>
            </div>
            <div class="entity-info" style="grid-column: span 2;">
              <span class="entity-subtext">Added by</span>
              <span class="entity-name" style="font-size: 0.8125rem;">{{ student.createdBy }}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
            <span class="entity-subtext">{{ student.date }}</span>
            <div class="action-dropdown-container" (click)="$event.stopPropagation()" style="position: relative;">
              <button class="btn-icon" (click)="toggleActionDropdown($event, student.id)">
                <span class="material-icons">more_vert</span>
              </button>
              <div class="status-dropdown shadow-premium" *ngIf="openActionDropdownId === student.id" (click)="$event.stopPropagation()" style="right: 0; left: auto; top: calc(100% + 4px); min-width: 120px;">
                <div class="dropdown-item" (click)="openEditModal(student.id); openActionDropdownId = null">
                  <span class="material-icons" style="font-size: 18px;">edit</span>
                  <span style="font-weight: 500;">Edit</span>
                </div>
                <div class="dropdown-item" style="color: var(--color-error);" (click)="deleteStudent(student.id); openActionDropdownId = null">
                  <span class="material-icons" style="font-size: 18px;">delete_outline</span>
                  <span style="font-weight: 500;">Delete</span>
                </div>
              </div>
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

    <!-- Student Form Modal -->
    <div class="modal-overlay" *ngIf="showFormModal" (click)="closeFormModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 1050px; width: 95%; height: 85vh; min-height: 600px;">
        <app-student-form 
          [studentId]="selectedStudentId" 
          (close)="closeFormModal()"
          (success)="onFormSuccess()">
        </app-student-form>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showConfirmModal" (click)="closeConfirmModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 400px; padding: 2rem; text-align: center;">
        <div style="background: #fee4e2; color: #d92d20; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          <span class="material-icons">delete_forever</span>
        </div>
        <h2 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Delete Student</h2>
        <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-bottom: 2rem;">Are you sure you want to delete this student? This action cannot be undone and all associated data will be removed.</p>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" style="flex: 1; border: 1px solid var(--color-gray-300); background: white; color: var(--color-gray-700); border-radius: 8px; font-weight: 600;" (click)="closeConfirmModal()">Cancel</button>
          <button class="btn" style="flex: 1; background: #d92d20; color: white; border: none; border-radius: 8px; font-weight: 600;" (click)="executeDelete()" [disabled]="deleting">
            {{ deleting ? 'Deleting...' : 'Delete Student' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Status Comment Modal -->
    <div class="modal-overlay" *ngIf="showStatusCommentModal" (click)="closeStatusCommentModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 450px; padding: 2rem;">
        <div style="background: var(--color-primary-light); color: var(--color-primary); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          <span class="material-icons">comment</span>
        </div>
        <h2 style="margin: 0 0 0.5rem; font-size: 1.125rem; text-align: center;">Update Status to {{ pendingStatus }}</h2>
        <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-bottom: 1.5rem; text-align: center;">Please provide a reason for changing the status.</p>
        
        <div class="form-group" style="margin-bottom: 1.5rem;">
          <textarea 
            [(ngModel)]="statusComment" 
            class="form-control" 
            placeholder="Enter reason for status change..."
            style="min-height: 100px; padding: 12px; border-radius: 8px; width: 100%; border: 1px solid var(--color-gray-300); width: 100%;"
          ></textarea>
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" style="flex: 1; border: 1px solid var(--color-gray-300); background: white; color: var(--color-gray-700); border-radius: 8px; font-weight: 600; padding: 10px;" (click)="closeStatusCommentModal()">Cancel</button>
          <button class="btn" style="flex: 1; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-weight: 600; padding: 10px;" (click)="confirmStatusChange()" [disabled]="!statusComment || updatingStatus">
            {{ updatingStatus ? 'Updating...' : 'Confirm Change' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .table-responsive.overflow-visible { 
      overflow-x: auto; 
      overflow-y: visible !important; 
    }
    .table-card.overflow-visible { overflow: visible !important; }

    .row-active { position: relative; z-index: 100 !important; }

    .status-dropdown-container { position: relative; display: inline-flex; align-items: center; z-index: 10; }
    .badge-status.clickable { cursor: pointer; display: flex; align-items: center; gap: 4px; user-select: none; }
    .badge-status.clickable:hover { filter: brightness(0.9); transform: translateY(-1px); }
    .badge-status.clickable:active { transform: translateY(0); }
    
    .status-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      background: white;
      border: 1px solid var(--color-gray-200);
      border-radius: 12px;
      padding: 6px;
      z-index: 9999;
      min-width: 170px;
      text-align: left;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.05);
      animation: dropdownIn 0.2s ease-out;
    }

    .status-dropdown.open-up {
      top: auto;
      bottom: calc(100% + 8px);
      animation: dropdownUpIn 0.2s ease-out;
    }

    @keyframes dropdownUpIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-gray-700);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .dropdown-item:hover { background: var(--color-gray-50); color: var(--color-primary); }
    .dropdown-item .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .dot.info { background: #3b82f6; }
    .dot.success { background: #10b981; }
    .dot.error { background: #ef4444; }
    .dot.gray { background: #8b5cf6; }
    .dot.prospective { background: #f59e0b; }
    .dot.student { background: #06b6d4; }
    
    .badge-status.prospective { background: #fffbeb; color: #f59e0b; }
    .badge-status.student { background: #ecfeff; color: #0891b2; }
  `]
})
export class StudentListComponent implements OnInit {
  router = inject(Router);
  studentService = inject(StudentService);
  datePipe = inject(DatePipe);
  roleConfig = inject(RoleConfigService);
  notificationService = inject(NotificationService);

  searchQuery = '';
  filterStatus = '';
  filterCountry = '';
  filterDateFrom = '';
  filterDateTo = '';
  showAdvancedFilters = false;
  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;

  // Modal State
  showFormModal = false;
  selectedStudentId: string | null = null;

  // Confirm Modal State
  showConfirmModal = false;
  studentIdToDelete: string | null = null;
  deleting = false;

  // Status Change State
  openStatusDropdownId: string | null = null;
  openActionDropdownId: string | null = null;
  showStatusCommentModal = false;
  pendingStatusStudentId: string | null = null;
  pendingStatus = '';
  statusComment = '';
  updatingStatus = false;
  statusOptions = ['LEAD', 'PROSPECTIVE', 'REGISTERED', 'STUDENT', 'LOST'];

  private countryService = inject(CountryService);
  countryCodes: CountryMobileCode[] = [];

  allStudents: any[] = [];
  loading = false;
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;

  ngOnInit() {
    this.loadStudents();
    this.loadCountryCodes();
  }

  loadCountryCodes() {
    this.countryService.getMobileCountryCodes().subscribe({
      next: (data) => this.countryCodes = data,
      error: (err) => console.error('Failed to load country codes', err)
    });
  }

  getFormattedPhone(student: any): string {
    if (!student) return 'N/A';
    const phone = student.phone || student.user?.phone;
    if (!phone) return 'N/A';

    if (phone.startsWith('+')) return phone;

    let dialCode = student.dialCode || student.user?.dialCode;
    const mccId = student.mobileCountryCodeId || student.user?.mobileCountryCodeId;

    if (!dialCode && mccId && this.countryCodes?.length > 0) {
      const country = this.countryCodes.find(c => c.id === mccId);
      if (country) dialCode = country.mobileCode;
    }

    return dialCode ? `${dialCode} ${phone}` : phone;
  }

  openAddModal() {
    this.selectedStudentId = null;
    this.showFormModal = true;
  }

  openEditModal(id: string) {
    this.selectedStudentId = id;
    this.showFormModal = true;
  }

  viewStudentDetail(id: string) {
    const role = this.roleConfig.getCurrentUserRole();
    let prefix = 'admin';

    if (role === 'MANAGER') prefix = 'manager';
    else if (role === 'BRANCH_PARTNER') prefix = 'branch-partner';
    else if (role === 'EMPLOYEE' || role === 'SENIOR_COUNSELLOR' || role === 'JUNIOR_COUNSELLOR') prefix = 'employee';
    else if (role === 'COMPANY') prefix = 'company';
    else if (role === 'REFERRAL') prefix = 'referral';

    this.router.navigate([`/${prefix}/students`, id]);
  }

  closeFormModal() {
    this.showFormModal = false;
    this.selectedStudentId = null;
  }

  onFormSuccess() {
    this.closeFormModal();
    this.loadStudents();
  }

  toggleStatusDropdown(event: Event, id: string) {
    event.stopPropagation();
    this.openStatusDropdownId = this.openStatusDropdownId === id ? null : id;
    this.openActionDropdownId = null;
  }

  toggleActionDropdown(event: Event, id: string) {
    event.stopPropagation();
    this.openActionDropdownId = this.openActionDropdownId === id ? null : id;
    this.openStatusDropdownId = null;
  }

  closeAllDropdowns() {
    this.openStatusDropdownId = null;
    this.openActionDropdownId = null;
  }

  selectNewStatus(studentId: string, status: string) {
    const student = this.allStudents.find(s => s.id === studentId);
    if (student && student.status === status) {
      this.openStatusDropdownId = null;
      return;
    }
    this.pendingStatusStudentId = studentId;
    this.pendingStatus = status;
    this.openStatusDropdownId = null;
    this.statusComment = '';
    this.showStatusCommentModal = true;
  }

  closeStatusCommentModal() {
    if (this.updatingStatus) return;
    this.showStatusCommentModal = false;
  }

  confirmStatusChange() {
    if (!this.statusComment || this.updatingStatus || !this.pendingStatusStudentId) return;
    this.updatingStatus = true;

    this.studentService.updateStudentStatus(this.pendingStatusStudentId, this.pendingStatus, this.statusComment).subscribe({
      next: () => {
        this.updatingStatus = false;
        this.showStatusCommentModal = false;
        this.notificationService.success(`Status updated to ${this.pendingStatus}`);
        this.loadStudents();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.updatingStatus = false;
        this.notificationService.error('Failed to update status');
      }
    });
  }

  deleteStudent(id: string) {
    this.studentIdToDelete = id;
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    if (this.deleting) return;
    this.showConfirmModal = false;
    this.studentIdToDelete = null;
  }

  executeDelete() {
    if (!this.studentIdToDelete || this.deleting) return;
    this.deleting = true;

    this.studentService.deleteStudent(this.studentIdToDelete).subscribe({
      next: () => {
        this.deleting = false;
        this.showConfirmModal = false;
        this.studentIdToDelete = null;
        this.notificationService.success('Student deleted successfully');
        this.loadStudents();
      },
      error: (err: any) => {
        this.deleting = false;
        console.error('Error deleting student:', err);
        this.notificationService.error('Failed to delete student');
      }
    });
  }

  loadStudents() {
    this.loading = true;
    this.studentService.getRegisteredStudents(this.currentPage, this.pageSize, this.searchQuery, this.filterStatus)
      .subscribe({
        next: (data) => {
          this.allStudents = data.content.map((s: any) => ({
            id: s.id,
            name: s.name || s.user?.fullName || 'N/A',
            phone: s.phone || s.user?.phone,
            email: s.email || s.user?.email,
            mobileCountryCodeId: s.mobileCountryCodeId || s.user?.mobileCountryCodeId,
            dialCode: s.dialCode || s.user?.dialCode,
            status: s.status,
            counsellor: s.assignedBy?.fullName || 'Unassigned',
            createdBy: s.createdByUser ? `${s.createdByUser.fullName} (${s.createdByUser.role || 'N/A'})` : 'N/A',
            country: s.country?.name || s.user?.country?.name || 'N/A',
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
    this.studentService.getRegisteredStudents(this.currentPage, this.pageSize, this.searchQuery, this.filterStatus)
      .subscribe({
        next: (data) => {
          const newStudents = data.content.map((s: any) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            email: s.email,
            status: s.status,
            counsellor: s.createdBy?.fullName || 'Unassigned',
            createdBy: s.createdByName ? `${s.createdByName} (${s.createdByUserRole})` : 'N/A',
            country: s.country?.name || 'N/A',
            university: s.university?.name || 'N/A',
            date: this.datePipe.transform(s.createdAt, 'dd MMM yyyy')
          }));
          this.allStudents = [...this.allStudents, ...newStudents];
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
      case 'BRANCH_PARTNER':
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

  resetFilters() {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterCountry = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
  }

  getStatusClass(status: string): string {
    if (!status) return 'gray';
    switch (status.toLowerCase()) {
      case 'registered': return 'success';
      case 'lead': return 'info';
      case 'lost': return 'error';
      case 'prospective': return 'prospective';
      case 'student': return 'student';
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
