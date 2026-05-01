import { Component, inject, OnInit, HostListener } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../core/models/branch.model';
import { RoleService } from '../../../../core/services/role.service';
import { Role } from '../../../../core/services/role.service';
import { EmployeeService, Employee } from '../../../../core/services/employee.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingService } from '../../../../core/services/loading.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">Employee Management</h1>
          <p class="page-subtitle">Manage your team, roles, and branch assignments.</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher mr-3">
            <button class="switcher-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="List View">
              <span class="material-icons">list</span>
            </button>
            <button class="switcher-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Card View">
              <span class="material-icons">grid_view</span>
            </button>
          </div>
          <button class="btn btn-primary" (click)="openAddModal()">
            <span class="material-icons">add</span>
            Add Employee
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
          <select class="filter-select" [(ngModel)]="filterBranch" (change)="onFilterChange()">
            <option value="">All Branches</option>
            <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
          </select>
          <button class="btn-icon btn-reset" (click)="resetFilters()" title="Reset Filters">
            <span class="material-icons">refresh</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container shadow-premium" *ngIf="isLoading">
        <div class="spinner-container">
          <div class="loading-spinner"></div>
        </div>
        <p>Loading employees...</p>
      </div>

      <!-- Main Content Container -->
      <div *ngIf="!isLoading">
        
        <div class="empty-state-container" *ngIf="employees.length === 0">
          <div class="empty-state-content">
            <span class="material-icons empty-icon">badge</span>
            <h3>No Employees Found</h3>
            <p>There are currently no employees configured. Add your first employee to get started.</p>
          </div>
        </div>

        <!-- Employee Table Card -->
        <div class="table-card" *ngIf="employees.length > 0 && viewMode === 'list'">
          <div class="table-card-header">
            <div class="table-header-title">
              <h2>Team members</h2>
              <span class="count-badge">{{ totalElements }} users</span>
            </div>
            <button class="btn-icon">
              <span class="material-icons">more_vert</span>
            </button>
          </div>

          <div style="overflow-x: auto;">
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
                <tr *ngFor="let emp of employees" class="clickable-row">
                  <td>
                    <div class="user-info">
                      <div class="avatar">{{ emp.name.charAt(0) }}</div>
                      <div class="details">
                        <span class="name">{{ emp.name }}</span>
                        <span class="email">{{ emp.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-tag">{{ emp.role?.name || (emp.roles && emp.roles.length > 0 ? emp.roles[0].name : 'N/A') }}</span>
                  </td>
                  <td>{{ getBranchName(emp.branchId) }}</td>
                  <td>
                    <span class="status-dot-wrap" [ngClass]="(emp.status || '').toLowerCase()">
                      <span class="status-dot"></span>
                      {{ emp.status || 'Unknown' }}
                    </span>
                  </td>
                  <td>
                    <div class="task-count">
                      <span class="material-icons">check_circle_outline</span>
                      {{ emp.taskCount || 0 }} Active
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div class="action-btns" style="position: relative;">
                      <ng-container *ngIf="!isAdmin(emp)">
                        <button class="btn-icon" (click)="openEditModal(emp)"><span class="material-icons">edit</span></button>
                        <button class="btn-icon" (click)="toggleDropdown($event, emp.id || emp.email)"><span class="material-icons">more_vert</span></button>
                        
                        <!-- Dropdown Menu -->
                        <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === (emp.id || emp.email)" (click)="$event.stopPropagation()">
                          <button class="dropdown-item warning" (click)="confirmDeactivate(emp); openDropdownId = null; $event.stopPropagation()" *ngIf="emp.status !== 'INACTIVE'">
                            <span class="material-icons">block</span> Deactivate
                          </button>
                          <button class="dropdown-item success" (click)="confirmReactivate(emp); openDropdownId = null; $event.stopPropagation()" *ngIf="emp.status === 'INACTIVE'">
                            <span class="material-icons">check_circle</span> Reactivate
                          </button>
                          <button class="dropdown-item danger" (click)="confirmDelete(emp); openDropdownId = null; $event.stopPropagation()">
                            <span class="material-icons">delete_outline</span> Delete
                          </button>
                        </div>
                      </ng-container>
                      <ng-container *ngIf="isAdmin(emp)">
                        <span class="material-icons" style="color: var(--dash-text-muted); font-size: 1.25rem; opacity: 0.5; padding: 0.375rem;" title="Admin accounts cannot be modified">admin_panel_settings</span>
                      </ng-container>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="table-card-footer">
            <button class="pagination-btn" [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)">
              <span class="material-icons">arrow_back</span>
              Previous
            </button>
            
            <div class="pagination-pages">
              <button class="page-num" [class.active]="currentPage === 0" (click)="changePage(0)">1</button>
              <button *ngIf="totalPages > 1" class="page-num" [class.active]="currentPage === 1" (click)="changePage(1)">2</button>
              <button *ngIf="totalPages > 2" class="page-num" [class.active]="currentPage === 2" (click)="changePage(2)">3</button>
              <button *ngIf="totalPages > 4" class="page-num" [class.active]="currentPage === totalPages - 1" (click)="changePage(totalPages - 1)">{{ totalPages }}</button>
            </div>

            <button class="pagination-btn" [disabled]="currentPage >= totalPages - 1" (click)="changePage(currentPage + 1)">
              Next
              <span class="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Employee Grid View (Premium Cards) -->
        <div class="grid-container-wrapper" *ngIf="employees.length > 0 && viewMode === 'grid'">
          <div class="grid-container">
            <div class="employee-card shadow-premium" *ngFor="let emp of employees | slice:0:displayedCardsCount">
              <div class="card-header">
                <div class="user-info-grid">
                  <div class="avatar">{{ emp.name.charAt(0) }}</div>
                  <div class="details">
                    <span class="name">{{ emp.name }}</span>
                    <span class="role-tag">{{ emp.role?.name || (emp.roles && emp.roles.length > 0 ? emp.roles[0].name : 'N/A') }}</span>
                  </div>
                </div>
                <div class="status-dot-wrap" [ngClass]="(emp.status || '').toLowerCase()">
                  <span class="status-dot"></span>
                  {{ emp.status || 'Unknown' }}
                </div>
              </div>
              
              <div class="card-body">
                <div class="metrics-grid">
                  <div class="metric-box">
                    <span class="label">Active Tasks</span>
                    <span class="value">{{ emp.taskCount || 0 }}</span>
                  </div>
                  <div class="metric-box">
                    <span class="label">Assigned Branch</span>
                    <span class="value">{{ getBranchName(emp.branchId) }}</span>
                  </div>
                </div>
                
                <div class="location-item">
                  <span class="material-icons">email</span>
                  <span class="text">{{ emp.email }}</span>
                </div>
              </div>
              
              <div class="card-footer">
                <div class="action-btns" style="position: relative; width: 100%; display: flex; justify-content: flex-end; gap: 0.5rem;">
                  <ng-container *ngIf="!isAdmin(emp)">
                    <button class="footer-action" (click)="openEditModal(emp)" title="Edit Employee">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="footer-action" (click)="toggleDropdown($event, emp.id || emp.email)" title="More Options">
                      <span class="material-icons">more_vert</span>
                    </button>
                    
                    <!-- Dropdown Menu -->
                    <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === (emp.id || emp.email)" (click)="$event.stopPropagation()">
                      <button class="dropdown-item warning" (click)="confirmDeactivate(emp); openDropdownId = null; $event.stopPropagation()" *ngIf="emp.status !== 'INACTIVE'">
                        <span class="material-icons">block</span> Deactivate
                      </button>
                      <button class="dropdown-item success" (click)="confirmReactivate(emp); openDropdownId = null; $event.stopPropagation()" *ngIf="emp.status === 'INACTIVE'">
                        <span class="material-icons">check_circle</span> Reactivate
                      </button>
                      <button class="dropdown-item danger" (click)="confirmDelete(emp); openDropdownId = null; $event.stopPropagation()">
                        <span class="material-icons">delete_outline</span> Delete
                      </button>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="isAdmin(emp)">
                    <span class="material-icons" style="color: var(--dash-text-muted); font-size: 1.25rem; opacity: 0.5; padding: 0.375rem;" title="Admin accounts cannot be modified">admin_panel_settings</span>
                  </ng-container>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Button -->
          <div class="load-more-container" *ngIf="employees.length > displayedCardsCount">
            <button class="btn btn-secondary load-more-btn" (click)="loadMoreCards()">
              <span>Load More Employees</span>
              <span class="material-icons">expand_more</span>
            </button>
          </div>
        </div>

      <!-- Add Employee Modal -->
      <div class="modal-overlay" *ngIf="showAddModal" (click)="closeAddModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">{{ isEditMode ? 'Edit Employee' : 'Add New Employee' }}</h2>
            <button class="close-btn" (click)="closeAddModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="modal-body">
            <p class="modal-subtitle">{{ isEditMode ? 'Update employee details and assignments.' : 'Enter details for the new employee.' }}</p>
            
            <form #employeeForm="ngForm" (ngSubmit)="onSubmitEmployee()">
              <div class="form-group" style="display: flex; gap: 1rem;">
                <div style="flex: 1;">
                  <label for="empFirstName">First Name <span class="text-error">*</span></label>
                  <input type="text" id="empFirstName" name="firstName" class="form-control" [(ngModel)]="newEmployee.firstName" placeholder="e.g., John" required>
                </div>
                <div style="flex: 1;">
                  <label for="empLastName">Last Name <span class="text-error">*</span></label>
                  <input type="text" id="empLastName" name="lastName" class="form-control" [(ngModel)]="newEmployee.lastName" placeholder="e.g., Smith" required>
                </div>
              </div>

              <div class="form-group">
                <label for="empEmail">Email Address</label>
                <input type="email" id="empEmail" name="email" class="form-control" [(ngModel)]="newEmployee.email" placeholder="e.g., john.smith@company.com" required [readonly]="isEditMode" [class.readonly-field]="isEditMode">
              </div>

              <div class="form-group">
                <label for="empPhone">Phone Number</label>
                <input type="text" id="empPhone" name="phone" class="form-control" [(ngModel)]="newEmployee.phone" placeholder="e.g., +1234567890" required>
              </div>

              <div class="form-group">
                <label for="empRole">Role</label>
                <select id="empRole" name="roleId" class="form-control" [(ngModel)]="newEmployee.roleId" required>
                  <option value="" disabled selected>Select Role</option>
                  <option *ngFor="let role of roles" [value]="role.id">{{ role.displayName || role.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="empBranch">Branch</label>
                <select id="empBranch" name="branchId" class="form-control" [(ngModel)]="newEmployee.branchId" required>
                  <option value="" disabled selected>Select Branch</option>
                  <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
                </select>
              </div>

              <div class="modal-footer">
                <button type="submit" class="btn btn-primary btn-block" [disabled]="employeeForm.invalid || submitting">
                  <span *ngIf="!submitting">{{ isEditMode ? 'Save Changes' : 'Create Employee' }}</span>
                  <span *ngIf="submitting">Processing...</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showConfirmModal" (click)="closeConfirmModal()">
        <div class="modal-content confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-body text-center" style="padding-top: 2.5rem;">
            <div class="confirm-icon-wrap" [ngClass]="confirmModalBtnClass">
              <span class="material-icons">
                {{ confirmActionType === 'delete' ? 'delete_forever' : 
                   (confirmActionType === 'deactivate' ? 'pause_circle' : 'play_circle') }}
              </span>
            </div>
            <h2 class="modal-title mb-2">{{ confirmModalTitle }}</h2>
            <p class="text-muted mb-4">{{ confirmModalMessage }}</p>
            
            <div class="modal-footer" style="padding: 0; margin-top: 2rem;">
              <button type="button" class="btn btn-block" [ngClass]="confirmModalBtnClass" (click)="executeConfirmAction()" [disabled]="processingAction">
                <span *ngIf="!processingAction">{{ confirmModalBtnText }}</span>
                <span *ngIf="processingAction">Processing...</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .module-container { padding-bottom: 2rem; }
    .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .page-subtitle { color: var(--color-gray-600); margin: 0.25rem 0 0; font-size: 1rem; }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }

    /* View Switcher */
    .view-switcher { display: flex; background: var(--color-gray-100); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-200); }
    .switcher-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--color-gray-500); cursor: pointer; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
    .switcher-btn .material-icons { font-size: 20px; }
    .switcher-btn:hover { color: var(--color-gray-700); }
    .switcher-btn.active { background: white; color: var(--color-gray-700); box-shadow: var(--shadow-sm); }

    /* Filters */
    .filters-card { background: white; padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; box-shadow: var(--shadow-xs); }
    .search-bar { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid var(--color-gray-300); padding: 0.625rem 0.875rem; border-radius: var(--radius-md); flex: 1; box-shadow: var(--shadow-xs); transition: all var(--transition-fast); }
    .search-bar:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-light); }
    .search-bar input { background: none; border: none; width: 100%; font-size: 0.95rem; color: var(--color-gray-900); outline: none; }
    .search-bar .material-icons { color: var(--color-gray-400); font-size: 20px; }
    
    .filter-actions { display: flex; gap: 0.75rem; align-items: center; }
    .filter-select { background: white; border: 1px solid var(--color-gray-300); padding: 0.625rem 0.875rem; border-radius: var(--radius-md); cursor: pointer; color: var(--color-gray-700); font-weight: 500; font-size: 0.875rem; outline: none; box-shadow: var(--shadow-xs); transition: all var(--transition-fast); }
    .filter-select:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-light); }

    /* Table & Grid */
    .table-container { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); overflow: hidden; box-shadow: var(--shadow-sm); }
    .premium-table { width: 100%; border-collapse: collapse; table-layout: auto; }
    .premium-table th { text-align: center !important; padding: 0.75rem 1.5rem; font-size: 0.725rem; font-weight: 600; color: var(--color-gray-600); background: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-200); white-space: nowrap; }
    .premium-table td { text-align: center !important; padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-gray-200); font-size: 0.875rem; vertical-align: middle; color: var(--color-gray-600); }
    
    /* Standard padding for first and last columns */
    .premium-table th:first-child, .premium-table td:first-child { padding-left: 1.5rem; }
    .premium-table th:last-child, .premium-table td:last-child { padding-right: 1.5rem; }
    
    .user-info { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; text-align: center; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; border: 1px solid var(--color-primary-border); flex-shrink: 0; }
    .details { display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.3; }
    .name { font-weight: 600; color: var(--color-gray-900); font-size: 0.875rem; margin-bottom: 2px; }
    .email { font-size: 0.75rem; color: var(--color-gray-500); }
    
    .role-tag { background: var(--color-gray-100); color: var(--color-gray-700); padding: 0.125rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; border: 1px solid var(--color-gray-200); }
    
    .status-dot-wrap { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 500; padding: 0.125rem 0.5rem; border-radius: 6px; width: fit-content; text-transform: capitalize; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; }
    .status-dot-wrap.active { background: #ecfdf3; color: #027a48; border: 1px solid #abefc6; }
    .status-dot-wrap.active .status-dot { background: #12b76a; }
    .status-dot-wrap.inactive { background: var(--color-gray-100); color: var(--color-gray-700); border: 1px solid var(--color-gray-200); }
    .status-dot-wrap.inactive .status-dot { background: var(--color-gray-500); }
    
    .task-count { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--color-gray-600); }
    .task-count .material-icons { font-size: 16px; color: var(--color-gray-400); }

    .action-btns { display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem; }
    .btn-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: none; background: transparent; color: var(--color-gray-400); cursor: pointer; transition: all 0.2s; }
    .btn-icon:hover { background: var(--color-gray-100); color: var(--color-gray-700); }
    .btn-icon .material-icons { font-size: 18px; }

    /* Grid View Styles */
    .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; width: 100%; }
    .employee-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); overflow: hidden; display: flex; flex-direction: column; transition: all var(--transition-fast); position: relative; box-shadow: var(--shadow-sm); }
    .employee-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    
    .card-header { padding: 1.25rem; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--color-gray-100); }
    .card-body { padding: 1.25rem; flex: 1; }
    .card-footer { padding: 1rem 1.25rem; background: var(--color-gray-50); border-top: 1px solid var(--color-gray-100); display: flex; justify-content: space-between; }
    
    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: var(--radius-lg); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
    .confirm-modal { max-width: 400px; }

    /* Action Dropdown */
    .action-dropdown { position: absolute; right: 0; top: 100%; margin-top: 0.5rem; background: white; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: 0.25rem; min-width: 180px; z-index: 100; animation: fadeIn 0.2s ease-out; box-shadow: var(--shadow-lg); }
    .dropdown-item { width: 100%; text-align: left; background: none; border: none; padding: 0.625rem 1rem; font-size: 0.875rem; color: var(--color-gray-700); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
    .dropdown-item:hover { background: var(--color-gray-50); color: var(--color-gray-900); }
    .dropdown-item.warning { color: #b54708; }
    .dropdown-item.warning:hover { background: #fffaeb; color: #93370d; }
    .dropdown-item.success { color: #027a48; }
    .dropdown-item.success:hover { background: #ecfdf3; color: #026aa2; }
    .dropdown-item.danger { color: #b42318; }
    .dropdown-item.danger:hover { background: #fef3f2; color: #912018; }
    .dropdown-divider { height: 1px; background: var(--color-gray-100); margin: 0.25rem 0; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class EmployeeListComponent implements OnInit {
  private branchService = inject(BranchService);
  private roleService = inject(RoleService);
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);
  public loadingService = inject(LoadingService);

  showAddModal = false;
  submitting = false;
  isLoading = true;
  isEditMode = false;
  newEmployee: Partial<Employee> = {
    name: '',
    email: '',
    phone: '',
    branchId: undefined as unknown as number,
    roleId: undefined as unknown as number
  };

  searchQuery = '';
  filterRole = '';
  filterBranch = '';
  branches: Branch[] = [];
  roles: Role[] = [];
  employees: Employee[] = [];
  viewMode: 'list' | 'grid' = 'list';
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

  getBranchName(branchId: number): string {
    if (!branchId) return 'N/A';
    const branch = this.branches.find(b => b.id === branchId || (b.id && b.id.toString() === branchId.toString()));
    return branch ? branch.name : 'N/A';
  }

  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadEmployees();
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterRole = '';
    this.filterBranch = '';
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
      this.notificationService.error('Failed to load employees. Please try again.');
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
    this.newEmployee = { firstName: '', lastName: '', name: '', email: '', phone: '', branchId: '' as unknown as number, roleId: '' as unknown as number };
    this.showAddModal = true;
  }

  openEditModal(emp: Employee) {
    this.isEditMode = true;
    // Map the employee role to roleId if possible
    const roleId = emp.role?.id || (emp.roles && emp.roles.length > 0 ? emp.roles[0].id : (emp.roleId || ''));
    
    const nameParts = (emp.name || '').trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    this.newEmployee = { 
      id: emp.id,
      firstName: firstName,
      lastName: lastName,
      name: emp.name, 
      email: emp.email, 
      phone: emp.phone, 
      branchId: emp.branchId, 
      roleId: roleId as number
    };
    this.showAddModal = true;
    // Close dropdown if editing from it
    this.openDropdownId = null;
  }

  closeAddModal() {
    if (this.submitting) return;
    this.showAddModal = false;
  }

  onSubmitEmployee() {
    if (!this.newEmployee.firstName || !this.newEmployee.lastName || !this.newEmployee.email || !this.newEmployee.branchId || !this.newEmployee.roleId) return;

    this.submitting = true;

    const payload = {
      ...this.newEmployee,
      firstName: this.newEmployee.firstName,
      lastName: this.newEmployee.lastName
    };

    if (this.isEditMode && this.newEmployee.id) {
      this.employeeService.updateEmployee(this.newEmployee.id, payload).subscribe({
        next: () => {
          this.notificationService.success('Employee updated successfully!');
          this.finalizeSubmit();
        },
        error: (err) => {
          console.error('Failed to update employee', err);
          this.notificationService.error('Failed to update employee. Please try again.');
          this.submitting = false;
        }
      });
    } else {
      this.employeeService.createEmployee(payload).subscribe({
        next: () => {
          this.notificationService.success('Employee added successfully!');
          this.finalizeSubmit();
        },
        error: (err) => {
          console.error('Failed to create employee', err);
          this.notificationService.error('Failed to add employee. Please try again.');
          this.submitting = false;
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
