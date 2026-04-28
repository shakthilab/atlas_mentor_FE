import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../core/models/branch.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">Branch Management</h1>
          <p class="page-subtitle">Manage all your branch locations and their operational status.</p>
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
            Add Branch
          </button>
        </div>
      </div>


      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading branches...</p>
      </div>

      <div class="empty-state-container" *ngIf="!loading && branches.length === 0">
        <div class="empty-state-content">
          <span class="material-icons empty-icon">business</span>
          <h3>No Branches Found</h3>
          <p>There are currently no branches configured. Add your first branch to get started.</p>
        </div>
      </div>

      <!-- Branch Table Card View -->
      <div class="table-card desktop-view" *ngIf="!loading && branches.length > 0 && viewMode === 'list'">
        <div class="table-card-header">
          <div class="table-header-title">
            <h2>Branch locations</h2>
            <span class="count-badge">{{ branches.length }} locations</span>
          </div>
          <button class="btn-icon">
            <span class="material-icons">more_vert</span>
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="premium-table">
            <thead>
              <tr>
                <th style="width: 40px;"><input type="checkbox"></th>
                <th>Branch Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Team & Students</th>
                <th>Revenue</th>
                <th>Manager</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let branch of branches" class="clickable-row">
                <td><input type="checkbox"></td>
                <td (click)="openEditModal(branch)">
                  <div class="branch-meta">
                    <div class="branch-icon-mini">
                      <span class="material-icons">business</span>
                    </div>
                    <div class="info">
                      <span class="name">{{ branch.name }}</span>
                    </div>
                  </div>
                </td>
                <td (click)="openEditModal(branch)">
                  <span class="location-text" [title]="branch.location" style="white-space: normal; word-wrap: break-word; max-width: 200px; display: inline-block;">{{ branch.location }}</span>
                </td>
                <td (click)="openEditModal(branch)">
                  <div class="status-indicator" [class.active]="branch.status !== 'INACTIVE'">
                    <span class="status-dot"></span>
                    {{ branch.status === 'INACTIVE' ? 'Non Operational' : 'Operational' }}
                  </div>
                </td>
                <td (click)="openEditModal(branch)">
                  <div class="metrics">
                    <span class="metric"><strong>{{ branch.staffCount || 0 }}</strong> Staff</span>
                    <span class="metric"><strong>{{ branch.studentCount || 0 }}</strong> Students</span>
                  </div>
                </td>
                <td (click)="openEditModal(branch)">
                  <span class="revenue-cell">{{ (branch.revenue || 0) | currency:'USD':'symbol':'1.0-0' }}</span>
                </td>
                <td (click)="openEditModal(branch)">
                  <span class="manager-text">{{ branch.manager?.name || 'Unassigned' }}</span>
                </td>
                <td style="text-align: right;">
                  <div class="action-btns" style="position: relative;">
                    <button class="btn-icon" (click)="openEditModal(branch)" title="Edit"><span class="material-icons">edit</span></button>
                    <button class="btn-icon" (click)="toggleDropdown($event, 'row-' + branch.id)" title="More Options"><span class="material-icons">more_vert</span></button>
                    
                    <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === 'row-' + branch.id" (click)="$event.stopPropagation()">
                      <button class="dropdown-item warning" (click)="onToggleStatus(branch); openDropdownId = null" *ngIf="branch.status !== 'INACTIVE'">
                        <span class="material-icons" style="font-size: 18px;">block</span>
                        Deactivate
                      </button>
                      <button class="dropdown-item success" (click)="onToggleStatus(branch); openDropdownId = null" *ngIf="branch.status === 'INACTIVE'">
                        <span class="material-icons" style="font-size: 18px;">check_circle</span>
                        Reactivate
                      </button>
                      <div class="dropdown-divider"></div>
                      <button class="dropdown-item danger" (click)="onDeleteBranch(branch.id); openDropdownId = null">
                        <span class="material-icons" style="font-size: 18px;">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer (Static for now) -->
        <div class="table-card-footer">
          <button class="pagination-btn" disabled>
            <span class="material-icons">arrow_back</span>
            Previous
          </button>
          
          <div class="pagination-pages">
            <button class="page-num active">1</button>
          </div>

          <button class="pagination-btn" disabled>
            Next
            <span class="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>


      <!-- Branch Grid View (Premium Cards) -->
      <div class="grid-container-wrapper" *ngIf="!loading && branches.length > 0 && viewMode === 'grid'">
        <div class="grid-container">
          <div class="branch-card shadow-premium" *ngFor="let branch of branches | slice:0:displayedCardsCount">
            <div class="card-header">
              <div class="branch-icon-wrap">
                <span class="material-icons">business</span>
              </div>
              <div class="status-indicator" [class.active]="branch.status !== 'INACTIVE'">
                <span class="status-dot"></span>
                {{ branch.status === 'INACTIVE' ? 'Non Operational' : 'Operational' }}
              </div>
            </div>
            
            <div class="card-body" (click)="openEditModal(branch)">
              <h3 class="branch-card-title">{{ branch.name }}</h3>
              <div class="location-item">
                <span class="material-icons">location_on</span>
                <span class="text">{{ branch.location }}</span>
              </div>
              
              <div class="metrics-grid">
                <div class="metric-box">
                  <span class="label">Staff</span>
                  <span class="value">{{ branch.staffCount || 0 }}</span>
                </div>
                <div class="metric-box">
                  <span class="label">Students</span>
                  <span class="value">{{ branch.studentCount || 0 }}</span>
                </div>
                <div class="metric-box full">
                  <span class="label">Total Revenue</span>
                  <span class="value pr">{{ (branch.revenue || 0) | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
              </div>
              
              <div class="manager-item">
                <div class="avatar-mini">{{ (branch.manager?.name || 'U')[0] }}</div>
                <div class="mgr-info">
                  <span class="mgr-label">Manager</span>
                  <span class="mgr-name">{{ branch.manager?.name || 'Unassigned' }}</span>
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="action-btns" style="position: relative;">
                <button class="footer-action" (click)="openEditModal(branch)" title="Edit Details">
                  <span class="material-icons">edit</span>
                </button>
                <button class="footer-action" (click)="toggleDropdown($event, 'card-' + branch.id)" title="More Options">
                  <span class="material-icons">more_vert</span>
                </button>
                
                <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === 'card-' + branch.id" (click)="$event.stopPropagation()">
                  <button class="dropdown-item warning" (click)="onToggleStatus(branch); openDropdownId = null" *ngIf="branch.status !== 'INACTIVE'">
                    <span class="material-icons" style="font-size: 18px;">block</span>
                    Deactivate
                  </button>
                  <button class="dropdown-item success" (click)="onToggleStatus(branch); openDropdownId = null" *ngIf="branch.status === 'INACTIVE'">
                    <span class="material-icons" style="font-size: 18px;">check_circle</span>
                    Reactivate
                  </button>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item danger" (click)="onDeleteBranch(branch.id); openDropdownId = null">
                    <span class="material-icons" style="font-size: 18px;">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="load-more-container" *ngIf="branches.length > displayedCardsCount">
          <button class="btn btn-secondary load-more-btn" (click)="loadMoreCards()">
            <span>Load More Locations</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>
    </div>


    <!-- Add/Edit Branch Modal -->
    <div class="modal-overlay" *ngIf="showAddModal" (click)="closeAddModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditMode ? 'Edit Branch' : 'Add New Branch' }}</h2>
          <button class="close-btn" (click)="closeAddModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-subtitle">
            {{ isEditMode ? 'Update the details for this physical location.' : 'Enter details for the new physical location.' }}
          </p>
          
          <form #branchForm="ngForm" (ngSubmit)="onSubmitBranch()">
            <div class="form-group">
              <label for="branchName">Branch Name</label>
              <input 
                type="text" 
                id="branchName" 
                name="name" 
                class="form-control" 
                [(ngModel)]="newBranch.name" 
                placeholder="e.g., Chennai Center" 
                required
                #nameModel="ngModel"
              >
              <div *ngIf="nameModel.invalid && nameModel.touched" class="error-text">
                Branch name is required.
              </div>
            </div>

            <div class="form-group">
              <label for="branchLocation">Location / Address</label>
              <textarea 
                id="branchLocation" 
                name="location" 
                class="form-control" 
                [(ngModel)]="newBranch.location" 
                placeholder="e.g., 123 Main Street, Downtown" 
                required
                rows="3"
                #locationModel="ngModel"
              ></textarea>
              <div *ngIf="locationModel.invalid && locationModel.touched" class="error-text">
                Location is required.
              </div>
            </div>

            <div class="form-group">
              <label for="branchManager">Branch Manager *</label>
              <select 
                id="branchManager" 
                name="managerId" 
                class="form-control" 
                [(ngModel)]="newBranch.managerId"
                required
                #managerModel="ngModel"
              >
                <option [ngValue]="undefined" disabled selected>Select Manager</option>
                <option *ngFor="let mgr of managers" [value]="mgr.id">{{ mgr.name }}</option>
              </select>
              <div *ngIf="managerModel.invalid && managerModel.touched" class="error-text">
                Branch manager is required.
              </div>
            </div>

            <div class="modal-footer" style="padding: 1.5rem 0 0; border-top: 1px solid var(--color-gray-100); margin-top: 1.5rem;">
              <button 
                type="submit" 
                class="btn btn-primary btn-block" 
                [disabled]="branchForm.invalid || submitting"
              >
                <span *ngIf="!submitting">{{ isEditMode ? 'Save Changes' : 'Create Branch' }}</span>
                <span *ngIf="submitting">Processing...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="cancelDelete()">
      <div class="modal-content delete-modal" (click)="$event.stopPropagation()">
        <div class="modal-body text-center" style="padding-top: 2.5rem;">
          <div class="confirm-icon-wrap btn-danger">
            <span class="material-icons">delete_forever</span>
          </div>
          <h2 class="modal-title mb-2">Delete Branch?</h2>
          <p class="text-muted mb-4">
            Are you sure you want to delete <strong>{{ branchToDelete?.name }}</strong>? <br>
            This action is permanent and cannot be undone.
          </p>
          
          <div class="modal-footer" style="padding: 0; margin-top: 2rem;">
            <button 
              type="button" 
              class="btn btn-danger btn-block" 
              (click)="confirmDelete()"
              [disabled]="submitting"
            >
              <span *ngIf="!submitting">Yes, Delete Branch</span>
              <span *ngIf="submitting">Deleting...</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Change Modal -->
    <div class="modal-overlay" *ngIf="showStatusModal" (click)="cancelStatusToggle()">
      <div class="modal-content status-modal" (click)="$event.stopPropagation()">
        <div class="modal-body text-center" style="padding-top: 2.5rem;">
          <div class="confirm-icon-wrap" [ngClass]="branchToToggle?.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'">
            <span class="material-icons">{{ branchToToggle?.status === 'ACTIVE' ? 'pause_circle' : 'play_circle' }}</span>
          </div>
          <h2 class="modal-title mb-2">Change Status?</h2>
          <p class="text-muted mb-4">
            Are you sure you want to <strong>{{ branchToToggle?.status === 'ACTIVE' ? 'deactivate' : 'activate' }}</strong> the branch <strong>{{ branchToToggle?.name }}</strong>?
          </p>
          
          <div class="modal-footer" style="padding: 0; margin-top: 2rem;">
            <button 
              type="button" 
              class="btn btn-block" 
              [class.btn-primary]="branchToToggle?.status === 'INACTIVE'"
              [class.btn-warning]="branchToToggle?.status === 'ACTIVE'"
              (click)="confirmStatusToggle()"
              [disabled]="submitting"
            >
              <span *ngIf="!submitting">Yes, {{ branchToToggle?.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}</span>
              <span *ngIf="submitting">Updating...</span>
            </button>
          </div>
        </div>
      </div>
    </div>


  `,
  styles: [`
    .module-container { padding-bottom: 2rem; position: relative; }
    .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .header-actions { display: flex; align-items: center; gap: 0.75rem; }
    .page-title { font-size: 1.875rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .page-subtitle { color: var(--color-gray-600); margin: 0.25rem 0 0; font-size: 1rem; }

    /* View Switcher */
    .view-switcher { display: flex; background: var(--color-gray-100); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-200); }
    .switcher-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--color-gray-500); cursor: pointer; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
    .switcher-btn .material-icons { font-size: 20px; }
    .switcher-btn:hover { color: var(--color-gray-700); }
    .switcher-btn.active { background: white; color: var(--color-gray-700); box-shadow: var(--shadow-sm); }


    .action-group { display: flex; gap: 0.25rem; justify-content: flex-end; }
    .btn-icon-sm { width: 34px; height: 34px; border-radius: var(--radius-md); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition-fast); background: transparent; color: var(--color-gray-500); }
    .btn-icon-sm .material-icons { font-size: 20px; }
    .btn-icon-sm:hover { background: var(--color-gray-100); color: var(--color-gray-700); }
    
    .delete-btn:hover { color: var(--color-error); background: #fef2f2; }

    .error-text { color: var(--color-error); font-size: 0.75rem; margin-top: 0.375rem; font-weight: 500; }
    
    .loading-state { padding: 4rem 2rem; text-align: center; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--color-gray-300); }
    .empty-state-container { padding: 4rem 2rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--color-gray-300); text-align: center; display: flex; justify-content: center; align-items: center; }
    .empty-state-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .empty-icon { font-size: 3rem; color: var(--color-gray-300); margin-bottom: 0.5rem; }
    .empty-state-content h3 { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-800); margin: 0; }
    .empty-state-content p { color: var(--color-gray-500); margin: 0; font-size: 0.875rem; max-width: 300px; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-100); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Delete/Status Modal Specifics */
    .delete-icon-wrap, .status-icon-wrap { width: 3rem; height: 3rem; background: #fef2f2; color: var(--color-error); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; border: 8px solid #fffbfa; }
    .delete-icon-wrap .material-icons, .status-icon-wrap .material-icons { font-size: 1.5rem; }
    .status-icon-wrap { background: #ecfdf3; color: #027a48; border-color: #f6fef9; }
    .status-icon-wrap.inactive { background: #fffcf5; color: #b54708; border-color: #fffaeb; }
    .status-footer { margin-top: 2.5rem; padding: 0; gap: 1rem; }
    .btn-warning { background: #f97316; color: white; border: none; }
    .btn-warning:hover { background: #ea580c; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2); transform: translateY(-1px); }

    /* Grid Layout Specifics */
    .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; animation: modalIn 0.3s ease-out; margin-top: 2rem; width: 100%; }
    .branch-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); overflow: hidden; display: flex; flex-direction: column; transition: all var(--transition-fast); position: relative; box-shadow: var(--shadow-sm); }
    .branch-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--color-gray-300); }
    
    .card-header { padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; background: white; border-bottom: 1px solid var(--color-gray-100); }
    .branch-icon-wrap { width: 40px; height: 40px; background: var(--color-primary-light); color: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-primary-border); }
    .status-indicator { 
      display: flex; 
      align-items: center; 
      gap: 0.375rem; 
      font-size: 0.75rem; 
      font-weight: 500; 
      padding: 0.25rem 0.75rem; 
      border-radius: 12px; 
      background: var(--color-gray-100); 
      color: var(--color-gray-700); 
      border: 1px solid var(--color-gray-200); 
    }
    .status-indicator.active { 
      background: #ecfdf3; 
      color: #027a48; 
      border-color: #abefc6; 
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-gray-400);
    }
    .status-indicator.active .status-dot {
      background: #10b981;
    }
    
    .card-body { padding: 1.25rem; flex: 1; cursor: pointer; }
    .branch-card-title { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-900); margin: 0 0 0.5rem; }
    .location-item { display: flex; gap: 0.5rem; color: var(--color-gray-600); font-size: 0.875rem; margin-bottom: 1.25rem; align-items: flex-start; }
    .location-item .material-icons { font-size: 18px; color: var(--color-gray-400); margin-top: 1px; }
    
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem; }
    .metric-box { background: var(--color-gray-50); padding: 0.75rem; border-radius: var(--radius-md); display: flex; flex-direction: column; border: 1px solid var(--color-gray-100); }
    .metric-box.full { grid-column: span 2; }
    .metric-box .label { font-size: 0.7rem; text-transform: uppercase; color: var(--color-gray-500); font-weight: 700; margin-bottom: 4px; letter-spacing: 0.025em; }
    .metric-box .value { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); }
    .metric-box .value.pr { color: var(--color-primary); }
    
    .manager-item { display: flex; align-items: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--color-gray-100); }
    .avatar-mini { width: 32px; height: 32px; background: var(--color-gray-100); color: var(--color-gray-600); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; border: 1px solid var(--color-gray-200); }
    .mgr-info { display: flex; flex-direction: column; }
    .mgr-label { font-size: 0.7rem; color: var(--color-gray-500); font-weight: 500; }
    .mgr-name { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); }
    
    .card-footer { padding: 1rem 1.25rem; background: var(--color-gray-50); border-top: 1px solid var(--color-gray-100); display: flex; justify-content: flex-end; gap: 0.5rem; }
    .footer-action { width: 32px; height: 32px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-300); background: white; color: var(--color-gray-500); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition-fast); box-shadow: var(--shadow-xs); }
    .footer-action:hover { color: var(--color-primary); border-color: var(--color-primary); }
    .footer-action.warning { color: #d97706; border-color: #fbbf24; }
    .footer-action.warning:hover { background: #fef3c7; color: #b45309; border-color: #f59e0b; }
    .footer-action.success { color: #059669; border-color: #34d399; }
    .footer-action.success:hover { background: #d1fae5; color: #047857; border-color: #10b981; }
    .footer-action.danger { color: #dc2626; border-color: #f87171; }
    .footer-action.danger:hover { background: #fee2e2; color: #b91c1c; border-color: #ef4444; }
    
    .error-text { color: var(--color-error); font-size: 0.75rem; margin-top: 0.375rem; font-weight: 500; }
    
    .loading-state { padding: 4rem 2rem; text-align: center; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--color-gray-300); }
    .empty-state-container { padding: 4rem 2rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--color-gray-300); text-align: center; display: flex; justify-content: center; align-items: center; }
    .empty-state-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .empty-icon { font-size: 3rem; color: var(--color-gray-300); margin-bottom: 0.5rem; }
    .empty-state-content h3 { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-800); margin: 0; }
    .empty-state-content p { color: var(--color-gray-500); margin: 0; font-size: 0.875rem; max-width: 300px; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-100); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Delete/Status Modal Specifics */
    .status-footer { margin-top: 2.5rem; padding: 0; gap: 1rem; }
    .btn-warning { background: #f97316; color: white; border: none; }
    .btn-warning:hover { background: #ea580c; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2); transform: translateY(-1px); }

    /* Grid Layout Specifics */
    .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; animation: modalIn 0.3s ease-out; margin-top: 2rem; width: 100%; }
    .branch-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); overflow: hidden; display: flex; flex-direction: column; transition: all var(--transition-fast); position: relative; box-shadow: var(--shadow-sm); }
    .branch-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--color-gray-300); }
    
    .card-header { padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; background: white; border-bottom: 1px solid var(--color-gray-100); }
    .branch-icon-wrap { width: 40px; height: 40px; background: var(--color-primary-light); color: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-primary-border); }
    .status-indicator { 
      display: flex; 
      align-items: center; 
      gap: 0.375rem; 
      font-size: 0.75rem; 
      font-weight: 500; 
      padding: 0.25rem 0.75rem; 
      border-radius: 12px; 
      background: var(--color-gray-100); 
      color: var(--color-gray-700); 
      border: 1px solid var(--color-gray-200); 
    }
    .status-indicator.active { 
      background: #ecfdf3; 
      color: #027a48; 
      border-color: #abefc6; 
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-gray-400);
    }
    .status-indicator.active .status-dot {
      background: #10b981;
    }
    
    .card-body { padding: 1.25rem; flex: 1; cursor: pointer; }
    .branch-card-title { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-900); margin: 0 0 0.5rem; }
    .location-item { display: flex; gap: 0.5rem; color: var(--color-gray-600); font-size: 0.875rem; margin-bottom: 1.25rem; align-items: flex-start; }
    .location-item .material-icons { font-size: 18px; color: var(--color-gray-400); margin-top: 1px; }
    
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem; }
    .metric-box { background: var(--color-gray-50); padding: 0.75rem; border-radius: var(--radius-md); display: flex; flex-direction: column; border: 1px solid var(--color-gray-100); }
    .metric-box.full { grid-column: span 2; }
    .metric-box .label { font-size: 0.7rem; text-transform: uppercase; color: var(--color-gray-500); font-weight: 700; margin-bottom: 4px; letter-spacing: 0.025em; }
    .metric-box .value { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); }
    .metric-box .value.pr { color: var(--color-primary); }
    
    .manager-item { display: flex; align-items: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--color-gray-100); }
    .avatar-mini { width: 32px; height: 32px; background: var(--color-gray-100); color: var(--color-gray-600); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; border: 1px solid var(--color-gray-200); }
    .mgr-info { display: flex; flex-direction: column; }
    .mgr-label { font-size: 0.7rem; color: var(--color-gray-500); font-weight: 500; }
    .mgr-name { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); }
    
    .card-footer { padding: 1rem 1.25rem; background: var(--color-gray-50); border-top: 1px solid var(--color-gray-100); display: flex; justify-content: flex-end; gap: 0.5rem; }
    .footer-action { width: 32px; height: 32px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-300); background: white; color: var(--color-gray-500); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition-fast); box-shadow: var(--shadow-xs); }
    .footer-action:hover { color: var(--color-primary); border-color: var(--color-primary); }
    .footer-action.warning { color: #d97706; border-color: #fbbf24; }
    .footer-action.warning:hover { background: #fef3c7; color: #b45309; border-color: #f59e0b; }
    .footer-action.success { color: #059669; border-color: #34d399; }
    .footer-action.success:hover { background: #d1fae5; color: #047857; border-color: #10b981; }
    .footer-action.danger { color: #dc2626; border-color: #f87171; }
    .footer-action.danger:hover { background: #fee2e2; color: #b91c1c; border-color: #ef4444; }

    .load-more-container {
      display: flex;
      justify-content: center;
      margin-top: 2.5rem;
      padding-bottom: 1rem;
    }
    
    .load-more-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }
    
    .load-more-btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    /* Action Buttons Styles */
    .action-btns {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: flex-end;
    }
    
    .btn-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      background: transparent;
      color: var(--color-gray-500);
    }
    
    .btn-icon .material-icons {
      font-size: 18px;
    }
    
    .btn-icon:hover {
      background: var(--color-gray-100);
      color: var(--color-gray-700);
    }

    /* Status Indicator Styles */
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      background: var(--color-gray-100);
      color: var(--color-gray-700);
      border: 1px solid var(--color-gray-200);
    }
    
    .status-indicator.active {
      background: #ecfdf3;
      color: #027a48;
      border-color: #abefc6;
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-gray-400);
    }
    
    .status-indicator.active .status-dot {
      background: #10b981;
    }
    
    .btn-action {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-gray-300);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      background: white;
      box-shadow: var(--shadow-xs);
    }
    
    .btn-action .material-icons {
      font-size: 18px;
    }
    
    .btn-action.warning {
      color: #d97706;
      border-color: #fbbf24;
    }
    
    .btn-action.warning:hover {
      background: #fef3c7;
      color: #b45309;
      border-color: #f59e0b;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    
    .btn-action.success {
      color: #059669;
      border-color: #34d399;
    }
    
    .btn-action.success:hover {
      background: #d1fae5;
      color: #047857;
      border-color: #10b981;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    
    .btn-action.danger {
      color: #dc2626;
      border-color: #f87171;
    }
    
    .btn-action.danger:hover {
      background: #fee2e2;
      color: #b91c1c;
      border-color: #ef4444;
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    /* Action Dropdown Styles */
    .action-dropdown {
      position: absolute;
      right: 0;
      top: 100%;
      background: white;
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      min-width: 180px;
      overflow: hidden;
      margin-top: 4px;
    }
    
    .dropdown-item {
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-gray-700);
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    
    .dropdown-item:hover {
      background: var(--color-gray-50);
    }
    
    .dropdown-item.warning {
      color: #d97706;
    }
    
    .dropdown-item.warning:hover {
      background: #fef3c7;
      color: #b45309;
    }
    
    .dropdown-item.success {
      color: #059669;
    }
    
    .dropdown-item.success:hover {
      background: #d1fae5;
      color: #047857;
    }
    
    .dropdown-item.danger {
      color: #dc2626;
    }
    
    .dropdown-item.danger:hover {
      background: #fee2e2;
      color: #b91c1c;
    }
    
    .dropdown-divider {
      height: 1px;
      background: var(--color-gray-200);
      margin: 4px 0;
    }
  `]

})
export class BranchListComponent implements OnInit {
  private branchService = inject(BranchService);
  private notificationService = inject(NotificationService);

  branches: Branch[] = [];
  managers: any[] = [];
  showAddModal = false;
  showDeleteModal = false;
  showStatusModal = false;
  isEditMode = false;
  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;
  submitting = false;
  loading = true;
  openDropdownId: string | null = null;
  
  newBranch: Partial<Branch> = { name: '', location: '' };
  branchToDelete: Branch | null = null;
  branchToToggle: Branch | null = null;

  ngOnInit() {
    this.loadBranches();
    this.loadManagers();
  }

  loadMoreCards() {
    this.displayedCardsCount += 10;
  }

  loadBranches() {
    this.loading = true;
    this.branchService.getAllBranches().subscribe({
      next: (data) => {
        this.branches = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load branches', err);
        this.notificationService.error('Failed to load branches. Please check your connection.');
        this.loading = false;
        // Fallback to mock data if API fails in dev
        this.branches = [
          { id: 1, name: 'Ahmedabad Main', location: '401, Sapphire Complex, CG Road, Ahmedabad, Gujarat', staffCount: 12, studentCount: 145, revenue: 84000, manager: { id: 1, name: 'John Doe', email: 'john@example.com' }, status: 'ACTIVE' },
          { id: 2, name: 'Mumbai North', location: 'Shop 12, Sterling Center, Andheri West, Mumbai', staffCount: 8, studentCount: 92, revenue: 52000, manager: { id: 2, name: 'Sarah Jenkins', email: 'sarah@example.com' }, status: 'ACTIVE' },
          { id: 3, name: 'Delhi South', location: 'B-42, Lajpat Nagar, New Delhi', staffCount: 15, studentCount: 184, revenue: 112000, manager: { id: 3, name: 'Rohan Gupta', email: 'rohan@example.com' }, status: 'INACTIVE' }
        ];
      }
    });
  }

  loadManagers() {
    this.branchService.getManagers().subscribe({
      next: (data) => this.managers = data,
      error: (err) => console.error('Failed to load managers', err)
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.newBranch = { name: '', location: '', status: 'ACTIVE' };
    this.showAddModal = true;
  }

  openEditModal(branch: Branch) {
    this.isEditMode = true;
    this.newBranch = { 
      ...branch,
      managerId: branch.manager?.id || branch.managerId
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    if (this.submitting) return;
    this.showAddModal = false;
  }

  onSubmitBranch() {
    if (!this.newBranch.name || !this.newBranch.location || !this.newBranch.managerId) return;

    this.submitting = true;
    
    if (this.isEditMode && this.newBranch.id) {
      this.branchService.updateBranch(this.newBranch.id, this.newBranch).subscribe({
        next: () => {
          this.notificationService.success('Branch updated successfully!');
          this.finalizeSubmit();
        },
        error: (err) => this.handleSubmitError(err)
      });
    } else {
      this.branchService.createBranch(this.newBranch).subscribe({
        next: () => {
          this.notificationService.success('Branch added successfully!');
          this.finalizeSubmit();
        },
        error: (err) => this.handleSubmitError(err)
      });
    }
  }

  onDeleteBranch(id?: number) {
    if (id === undefined) return;
    const branch = this.branches.find(b => b.id === id);
    if (!branch) return;
    
    this.branchToDelete = branch;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.branchToDelete?.id) return;
    
    this.submitting = true;
    this.branchService.deleteBranch(this.branchToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('Branch deleted successfully');
        this.showDeleteModal = false;
        this.branchToDelete = null;
        this.submitting = false;
        this.loadBranches();
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.notificationService.error('Failed to delete branch');
        this.submitting = false;
      }
    });
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.branchToDelete = null;
  }

  onToggleStatus(branch: Branch) {
    this.branchToToggle = branch;
    this.showStatusModal = true;
  }

  confirmStatusToggle() {
    if (!this.branchToToggle?.id) return;
    
    const newStatus = this.branchToToggle.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    this.submitting = true;
    
    this.branchService.updateBranchStatus(this.branchToToggle.id, newStatus).subscribe({
      next: () => {
        this.notificationService.success(`Branch is now ${newStatus === 'ACTIVE' ? 'Operational' : 'Inactive'}`);
        this.showStatusModal = false;
        this.branchToToggle = null;
        this.submitting = false;
        this.loadBranches();
      },
      error: (err) => {
        console.error('Status update failed', err);
        this.notificationService.error('Failed to update status');
        this.showStatusModal = false;
        this.branchToToggle = null;
        this.submitting = false;
      }
    });
  }

  cancelStatusToggle() {
    this.showStatusModal = false;
    this.branchToToggle = null;
  }

  private finalizeSubmit() {
    this.submitting = false;
    this.showAddModal = false;
    this.loadBranches();
  }

  toggleDropdown(event: Event, id: string) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.openDropdownId = null;
  }

  private handleSubmitError(err: any) {
    console.error('Operation failed', err);
    this.notificationService.error(`Failed to ${this.isEditMode ? 'update' : 'create'} branch. Please try again.`);
    this.submitting = false;
  }
}

