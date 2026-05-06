import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RoleConfigService } from '../../../../core/services/role-config.service';
import { StudentService } from '../../../../core/services/student.service';
import { finalize } from 'rxjs/operators';
import { CountryService, CountryMobileCode } from '../../../../core/services/country.service';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification.service';
import { StudentFormComponent } from '../../students/student-form/student-form.component';
import { StudentDetailComponent } from '../../students/student-detail/student-detail.component';

@Component({
  selector: 'app-lead-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent, StudentFormComponent, StudentDetailComponent],
  providers: [DatePipe],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">{{ roleConfig.getRoleSpecificTitle('Leads') }}</h1>
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
            <span class="material-icons">person_add</span>
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="stats-grid">
        <div class="stat-mini-card">
          <span class="label">Total Leads</span>
          <span class="value">{{ totalElements }}</span>
        </div>
        <div class="stat-mini-card">
          <span class="label">New This Week</span>
          <span class="value orange">{{ newLeadsCount }}</span>
        </div>
        <div class="stat-mini-card">
          <span class="label">Conversion Rate</span>
          <span class="value">{{ conversionRate }}%</span>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search by name, email or phone..." [(ngModel)]="searchQuery" (keyup.enter)="onSearch()">
        </div>
        <div class="filter-actions">
          <select class="filter-select" [(ngModel)]="filterStatus" (change)="onFilterChange()">
            <option value="">All Status</option>
            <option value="LEAD">Lead</option>
            <option value="PROSPECTIVE">Prospective</option>
            <option value="REGISTERED">Registered</option>
            <option value="STUDENT">Student</option>
            <option value="LOST">Lost</option>
          </select>
          <select class="filter-select" [(ngModel)]="filterSource" (change)="onFilterChange()">
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
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
            <select [(ngModel)]="filterCountry" (change)="onFilterChange()">
              <option value="">All Countries</option>
              <option value="Germany">Germany</option>
              <option value="Uzbekistan">Uzbekistan</option>
              <option value="India">India</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Date From</label>
            <input type="date" [(ngModel)]="filterDateFrom" (change)="onFilterChange()">
          </div>
          <div class="filter-group">
            <label>Date To</label>
            <input type="date" [(ngModel)]="filterDateTo" (change)="onFilterChange()">
          </div>
          <div class="filter-group">
            <button class="btn-ghost-sm" (click)="resetFilters()">Reset All Filters</button>
          </div>
        </div>
      </div>

      <app-empty-state 
        *ngIf="leads.length === 0 && !loading"
        title="No Leads Found"
        message="There are currently no leads matching your criteria."
        [showAction]="true"
        actionText="Add New Lead"
        (actionClick)="openAddModal()">
      </app-empty-state>

      <!-- List View -->
      <div class="table-card overflow-visible" *ngIf="leads.length > 0 && viewMode === 'list'">
        <div class="table-responsive overflow-visible">
          <table class="premium-table" style="min-width: 1100px;">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Added by</th>
                <th>Country / University</th>
                <th>Lead Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let lead of leads; let i = index" [class.row-active]="openStatusDropdownId === lead.id">
                <td>
                  <div class="entity-meta">
                    <div class="avatar-circle" [style.background]="getAvatarColor(lead.name)">
                      {{ getInitials(lead.name) }}
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ lead.name }}</span>
                      <span class="entity-subtext">#{{ lead.id }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-weight: 500;">{{ getFormattedPhone(lead) }}</span>
                    <span class="entity-subtext">{{ lead.email }}</span>
                  </div>
                </td>
                <td (click)="$event.stopPropagation()">
                  <div class="status-dropdown-container">
                    <span class="badge-status" [ngClass]="[getStatusClass(lead.status), roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY' ? 'clickable' : '']" 
                          (click)="roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY' ? toggleStatusDropdown($event, lead.id) : null">
                      {{ lead.status }}
                      <span class="material-icons" *ngIf="roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY'" style="font-size: 14px;">expand_more</span>
                    </span>
                    
                    <div class="status-dropdown shadow-premium" [class.open-up]="i >= leads.length - 2" *ngIf="openStatusDropdownId === lead.id && roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY'" (click)="$event.stopPropagation()">
                      <div class="dropdown-item" *ngFor="let s of statusOptions" (click)="selectNewStatus(lead.id, s)">
                        <span class="dot" [ngClass]="getStatusClass(s)"></span>
                        {{ s }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{{ lead.assignedTo }}</td>
                <td>{{ lead.createdBy }}</td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-weight: 500;">{{ lead.country }}</span>
                    <span class="entity-subtext">{{ lead.university }}</span>
                  </div>
                </td>
                <td>{{ lead.date }}</td>
                <td style="text-align: right;">
                  <div class="action-btns" (click)="$event.stopPropagation()">
                    <button class="btn-icon" (click)="openEditModal(lead.id)" title="Edit">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon" style="color: var(--color-error);" (click)="openConfirmModal(lead.id)" title="Delete">
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
      <div class="grid-container" *ngIf="leads.length > 0 && viewMode === 'grid'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        <div class="table-card" *ngFor="let lead of leads | slice:0:displayedCardsCount" 
             [class.overflow-visible]="openStatusDropdownId === lead.id"
             [style.z-index]="openStatusDropdownId === lead.id ? '100' : '1'"
             style="padding: 1.25rem; transition: all 0.2s; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div class="entity-meta">
              <div class="avatar-circle" [style.background]="getAvatarColor(lead.name)">
                {{ getInitials(lead.name) }}
              </div>
              <div class="entity-info">
                <span class="entity-name">{{ lead.name }}</span>
                <span class="entity-subtext">#{{ lead.id }}</span>
              </div>
            </div>
            <div class="status-dropdown-container" (click)="$event.stopPropagation()">
              <span class="badge-status" [ngClass]="[getStatusClass(lead.status), roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY' ? 'clickable' : '']" 
                    (click)="roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY' ? toggleStatusDropdown($event, lead.id) : null">
                {{ lead.status }}
                <span class="material-icons" *ngIf="roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY'" style="font-size: 14px;">expand_more</span>
              </span>
              <div class="status-dropdown shadow-premium" *ngIf="openStatusDropdownId === lead.id && roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY'" (click)="$event.stopPropagation()">
                <div class="dropdown-item" *ngFor="let s of statusOptions" (click)="selectNewStatus(lead.id, s)">
                  <span class="dot" [ngClass]="getStatusClass(s)"></span>
                  {{ s }}
                </div>
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: var(--color-gray-50); border-radius: 8px;">
            <div class="entity-info">
              <span class="entity-subtext">Phone</span>
              <span class="entity-name" style="font-size: 0.8125rem;">{{ getFormattedPhone(lead) }}</span>
            </div>
            <div class="entity-info">
              <span class="entity-subtext">University</span>
              <span class="entity-name" style="font-size: 0.8125rem;">{{ lead.university }}</span>
            </div>
            <div class="entity-info" style="grid-column: span 2;">
              <span class="entity-subtext">Added by</span>
              <span class="entity-name" style="font-size: 0.8125rem;">{{ lead.createdBy }}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
            <span class="entity-subtext">{{ lead.date }}</span>
            <div class="action-btns" (click)="$event.stopPropagation()">
              <button class="btn-icon" (click)="openEditModal(lead.id)" title="Edit">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-icon" style="color: var(--color-error);" (click)="openConfirmModal(lead.id)" title="Delete">
                <span class="material-icons">delete_outline</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div *ngIf="leads.length > displayedCardsCount" style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 1rem;">
          <button class="btn btn-secondary" (click)="loadMoreCards()">
            <span>Load More Leads</span>
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
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #101828; margin-bottom: 0.5rem;">Delete Lead</h2>
        <p style="color: #667085; margin-bottom: 2rem;">Are you sure you want to delete this lead? This action cannot be undone.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <button class="btn btn-secondary" (click)="closeConfirmModal()" [disabled]="deleting">Cancel</button>
          <button class="btn btn-primary" style="background: #d92d20; border-color: #d92d20;" (click)="confirmDelete()" [disabled]="deleting">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Status Comment Modal -->
    <div class="modal-overlay" *ngIf="showStatusCommentModal" (click)="closeStatusCommentModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 450px;">
        <div class="modal-header">
          <h2 class="modal-title">Update Status</h2>
          <button class="btn-icon" (click)="closeStatusCommentModal()" [disabled]="updatingStatus">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="status-preview" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding: 1rem; background: var(--color-gray-50); border-radius: 8px;">
            <span class="entity-subtext">New Status:</span>
            <span class="badge-status" [ngClass]="getStatusClass(pendingStatus)">{{ pendingStatus }}</span>
          </div>
          
          <div class="form-group">
            <label>Notes / Reason for change</label>
            <textarea 
              [(ngModel)]="statusComment" 
              placeholder="Enter details about this status change..."
              rows="4"
              class="form-control"
              style="resize: vertical;"></textarea>
          </div>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 1px solid var(--color-gray-100);">
          <button class="btn btn-secondary" (click)="closeStatusCommentModal()" [disabled]="updatingStatus">Cancel</button>
          <button class="btn btn-primary" (click)="confirmStatusChange()" [disabled]="!statusComment || updatingStatus">
            <span *ngIf="!updatingStatus">Update Status</span>
            <span *ngIf="updatingStatus">Updating...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-mini-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--color-gray-200); display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-sm); }
    .stat-mini-card .label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-gray-500); letter-spacing: 0.05em; }
    .stat-mini-card .value { font-size: 1.75rem; font-weight: 700; color: var(--color-gray-900); }
    .stat-mini-card .value.orange { color: #f79009; }
    
    .status-dropdown-container { position: relative; display: inline-block; }
    .status-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 100;
      min-width: 160px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border: 1px solid var(--color-gray-200);
      margin-top: 0.5rem;
      overflow: hidden;
      animation: dropdownFade 0.2s ease-out;
    }
    
    .status-dropdown.open-up {
      top: auto;
      bottom: 100%;
      margin-top: 0;
      margin-bottom: 0.5rem;
      animation: dropdownUpFade 0.2s ease-out;
    }

    @keyframes dropdownUpFade {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .row-active { position: relative; z-index: 10 !important; }
    .dropdown-item {
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: background 0.2s;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-gray-700);
    }
    .dropdown-item:hover { background: var(--color-gray-50); color: var(--color-gray-900); }
    .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dot.info { background: #3b82f6; }
    .dot.success { background: #10b981; }
    .dot.error { background: #ef4444; }
    .dot.gray { background: #8b5cf6; }
    .clickable { cursor: pointer; }
    .dot.prospective { background: #f59e0b; }
    .dot.student { background: #06b6d4; }
    .dot.registered { background: #10b981; }

    .badge-status.prospective { background: #fffbeb; color: #f59e0b; }
    .badge-status.student { background: #ecfeff; color: #0891b2; }
    .badge-status.registered { background: #ecfdf5; color: #10b981; }
    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LeadListComponent implements OnInit {
  router = inject(Router);
  public roleConfig = inject(RoleConfigService);
  private countryService = inject(CountryService);
  countryCodes: CountryMobileCode[] = [];
  studentService = inject(StudentService);
  datePipe = inject(DatePipe);
  notificationService = inject(NotificationService);

  searchQuery = '';
  filterStatus = '';
  filterSource = '';
  filterCountry = '';
  filterDateFrom = '';
  filterDateTo = '';
  showAdvancedFilters = false;
  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;
  
  allLeads: any[] = [];
  loading = false;
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;

  // Modal State
  showFormModal = false;
  selectedStudentId: string | null = null;

  // Confirm Modal State
  showConfirmModal = false;
  studentIdToDelete: string | null = null;
  deleting = false;

  // Status Dropdown
  openStatusDropdownId: string | null = null;
  showStatusCommentModal = false;
  pendingStatusStudentId: string | null = null;
  pendingStatus = '';
  statusComment = '';
  updatingStatus = false;

  statusOptions = ['LEAD', 'PROSPECTIVE', 'REGISTERED', 'STUDENT', 'LOST'];

  ngOnInit() {
    this.loadLeads();
    this.loadCountryCodes();
  }

  loadCountryCodes() {
    this.countryService.getMobileCountryCodes().subscribe({
      next: (data) => this.countryCodes = data,
      error: (err) => console.error('Failed to load country codes', err)
    });
  }

  getFormattedPhone(lead: any): string {
    if (!lead) return 'N/A';
    const phone = lead.phone || lead.user?.phone;
    if (!phone) return 'N/A';
    
    if (phone.startsWith('+')) return phone;
    
    let dialCode = lead.dialCode || lead.user?.dialCode;
    const mccId = lead.mobileCountryCodeId || lead.user?.mobileCountryCodeId;
    
    if (!dialCode && mccId && this.countryCodes?.length > 0) {
      const country = this.countryCodes.find(c => c.id === mccId);
      if (country) dialCode = country.mobileCode;
    }
    
    return dialCode ? `${dialCode} ${phone}` : phone;
  }

  loadLeads() {
    this.loading = true;
    this.studentService.getNonRegisteredStudents(this.currentPage, this.pageSize, this.searchQuery, this.filterStatus)
      .subscribe({
        next: (data) => {
          this.allLeads = data.content.map((s: any) => ({
            id: s.id,
            name: s.name || s.user?.fullName || 'N/A',
            phone: s.phone || s.user?.phone,
            email: s.email || s.user?.email,
            mobileCountryCodeId: s.mobileCountryCodeId || s.user?.mobileCountryCodeId,
            dialCode: s.dialCode || s.user?.dialCode,
            status: s.status || 'LEAD',
            country: s.countryName || s.country?.name || s.user?.country?.name || 'N/A',
            university: s.universityName || s.university?.name || 'N/A',
            date: this.datePipe.transform(s.createdAt, 'dd MMM yyyy'),
            assignedTo: s.assignedBy?.fullName || 'Unassigned',
            createdBy: s.createdByUser ? `${s.createdByUser.fullName} (${s.createdByUser.role || 'N/A'})` : 'N/A'
          }));
          this.totalElements = data.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching leads:', err);
          this.loading = false;
        }
      });
  }

  loadMoreCards() {
    this.currentPage++;
    this.studentService.getNonRegisteredStudents(this.currentPage, this.pageSize, this.searchQuery, this.filterStatus)
      .subscribe({
        next: (data) => {
          const newLeads = data.content.map((s: any) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            email: s.email,
            status: s.status || 'LEAD',
            country: s.countryName || s.country?.name || 'N/A',
            university: s.universityName || s.university?.name || 'N/A',
            date: this.datePipe.transform(s.createdAt, 'dd MMM yyyy'),
            assignedTo: s.assignedBy?.fullName || 'Unassigned',
            createdBy: s.createdByUser ? `${s.createdByUser.fullName} (${s.createdByUser.role || 'N/A'})` : 'N/A'
          }));
          this.allLeads = [...this.allLeads, ...newLeads];
        }
      });
  }

  toggleStatusDropdown(event: Event, id: string) {
    event.stopPropagation();
    this.openStatusDropdownId = this.openStatusDropdownId === id ? null : id;
  }

  selectNewStatus(leadId: string, status: string) {
    const lead = this.allLeads.find(l => l.id === leadId);
    if (lead && lead.status === status) {
      this.openStatusDropdownId = null;
      return;
    }
    this.pendingStatusStudentId = leadId;
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
        this.notificationService.success('Status updated successfully');
        this.loadLeads();
      },
      error: (err) => {
        this.updatingStatus = false;
        this.notificationService.error('Failed to update status');
        console.error(err);
      }
    });
  }

  openAddModal() {
    this.selectedStudentId = null;
    this.showFormModal = true;
  }

  openEditModal(id: string) {
    this.selectedStudentId = id;
    this.showFormModal = true;
  }

  closeFormModal() {
    this.showFormModal = false;
    this.selectedStudentId = null;
  }

  onFormSuccess() {
    this.closeFormModal();
    this.loadLeads();
  }

  openConfirmModal(id: string) {
    this.studentIdToDelete = id;
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    if (this.deleting) return;
    this.showConfirmModal = false;
    this.studentIdToDelete = null;
  }

  confirmDelete() {
    if (!this.studentIdToDelete || this.deleting) return;
    this.deleting = true;
    this.studentService.deleteStudent(this.studentIdToDelete).subscribe({
      next: () => {
        this.deleting = false;
        this.showConfirmModal = false;
        this.studentIdToDelete = null;
        this.notificationService.success('Lead deleted successfully');
        this.loadLeads();
      },
      error: (err) => {
        this.deleting = false;
        this.notificationService.error('Failed to delete lead');
        console.error(err);
      }
    });
  }

  getRoleSpecificSubtitle(): string {
    const role = this.roleConfig.getCurrentUserRole();
    switch (role) {
      case 'ADMIN':
        return 'Manage and track prospective student leads.';
      case 'MANAGER':
        return 'Manage leads for your branch.';
      case 'COMPANY':
        return 'Manage leads generated by your company.';
      case 'REFERRAL':
        return 'Manage leads you have referred.';
      default:
        return 'Manage lead information.';
    }
  }

  get leads() {
    return this.allLeads;
  }

  onSearch() {
    this.currentPage = 0;
    this.loadLeads();
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadLeads();
  }

  get newLeadsCount(): number {
    return this.leads.filter(lead => lead.status === 'LEAD').length;
  }

  get conversionRate(): number {
    if (this.leads.length === 0) return 0;
    const converted = this.leads.filter(lead => lead.status === 'CONVERTED').length;
    return Math.round((converted / this.leads.length) * 100);
  }

  getRoutePath(path: string): string {
    const role = this.roleConfig.getCurrentUserRole();
    let prefix = 'admin';
    if (role === 'MANAGER') prefix = 'manager';
    else if (role === 'BRANCH_PARTNER') prefix = 'branch-partner';
    else if (role === 'EMPLOYEE' || role === 'SENIOR_COUNSELLOR' || role === 'JUNIOR_COUNSELLOR') prefix = 'employee';
    else if (role === 'COMPANY') prefix = 'company';
    else if (role === 'REFERRAL') prefix = 'referral';
    return `/${prefix}/${path}`;
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterSource = '';
    this.filterCountry = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.loadLeads();
  }

  viewDetail(id: string) {
    const role = this.roleConfig.getCurrentUserRole();
    let prefix = 'admin';
    if (role === 'MANAGER') prefix = 'manager';
    else if (role === 'BRANCH_PARTNER') prefix = 'branch-partner';
    else if (role === 'EMPLOYEE' || role === 'SENIOR_COUNSELLOR' || role === 'JUNIOR_COUNSELLOR') prefix = 'employee';
    else if (role === 'COMPANY') prefix = 'company';
    else if (role === 'REFERRAL') prefix = 'referral';
    this.router.navigate([`/${prefix}/students`, id]);
  }

  getStatusClass(status: string): string {
    if (!status) return 'gray';
    switch (status.toUpperCase()) {
      case 'LEAD': return 'info';
      case 'PROSPECTIVE': return 'prospective';
      case 'REGISTERED': return 'registered';
      case 'STUDENT': return 'student';
      case 'LOST': return 'error';
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
