import { Component, inject, OnInit, HostListener } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../core/models/branch.model';
import { RoleService } from '../../../../core/services/role.service';
import { Role } from '../../../../core/services/role.service';
import { EmployeeService, Employee } from '../../../../core/services/employee.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { CountryService, CountryMobileCode } from '../../../../core/services/country.service';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, EmptyStateComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">Employees</h1>
          <p class="page-subtitle">Manage your team, roles, and branch assignments.</p>
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
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search by name or role..." [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)">
        </div>
        <div class="filter-actions">
          <select class="filter-select" [(ngModel)]="filterRole" (change)="onFilterChange()">
            <option value="">All Roles</option>
            <option *ngFor="let role of roles" [value]="role.name">{{ role.displayName || role.name }}</option>
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
            <label>Branch</label>
            <select [(ngModel)]="filterBranch" (change)="onFilterChange()">
              <option value="">All Branches</option>
              <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <button class="btn-ghost-sm" (click)="resetFilters()">Reset All Filters</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container shadow-premium" *ngIf="isLoading" style="padding: 3rem; text-align: center; background: white; border-radius: 12px; border: 1px solid var(--color-gray-200); margin-bottom: 2rem;">
        <div class="spinner-container" style="display: flex; justify-content: center; margin-bottom: 1rem;">
          <div class="loading-spinner"></div>
        </div>
        <p style="color: var(--color-gray-500);">Loading employees...</p>
      </div>

      <!-- Main Content Container -->
      <div *ngIf="!isLoading">
        
        <app-empty-state 
          *ngIf="employees.length === 0"
          title="No Employees Found"
          message="There are currently no employees configured. Add your first employee to get started."
          [showAction]="true"
          actionText="Add Employee"
          (actionClick)="openAddModal()">
        </app-empty-state>

        <!-- Employee Table -->
        <div class="table-card" *ngIf="employees.length > 0 && viewMode === 'list'">
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Tasks</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let emp of employees" class="clickable-row" (click)="viewDetails(emp)">
                  <td>
                    <div class="entity-meta">
                      <div class="avatar-circle" [style.background]="getAvatarColor(emp.name || (emp.firstName + ' ' + emp.lastName))">
                        {{ getInitials(emp.name || (emp.firstName + ' ' + emp.lastName)) }}
                      </div>
                      <div class="entity-info">
                        <span class="entity-name">{{ emp.name }}</span>
                        <span class="entity-subtext">{{ emp.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-tag" style="background: var(--color-gray-100); color: var(--color-gray-700); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 500;">
                      {{ emp.role?.name || (emp.roles && emp.roles.length > 0 ? emp.roles[0].name : 'N/A') }}
                    </span>
                  </td>
                  <td>{{ getBranchName(emp.branchId) }}</td>
                  <td>
                    <span class="badge-status" [ngClass]="(emp.status || '').toLowerCase() === 'active' ? 'success' : 'gray'">
                      {{ emp.status || 'Unknown' }}
                    </span>
                  </td>
                  <td>
                    <div class="task-count" style="display: flex; align-items: center; gap: 4px; font-size: 0.8125rem; color: var(--color-gray-600);">
                      <span class="material-icons" style="font-size: 16px; color: var(--color-gray-400);">check_circle_outline</span>
                      {{ emp.taskCount || 0 }} Active
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div class="action-btns" (click)="$event.stopPropagation()">
                      <button class="btn-icon" (click)="viewDetails(emp)" title="View Details"><span class="material-icons">visibility</span></button>
                      <ng-container *ngIf="!isAdmin(emp)">
                        <button class="btn-icon" (click)="openEditModal(emp)"><span class="material-icons">edit</span></button>
                        <button class="btn-icon" (click)="toggleDropdown($event, emp.id || emp.email)"><span class="material-icons">more_vert</span></button>
                        
                        <!-- Dropdown Menu -->
                        <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === (emp.id || emp.email)" (click)="$event.stopPropagation()" style="position: absolute; right: 0; top: 100%; z-index: 100; background: white; border: 1px solid var(--color-gray-200); border-radius: 8px; padding: 4px; min-width: 160px; box-shadow: var(--shadow-lg);">
                          <button class="dropdown-item" (click)="confirmDeactivate(emp); openDropdownId = null" *ngIf="emp.status !== 'INACTIVE'" style="width: 100%; text-align: left; padding: 8px 12px; display: flex; align-items: center; gap: 8px; color: #b54708; border: none; background: none; cursor: pointer; border-radius: 4px;">
                            <span class="material-icons" style="font-size: 18px;">block</span> Deactivate
                          </button>
                          <button class="dropdown-item" (click)="confirmReactivate(emp); openDropdownId = null" *ngIf="emp.status === 'INACTIVE'" style="width: 100%; text-align: left; padding: 8px 12px; display: flex; align-items: center; gap: 8px; color: #027a48; border: none; background: none; cursor: pointer; border-radius: 4px;">
                            <span class="material-icons" style="font-size: 18px;">check_circle</span> Reactivate
                          </button>
                          <button class="dropdown-item" (click)="confirmDelete(emp); openDropdownId = null" style="width: 100%; text-align: left; padding: 8px 12px; display: flex; align-items: center; gap: 8px; color: #b42318; border: none; background: none; cursor: pointer; border-radius: 4px;">
                            <span class="material-icons" style="font-size: 18px;">delete_outline</span> Delete
                          </button>
                        </div>
                      </ng-container>
                      <ng-container *ngIf="isAdmin(emp)">
                        <span class="material-icons" style="color: var(--color-gray-400); font-size: 1.25rem; opacity: 0.5;" title="Admin accounts cannot be modified">admin_panel_settings</span>
                      </ng-container>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="table-card-footer" style="padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-gray-200);">
            <button class="pagination-btn" [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)">
              <span class="material-icons">arrow_back</span>
              Previous
            </button>
            
            <div class="pagination-pages" style="display: flex; gap: 4px;">
              <button class="page-num" [class.active]="currentPage === 0" (click)="changePage(0)">1</button>
              <button *ngIf="totalPages > 1" class="page-num" [class.active]="currentPage === 1" (click)="changePage(1)">2</button>
              <button *ngIf="totalPages > 2" class="page-num" [class.active]="currentPage === 2" (click)="changePage(2)">3</button>
            </div>

            <button class="pagination-btn" [disabled]="currentPage >= totalPages - 1" (click)="changePage(currentPage + 1)">
              Next
              <span class="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Grid View -->
        <div class="grid-container" *ngIf="employees.length > 0 && viewMode === 'grid'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
          <div class="table-card" *ngFor="let emp of employees | slice:0:displayedCardsCount" style="padding: 1.25rem; transition: all 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
              <div class="entity-meta">
                <div class="avatar-circle" [style.background]="getAvatarColor(emp.name || (emp.firstName + ' ' + emp.lastName))">
                  {{ getInitials(emp.name || (emp.firstName + ' ' + emp.lastName)) }}
                </div>
                <div class="entity-info">
                  <span class="entity-name">{{ emp.name }}</span>
                  <span class="entity-subtext">{{ emp.role?.name || (emp.roles && emp.roles.length > 0 ? emp.roles[0].name : 'N/A') }}</span>
                </div>
              </div>
              <span class="badge-status" [ngClass]="(emp.status || '').toLowerCase() === 'active' ? 'success' : 'gray'">
                {{ emp.status || 'Unknown' }}
              </span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: var(--color-gray-50); border-radius: 8px;">
              <div class="entity-info">
                <span class="entity-subtext">Tasks</span>
                <span class="entity-name" style="font-size: 0.8125rem;">{{ emp.taskCount || 0 }} Active</span>
              </div>
              <div class="entity-info">
                <span class="entity-subtext">Branch</span>
                <span class="entity-name" style="font-size: 0.8125rem;">{{ getBranchName(emp.branchId) }}</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
              <span class="entity-subtext" style="font-size: 0.75rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">{{ emp.email }}</span>
              <div class="action-btns" (click)="$event.stopPropagation()">
                <button class="btn-icon" (click)="viewDetails(emp)"><span class="material-icons">visibility</span></button>
                <button class="btn-icon" (click)="toggleDropdown($event, emp.id || emp.email)"><span class="material-icons">more_vert</span></button>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div *ngIf="employees.length > displayedCardsCount" style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 1rem;">
            <button class="btn btn-secondary" (click)="loadMoreCards()">
              <span>Load More Employees</span>
              <span class="material-icons">expand_more</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Add Employee Modal -->
      <div class="modal-overlay" *ngIf="showAddModal" (click)="closeAddModal()">
        <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 540px;">
          <div class="modal-header">
            <div class="modal-header-icon" style="background: var(--color-primary-light); color: var(--color-primary); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span class="material-icons">{{ isEditMode ? 'edit' : 'person_add' }}</span>
            </div>
            <div class="modal-header-text" style="flex: 1; padding-left: 1rem;">
              <h2 class="modal-title" style="margin: 0; font-size: 1.25rem;">{{ isEditMode ? 'Edit Employee' : 'Add New Employee' }}</h2>
              <p class="modal-subtitle" style="margin: 0.25rem 0 0; color: var(--color-gray-500); font-size: 0.875rem;">{{ isEditMode ? 'Update employee details and assignments.' : 'Enter details for the new employee.' }}</p>
            </div>
            <button class="btn-icon" (click)="closeAddModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="modal-body" style="padding: 1.5rem;">
            <form [formGroup]="employeeForm" (ngSubmit)="onSubmitEmployee()">
              <div class="form-row" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group" style="flex: 1;">
                  <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">First Name</label>
                  <input type="text" class="form-control" formControlName="firstName" placeholder="e.g., John">
                </div>
                <div class="form-group" style="flex: 1;">
                  <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Last Name</label>
                  <input type="text" class="form-control" formControlName="lastName" placeholder="e.g., Smith">
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Email Address</label>
                <input type="email" class="form-control" formControlName="email" placeholder="john.smith@company.com" [readonly]="isEditMode">
              </div>

              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Phone Number</label>
                <div style="display: flex; border: 1px solid var(--color-gray-300); border-radius: 8px; overflow: hidden;">
                  <div style="padding: 0 12px; background: var(--color-gray-50); display: flex; align-items: center; border-right: 1px solid var(--color-gray-300); cursor: pointer;" (click)="toggleCountryDropdown($event)">
                    <img *ngIf="selectedCountry?.flagUrl" [src]="selectedCountry?.flagUrl" style="width: 20px; height: 14px; margin-right: 6px;">
                    <span style="font-size: 0.875rem; font-weight: 500;">{{ selectedCountry?.mobileCode || '+91' }}</span>
                  </div>
                  <input type="text" class="form-control" style="border: none;" formControlName="phone" placeholder="Phone number">
                </div>
              </div>

              <div class="form-row" style="display: flex; gap: 1rem;">
                <div class="form-group" style="flex: 1;">
                  <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Role</label>
                  <select class="form-control" formControlName="roleId">
                    <option value="" disabled>Select Role</option>
                    <option *ngFor="let role of roles" [value]="role.id">{{ role.displayName || role.name }}</option>
                  </select>
                </div>
                <div class="form-group" style="flex: 1;">
                  <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Branch</label>
                  <select class="form-control" formControlName="branchId">
                    <option value="" disabled>Select Branch</option>
                    <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
                  </select>
                </div>
              </div>

              <div class="modal-footer" style="margin-top: 2rem; display: flex; justify-content: flex-end; gap: 12px;">
                <button type="button" class="btn btn-secondary" (click)="closeAddModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="employeeForm.invalid || submitting">
                  {{ isEditMode ? 'Save Changes' : 'Create Employee' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Employee Detail Modal -->
      <div class="modal-overlay" *ngIf="showDetailModal" (click)="closeDetailModal()">
        <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 600px;">
          <div class="modal-header" style="background: linear-gradient(135deg, #667cb0 0%, #4a5d8a 100%); color: white; padding: 2.5rem;">
            <div style="display: flex; align-items: center; gap: 1.5rem; width: 100%;">
              <div class="avatar-circle" style="width: 64px; height: 64px; font-size: 1.5rem; background: rgba(255,255,255,0.2); border: 2px solid white;">
                {{ getInitials(selectedEmployee?.name) }}
              </div>
              <div>
                <h2 style="margin: 0; color: white; font-size: 1.5rem;">{{ selectedEmployee?.name }}</h2>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <span style="background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem;">{{ selectedEmployee?.role?.name }}</span>
                  <span style="background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem;">{{ selectedEmployee?.status }}</span>
                </div>
              </div>
            </div>
            <button class="btn-icon" (click)="closeDetailModal()" style="color: white; position: absolute; top: 1.5rem; right: 1.5rem;">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="modal-body" style="padding: 2rem; background: #fcfcfd;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
              <div class="entity-info">
                <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Email</span>
                <span class="entity-name" style="margin-top: 4px;">{{ selectedEmployee?.email }}</span>
              </div>
              <div class="entity-info">
                <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Phone</span>
                <span class="entity-name" style="margin-top: 4px;">{{ selectedEmployee?.phone || 'N/A' }}</span>
              </div>
              <div class="entity-info">
                <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Branch</span>
                <span class="entity-name" style="margin-top: 4px;">{{ getBranchName(selectedEmployee?.branchId || 0) }}</span>
              </div>
              <div class="entity-info">
                <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Active Tasks</span>
                <span class="entity-name" style="margin-top: 4px;">{{ selectedEmployee?.taskCount || 0 }}</span>
              </div>
            </div>
          </div>
          
          <div class="modal-footer" style="padding: 1.5rem; display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" (click)="closeDetailModal()">Close</button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showConfirmModal" (click)="closeConfirmModal()">
        <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 400px; padding: 2rem; text-align: center;">
          <div [style.background]="confirmModalBtnClass === 'btn-danger' ? '#fee4e2' : (confirmModalBtnClass === 'btn-warning' ? '#fef0c7' : '#d1fadf')" 
               [style.color]="confirmModalBtnClass === 'btn-danger' ? '#d92d20' : (confirmModalBtnClass === 'btn-warning' ? '#dc6803' : '#039855')" 
               style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
            <span class="material-icons">{{ confirmModalBtnClass === 'btn-danger' ? 'delete_forever' : (confirmModalBtnClass === 'btn-warning' ? 'pause_circle' : 'play_circle') }}</span>
          </div>
          <h2 style="margin: 0 0 0.5rem; font-size: 1.125rem;">{{ confirmModalTitle }}</h2>
          <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-bottom: 2rem;">{{ confirmModalMessage }}</p>
          <div style="display: flex; gap: 12px;">
            <button class="btn btn-secondary" style="flex: 1;" (click)="closeConfirmModal()">Cancel</button>
            <button class="btn btn-primary" style="flex: 1;" [ngClass]="confirmModalBtnClass" (click)="executeConfirmAction()" [disabled]="processingAction">{{ confirmModalBtnText }}</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class EmployeeListComponent implements OnInit {
  private branchService = inject(BranchService);
  private roleService = inject(RoleService);
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);
  public loadingService = inject(LoadingService);
  private countryService = inject(CountryService);
  private fb = inject(FormBuilder);

  employeeForm: FormGroup;
  countryCodes: CountryMobileCode[] = [];
  selectedCountry: CountryMobileCode | null = null;
  isCountryDropdownOpen = false;

  showAddModal = false;
  submitting = false;
  isLoading = true;
  isEditMode = false;
  editingEmployeeId: string | number | null = null;
  selectedEmployee: Employee | null = null;
  showDetailModal = false;
  constructor() {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dialCode: ['+91', Validators.required],
      phone: ['', Validators.required],
      roleId: ['', Validators.required],
      branchId: ['', Validators.required]
    });
  }

  searchQuery = '';
  filterRole = '';
  filterBranch = '';
  branches: Branch[] = [];
  roles: Role[] = [];
  employees: Employee[] = [];
  viewMode: 'list' | 'grid' = 'list';
  showAdvancedFilters = false;

  resetFilters() {
    this.searchQuery = '';
    this.filterRole = '';
    this.filterBranch = '';
    this.currentPage = 0;
    this.loadEmployees();
  }

  displayedCardsCount = 10;

  // Pagination states
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math; // To expose Math utility to template

  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.loadBranches();
    this.loadRoles();
    this.loadEmployees();
    this.loadCountryCodes();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadEmployees();
    });
  }

  loadMoreCards() {
    this.displayedCardsCount += 10;
  }

  isAdmin(emp: Employee): boolean {
    return !!(emp.role?.name === 'ADMIN' || (emp.roles && emp.roles.length > 0 && emp.roles.some(r => r.name === 'ADMIN')));
  }

  viewDetails(emp: Employee) {
    this.selectedEmployee = emp;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedEmployee = null;
  }

  getBranchName(branchId: number): string {
    if (!branchId) return 'N/A';
    const branch = this.branches.find(b => b.id === branchId || (b.id && b.id.toString() === branchId.toString()));
    return branch ? branch.name : 'N/A';
  }

  loadCountryCodes() {
    this.countryService.getMobileCountryCodes().subscribe({
      next: (data) => {
        this.countryCodes = data;
        if (this.countryCodes.length > 0) {
          // Find India as default or first one
          const india = this.countryCodes.find(c => c.countryCode === 'IN' || c.mobileCode === '+91');
          this.selectCountry(india || this.countryCodes[0], new Event('init'));
        }
      },
      error: (err) => console.error('Failed to load country codes', err)
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isCountryDropdownOpen = false;
    }
    // Close action dropdowns when clicking outside
    this.openDropdownId = null;
  }

  toggleCountryDropdown(event: Event) {
    event.stopPropagation();
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }

  selectCountry(country: CountryMobileCode, event: Event) {
    if (event.type !== 'init') event.stopPropagation();
    this.selectedCountry = country;
    this.employeeForm.get('dialCode')?.setValue(country.mobileCode);
    this.isCountryDropdownOpen = false;
    this.updatePhoneValidation();
  }

  updatePhoneValidation() {
    const phoneControl = this.employeeForm.get('phone');
    if (!phoneControl || !this.selectedCountry || !this.selectedCountry.mobileNumberLength) return;

    const length = this.selectedCountry.mobileNumberLength;
    phoneControl.setValidators([
      Validators.required,
      Validators.minLength(length),
      Validators.maxLength(length),
      Validators.pattern('^[0-9]*$')
    ]);
    phoneControl.updateValueAndValidity();
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

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadEmployees();
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadEmployees();
    }
  }

  loadEmployees() {
    console.log(`Loading employees... Page: ${this.currentPage}, Query: ${this.searchQuery}, Role: ${this.filterRole}, Branch: ${this.filterBranch}`);

    this.loadingService.withLoading(
      () => this.employeeService.getAllEmployees(
        this.currentPage,
        this.pageSize,
        this.searchQuery,
        this.filterRole,
        this.filterBranch
      ).toPromise(),
      'Loading employees...',
      'dot-circle',
      'md'
    ).then((data: any) => {
      console.log('Employees paginated response received:', data);
      this.isLoading = false;

      let fetchedEmployees = data?.content || [];
      // Client-side sort to ensure ADMIN roles always appear at the top of the current page
      fetchedEmployees.sort((a: Employee, b: Employee) => {
        const aIsAdmin = this.isAdmin(a) ? 1 : 0;
        const bIsAdmin = this.isAdmin(b) ? 1 : 0;
        return bIsAdmin - aIsAdmin;
      });

      this.employees = fetchedEmployees;
      this.totalElements = data?.totalElements || 0;
      this.totalPages = data?.totalPages || 0;

      if (this.employees.length === 0 && this.currentPage === 0) {
        console.log('No employees found matching criteria');
      }
    }).catch((err: any) => {
      console.error('Failed to load employees', err);
      this.isLoading = false;
      this.employees = [];
    });
  }


  loadBranches() {
    this.branchService.getAllBranches().subscribe({
      next: (data) => {
        const forbidden = ['COMPANY', 'REFERRAL', 'REFERAL'];
        this.branches = data.filter(branch =>
          !forbidden.includes(branch.name.toUpperCase())
        );
      },
      error: (err) => {
        console.error('Failed to load branches', err);
      }
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        const forbidden = ['COMPANY', 'REFERRAL', 'REFERAL'];
        this.roles = data.filter(role =>
          !forbidden.includes(role.name.toUpperCase())
        );
      },
      error: (err) => {
        console.error('Failed to load roles', err);
      }
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.editingEmployeeId = null;
    this.employeeForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      dialCode: this.selectedCountry?.mobileCode || '+91',
      phone: '',
      roleId: '',
      branchId: ''
    });
    this.showAddModal = true;
  }

  openEditModal(employee: Employee) {
    this.isEditMode = true;
    this.editingEmployeeId = employee.id || null;

    // Extract dial code and phone
    let dialCode = '+91';
    let phone = employee.phone || '';

    // Try to match dial code from the phone string
    if (phone.startsWith('+')) {
      const matchedCountry = this.countryCodes.find(c => phone.startsWith(c.mobileCode));
      if (matchedCountry) {
        dialCode = matchedCountry.mobileCode;
        phone = phone.substring(dialCode.length);
        this.selectedCountry = matchedCountry;
      }
    }

    this.employeeForm.patchValue({
      firstName: employee.firstName || employee.name?.split(' ')[0] || '',
      lastName: employee.lastName || employee.name?.split(' ').slice(1).join(' ') || '',
      email: employee.email,
      dialCode: dialCode,
      phone: phone,
      roleId: employee.roleId || (employee.role?.id) || (employee.roles && employee.roles.length > 0 ? employee.roles[0].id : ''),
      branchId: employee.branchId
    });

    this.updatePhoneValidation();
    this.showAddModal = true;
    this.openDropdownId = null;
  }

  closeAddModal() {
    if (this.submitting) return;
    this.showAddModal = false;
    this.employeeForm.reset();
  }

  onSubmitEmployee() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.employeeForm.value;

    const employeeData: Partial<Employee> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      name: `${formValue.firstName} ${formValue.lastName}`,
      email: formValue.email,
      phone: `${formValue.dialCode}${formValue.phone}`,
      mobileCountryCodeId: this.selectedCountry?.id,
      branchId: Number(formValue.branchId),
      roleId: Number(formValue.roleId)
    };

    if (this.isEditMode && this.editingEmployeeId) {
      this.employeeService.updateEmployee(this.editingEmployeeId, employeeData).subscribe({
        next: () => {
          this.submitting = false;
          this.showAddModal = false;
          this.loadEmployees();
          this.notificationService.showModal(
            'Employee Updated',
            'Employee details have been successfully updated.',
            undefined,
            'success'
          );
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(err.message || 'Failed to update employee');
        }
      });
    } else {
      this.employeeService.createEmployee(employeeData).subscribe({
        next: () => {
          this.submitting = false;
          this.showAddModal = false;
          this.loadEmployees();
          this.notificationService.showModal(
            'Employee Created',
            'A new employee account has been created. Credentials have been shared to their email.',
            'Please ask the employee to check their inbox (and spam folder) for their login details.',
            'success'
          );
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(err.message || 'Failed to create employee');
        }
      });
    }
  }

  private finalizeSubmit() {
    this.submitting = false;
    this.showAddModal = false;
    this.loadEmployees();
  }

  // --- Confirmation Actions API ---

  openDropdownId: string | number | null = null;
  showConfirmModal = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalBtnText = '';
  confirmModalBtnClass = '';
  confirmTargetEmployee: Employee | null = null;
  confirmActionType: 'deactivate' | 'reactivate' | 'delete' | null = null;
  processingAction = false;

  toggleDropdown(event: Event, id: string | number | undefined) {
    if (event) event.stopPropagation();
    if (!id) return;
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.openDropdownId = null;
  }

  confirmDeactivate(emp: Employee) {
    this.confirmTargetEmployee = emp;
    this.confirmActionType = 'deactivate';
    this.confirmModalTitle = 'Deactivate Employee';
    this.confirmModalMessage = `Are you sure you want to deactivate ${emp.name}? This will prevent them from logging in, but their data will remain intact.`;
    this.confirmModalBtnText = 'Deactivate';
    this.confirmModalBtnClass = 'btn-warning';
    this.showConfirmModal = true;
  }

  confirmReactivate(emp: Employee) {
    this.confirmTargetEmployee = emp;
    this.confirmActionType = 'reactivate';
    this.confirmModalTitle = 'Reactivate Employee';
    this.confirmModalMessage = `Are you sure you want to reactivate ${emp.name}? They will regain access to log in to their account.`;
    this.confirmModalBtnText = 'Reactivate';
    this.confirmModalBtnClass = 'btn-success';
    this.showConfirmModal = true;
  }

  confirmDelete(emp: Employee) {
    this.confirmTargetEmployee = emp;
    this.confirmActionType = 'delete';
    this.confirmModalTitle = 'Delete Employee';
    this.confirmModalMessage = `Are you sure you want to permanently delete ${emp.name}? This action cannot be undone.`;
    this.confirmModalBtnText = 'Delete';
    this.confirmModalBtnClass = 'btn-danger';
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    if (this.processingAction) return;
    this.showConfirmModal = false;
    this.confirmTargetEmployee = null;
    this.confirmActionType = null;
  }

  executeConfirmAction() {
    if (!this.confirmTargetEmployee || !this.confirmTargetEmployee.id) return;

    this.processingAction = true;

    if (this.confirmActionType === 'deactivate') {
      this.employeeService.deactivateEmployee(this.confirmTargetEmployee.id).subscribe({
        next: () => {
          this.notificationService.success('Employee deactivated successfully');
          this.processingAction = false;
          this.closeConfirmModal();
          this.loadEmployees();
        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Failed to deactivate employee');
          this.processingAction = false;
        }
      });
    } else if (this.confirmActionType === 'reactivate') {
      this.employeeService.reactivateEmployee(this.confirmTargetEmployee.id).subscribe({
        next: () => {
          this.notificationService.success('Employee reactivated successfully');
          this.processingAction = false;
          this.closeConfirmModal();
          this.loadEmployees();
        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Failed to reactivate employee');
          this.processingAction = false;
        }
      });
    } else if (this.confirmActionType === 'delete') {
      this.employeeService.deleteEmployee(this.confirmTargetEmployee.id).subscribe({
        next: () => {
          this.notificationService.success('Employee deleted successfully');
          this.processingAction = false;
          this.closeConfirmModal();
          this.loadEmployees();
        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Failed to delete employee');
          this.processingAction = false;
        }
      });
    }
  }
}
