import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../core/models/branch.model';
import { NotificationService } from '../../../../core/services/notification.service';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">Branch Management</h1>
          <p class="page-subtitle">Manage all your branch locations and operational hubs.</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher">
            <button class="switcher-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="List View">
              <span class="material-icons">list</span>
              <span>List</span>
            </button>
            <button class="switcher-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Card View">
              <span class="material-icons">grid_view</span>
              <span>Grid</span>
            </button>
          </div>
          <button class="btn btn-primary" (click)="openAddModal()">
            <span class="material-icons">add</span>
            <span>Add Branch</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search branches by name or location..." [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()">
        </div>
        <div class="filter-actions">
          <button class="btn-icon-secondary" [class.active]="showAdvancedFilters" (click)="showAdvancedFilters = !showAdvancedFilters" title="Advanced Filters">
            <span class="material-icons">tune</span>
          </button>
        </div>
      </div>

      <!-- Advanced Filters Panel -->
      <div class="advanced-filters-panel" [class.show]="showAdvancedFilters">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Status</label>
            <select [(ngModel)]="filterStatus" (change)="onFilterChange()">
              <option value="">All Statuses</option>
              <option value="ACTIVE">Operational</option>
              <option value="INACTIVE">Non-Operational</option>
            </select>
          </div>
          <div class="filter-group">
            <button class="btn-ghost-sm" (click)="resetFilters()">Reset All Filters</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container shadow-premium" *ngIf="loading" style="padding: 3rem; text-align: center; background: white; border-radius: 12px; border: 1px solid var(--color-gray-200); margin-bottom: 2rem;">
        <div class="spinner-container" style="display: flex; justify-content: center; margin-bottom: 1rem;">
          <div class="loading-spinner"></div>
        </div>
        <p style="color: var(--color-gray-500);">Loading branches...</p>
      </div>

      <app-empty-state 
        *ngIf="!loading && branches.length === 0"
        title="No Branches Found"
        message="There are currently no branches configured. Add your first branch to get started."
        [showAction]="true"
        actionText="Add Branch"
        (actionClick)="openAddModal()">
      </app-empty-state>

      <!-- Table View -->
      <div class="table-card" *ngIf="!loading && branches.length > 0 && viewMode === 'list'" style="border-radius: 12px; border: 1px solid var(--color-gray-200); box-shadow: var(--shadow-sm); overflow: hidden; margin-bottom: 2rem;">
        <div class="table-responsive">
          <table class="premium-table" style="width: 100%; border-collapse: collapse;">
            <thead style="background: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-200);">
              <tr>
                <th>Branch Name</th>
                <th>Location</th>
                <th>Manager</th>
                <th>Stats</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let branch of filteredBranches" class="clickable-row" (click)="openEditModal(branch)">
                <td>
                  <div class="entity-meta">
                    <div class="avatar-circle" style="background: var(--color-primary-light); color: var(--color-primary);">
                      <span class="material-icons" style="font-size: 18px;">business</span>
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ branch.name }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-weight: 500; font-size: 0.8125rem;">{{ branch.location }}</span>
                  </div>
                </td>
                <td>
                  <div class="entity-meta" *ngIf="branch.manager">
                    <div class="avatar-circle" [style.background]="getAvatarColor(branch.manager.name)" style="width: 24px; height: 24px; font-size: 10px;">
                      {{ getInitials(branch.manager.name) }}
                    </div>
                    <span class="entity-name" style="font-size: 0.8125rem;">{{ branch.manager.name }}</span>
                  </div>
                  <span class="entity-subtext" *ngIf="!branch.manager">Unassigned</span>
                </td>
                <td>
                  <div style="display: flex; gap: 12px;">
                    <div class="entity-info">
                      <span class="entity-subtext">Staff</span>
                      <span class="entity-name" style="font-size: 0.75rem;">{{ branch.userCounts?.totalStaffs || branch.staffCount || 0 }}</span>
                    </div>
                    <div class="entity-info">
                      <span class="entity-subtext">Students</span>
                      <span class="entity-name" style="font-size: 0.75rem;">{{ branch.userCounts?.totalStudents || branch.studentCount || 0 }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-status" [ngClass]="branch.status !== 'INACTIVE' ? 'success' : 'gray'">
                    {{ branch.status === 'INACTIVE' ? 'Non-Operational' : 'Operational' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-btns" (click)="$event.stopPropagation()">
                    <button class="btn-icon" (click)="openEditModal(branch)" title="Edit"><span class="material-icons">edit</span></button>
                    <button class="btn-icon" (click)="toggleDropdown($event, 'row-' + branch.id)"><span class="material-icons">more_vert</span></button>
                    
                    <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === 'row-' + branch.id" (click)="$event.stopPropagation()" style="position: absolute; right: 0; top: 100%; z-index: 100; background: white; border: 1px solid var(--color-gray-200); border-radius: 8px; padding: 4px; min-width: 160px; box-shadow: var(--shadow-lg);">
                      <button class="dropdown-item" (click)="onToggleStatus(branch); openDropdownId = null" *ngIf="branch.status !== 'INACTIVE'" style="width: 100%; text-align: left; padding: 8px 12px; display: flex; align-items: center; gap: 8px; color: #b54708; border: none; background: none; cursor: pointer; border-radius: 4px;">
                        <span class="material-icons" style="font-size: 18px;">block</span> Deactivate
                      </button>
                      <button class="dropdown-item" (click)="onToggleStatus(branch); openDropdownId = null" *ngIf="branch.status === 'INACTIVE'" style="width: 100%; text-align: left; padding: 8px 12px; display: flex; align-items: center; gap: 8px; color: #027a48; border: none; background: none; cursor: pointer; border-radius: 4px;">
                        <span class="material-icons" style="font-size: 18px;">check_circle</span> Reactivate
                      </button>
                      <button class="dropdown-item" (click)="onDeleteBranch(branch.id); openDropdownId = null" style="width: 100%; text-align: left; padding: 8px 12px; display: flex; align-items: center; gap: 8px; color: #b42318; border: none; background: none; cursor: pointer; border-radius: 4px;">
                        <span class="material-icons" style="font-size: 18px;">delete</span> Delete
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Grid View -->
      <div class="grid-container" *ngIf="!loading && branches.length > 0 && viewMode === 'grid'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        <div class="table-card" *ngFor="let branch of filteredBranches | slice:0:displayedCardsCount" style="padding: 1.25rem; transition: all 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div class="entity-meta">
              <div class="avatar-circle" style="background: var(--color-primary-light); color: var(--color-primary);">
                <span class="material-icons">business</span>
              </div>
              <div class="entity-info">
                <span class="entity-name">{{ branch.name }}</span>
                <span class="badge-status" style="margin-top: 4px;" [ngClass]="branch.status !== 'INACTIVE' ? 'success' : 'gray'">
                  {{ branch.status === 'INACTIVE' ? 'Non-Operational' : 'Operational' }}
                </span>
              </div>
            </div>
          </div>
          
          <div style="padding: 1rem; background: var(--color-gray-50); border-radius: 8px; margin-bottom: 1rem;">
            <div class="entity-info">
              <span class="entity-subtext">Location</span>
              <span class="entity-name" style="font-size: 0.875rem;">{{ branch.location }}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.75rem;">
              <div class="entity-info">
                <span class="entity-subtext">Staff</span>
                <span class="entity-name" style="font-size: 0.875rem;">{{ branch.userCounts?.totalStaffs || branch.staffCount || 0 }}</span>
              </div>
              <div class="entity-info">
                <span class="entity-subtext">Students</span>
                <span class="entity-name" style="font-size: 0.875rem;">{{ branch.userCounts?.totalStudents || branch.studentCount || 0 }}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
            <div class="entity-meta" *ngIf="branch.manager">
              <div class="avatar-circle" [style.background]="getAvatarColor(branch.manager.name)" style="width: 24px; height: 24px; font-size: 10px;">
                {{ getInitials(branch.manager.name) }}
              </div>
              <span class="entity-subtext">{{ branch.manager.name }}</span>
            </div>
            <div class="action-btns" (click)="$event.stopPropagation()">
              <button class="btn-icon" (click)="openEditModal(branch)"><span class="material-icons">edit</span></button>
              <button class="btn-icon" (click)="toggleDropdown($event, 'card-' + branch.id)"><span class="material-icons">more_vert</span></button>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div *ngIf="branches.length > displayedCardsCount" style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 1rem;">
          <button class="btn btn-secondary" (click)="loadMoreCards()">
            <span>Load More Branches</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>

    <!-- Add/Edit Branch Modal -->
    <div class="modal-overlay" *ngIf="showAddModal" (click)="closeAddModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 500px;">
        <div class="modal-header">
          <div class="modal-header-icon" style="background: var(--color-primary-light); color: var(--color-primary); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <span class="material-icons">{{ isEditMode ? 'edit' : 'add_business' }}</span>
          </div>
          <div class="modal-header-text" style="flex: 1; padding-left: 1rem;">
            <h2 class="modal-title" style="margin: 0; font-size: 1.25rem;">{{ isEditMode ? 'Edit Branch' : 'Add New Branch' }}</h2>
            <p class="modal-subtitle" style="margin: 0.25rem 0 0; color: var(--color-gray-500); font-size: 0.875rem;">{{ isEditMode ? 'Update details for this location.' : 'Enter details for the new location.' }}</p>
          </div>
          <button class="btn-icon" (click)="closeAddModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-body" style="padding: 1.5rem;">
          <form #branchForm="ngForm" (ngSubmit)="onSubmitBranch()">
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Branch Name</label>
              <input type="text" name="name" class="form-control" [(ngModel)]="newBranch.name" placeholder="e.g., Chennai Center" required #nameModel="ngModel">
              <div *ngIf="nameModel.invalid && nameModel.touched" style="color: #d92d20; font-size: 0.75rem; margin-top: 4px;">Branch name is required.</div>
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Location / Address</label>
              <textarea name="location" class="form-control" [(ngModel)]="newBranch.location" placeholder="e.g., 123 Main Street" required rows="3" #locationModel="ngModel"></textarea>
              <div *ngIf="locationModel.invalid && locationModel.touched" style="color: #d92d20; font-size: 0.75rem; margin-top: 4px;">Location is required.</div>
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Branch Manager</label>
              <select name="managerId" class="form-control" [(ngModel)]="newBranch.managerId">
                <option [ngValue]="undefined">Select Manager (Optional)</option>
                <option *ngFor="let mgr of managers" [value]="mgr.id">{{ mgr.name }}</option>
              </select>
            </div>

            <div class="modal-footer" style="padding-top: 1.5rem; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--color-gray-100);">
              <button type="button" class="btn btn-secondary" (click)="closeAddModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="branchForm.invalid || submitting">
                {{ isEditMode ? 'Save Changes' : 'Create Branch' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirmation Modals -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="cancelDelete()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 400px; padding: 2rem; text-align: center;">
        <div style="background: #fee4e2; color: #d92d20; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          <span class="material-icons">delete_forever</span>
        </div>
        <h2 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Delete Branch?</h2>
        <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-bottom: 2rem;">Are you sure you want to delete <strong>{{ branchToDelete?.name }}</strong>? This action cannot be undone.</p>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" style="flex: 1;" (click)="cancelDelete()">Cancel</button>
          <button class="btn btn-primary" style="flex: 1; background: #d92d20; border-color: #d92d20;" (click)="confirmDelete()" [disabled]="submitting">Delete</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showStatusModal" (click)="cancelStatusToggle()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 400px; padding: 2rem; text-align: center;">
        <div [style.background]="branchToToggle?.status === 'ACTIVE' ? '#fef0c7' : '#d1fadf'" [style.color]="branchToToggle?.status === 'ACTIVE' ? '#dc6803' : '#039855'" style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          <span class="material-icons">{{ branchToToggle?.status === 'ACTIVE' ? 'pause_circle' : 'play_circle' }}</span>
        </div>
        <h2 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Change Status?</h2>
        <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-bottom: 2rem;">Are you sure you want to <strong>{{ branchToToggle?.status === 'ACTIVE' ? 'deactivate' : 'activate' }}</strong> the branch <strong>{{ branchToToggle?.name }}</strong>?</p>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" style="flex: 1;" (click)="cancelStatusToggle()">Cancel</button>
          <button class="btn btn-primary" style="flex: 1;" (click)="confirmStatusToggle()" [disabled]="submitting">Confirm</button>
        </div>
      </div>
    </div>

    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
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
  
  searchQuery = '';
  filterStatus = '';
  showAdvancedFilters = false;

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

  loadManagers() {
    this.branchService.getManagers().subscribe({
      next: (data) => this.managers = data,
      error: (err) => console.error('Failed to load managers', err)
    });
  }

  get filteredBranches(): Branch[] {
    return this.branches.filter(branch => {
      const matchesSearch = !this.searchQuery || 
        branch.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        branch.location.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = !this.filterStatus || branch.status === this.filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange() {
    this.displayedCardsCount = 10;
  }

  onFilterChange() {
    this.displayedCardsCount = 10;
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterStatus = '';
    this.onFilterChange();
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
    if (!this.newBranch.name || !this.newBranch.location) return;

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

