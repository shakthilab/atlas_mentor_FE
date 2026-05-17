import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReferralResourceService } from '../../../../core/services/referral-resource.service';
import { RoleConfigService } from '../../../../core/services/role-config.service';
import { RoleService, Role } from '../../../../core/services/role.service';
import { BranchService } from '../../../../core/services/branch.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ReferralResource, ResourceType, OwnerType, StorageType, ReferralResourceRequest } from '../../../../core/models/referral-resource.model';
import { Branch } from '../../../../core/models/branch.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-resource-module',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent],
  template: `
    <div class="module-container">
      <!-- Header -->
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">Resource Management</h1>
          <p class="page-subtitle">Centralized hub for managing documents, media, and external resources.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <span class="material-icons">add</span>
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-mini-card">
          <div class="stat-icon-wrap" style="background: #eff6ff; color: #2563eb;">
            <span class="material-icons">description</span>
          </div>
          <div class="stat-content">
            <span class="label">Total Resources</span>
            <span class="value">{{ totalResources }}</span>
          </div>
        </div>
        <div class="stat-mini-card">
          <div class="stat-icon-wrap" style="background: #fef2f2; color: #dc2626;">
            <span class="material-icons">link</span>
          </div>
          <div class="stat-content">
            <span class="label">External Links</span>
            <span class="value">{{ totalExternalLinks }}</span>
          </div>
        </div>
        <div class="stat-mini-card">
          <div class="stat-icon-wrap" style="background: #ecfdf3; color: #10b981;">
            <span class="material-icons">verified</span>
          </div>
          <div class="stat-content">
            <span class="label">Active Assets</span>
            <span class="value">{{ activeResources }}</span>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input 
            type="text" 
            placeholder="Filter by name, description or owner..." 
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()">
        </div>
        
        <div class="filter-actions">
          <select class="filter-select" [(ngModel)]="filterResourceType" (change)="loadResources()">
            <option value="">All Types</option>
            <option *ngFor="let type of resourceTypes" [value]="type">{{ type }}</option>
          </select>
          <select class="filter-select" [(ngModel)]="filterOwnerType" (change)="loadResources()">
            <option value="">All Owners</option>
            <option value="REFERRAL">Referrals</option>
            <option value="COMPANY">Companies</option>
          </select>
          <button class="btn-icon-secondary" (click)="resetFilters()" title="Reset Filters">
            <span class="material-icons">refresh</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container shadow-premium" *ngIf="isLoading">
        <div class="spinner-container">
          <div class="loading-spinner"></div>
        </div>
        <p style="color: var(--color-gray-500);">Loading resources...</p>
      </div>

      <!-- Main Content Area -->
      <div class="table-card" *ngIf="!isLoading">
        <div class="table-responsive">
          <app-empty-state 
            *ngIf="resources.length === 0"
            title="No Resources Found"
            message="No matching records were found. Try adjusting your search parameters."
            [showAction]="true"
            actionText="Clear Filters"
            (actionClick)="resetFilters()">
          </app-empty-state>

          <table class="premium-table" *ngIf="resources.length > 0">
            <thead>
              <tr>
                <th>Resource Detail</th>
                <th>Type</th>
                <th>Ownership</th>
                <th>Storage</th>
                <th>Created</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let resource of resources" class="clickable-row">
                <td (click)="viewResource(resource)">
                  <div class="entity-meta">
                    <div class="avatar-circle" [style.background]="getAvatarColor(resource.resourceType)">
                      <span class="material-icons" style="font-size: 1.25rem;">{{ getResourceIcon(resource.resourceType) }}</span>
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ resource.fileName }}</span>
                      <span class="entity-subtext" *ngIf="resource.description" [title]="resource.description">{{ resource.description | slice:0:40 }}{{ resource.description.length > 40 ? '...' : '' }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-status" [ngClass]="getTypeBadgeClass(resource.resourceType)">
                    {{ resource.resourceType }}
                  </span>
                </td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-size: 0.8125rem;">{{ resource.ownerName }}</span>
                    <span class="entity-subtext" style="font-size: 0.7rem;">{{ resource.ownerType }}</span>
                  </div>
                </td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-size: 0.8125rem;">{{ resource.storageType }}</span>
                    <span class="entity-subtext" *ngIf="resource.fileSize" style="font-size: 0.7rem;">{{ formatFileSize(resource.fileSize) }}</span>
                  </div>
                </td>
                <td>
                  <span class="entity-subtext">{{ resource.createdAt | date:'MMM d, yyyy' }}</span>
                </td>
                <td>
                  <span class="badge-status" [ngClass]="resource.isActive ? 'success' : 'gray'">
                    {{ resource.isActive ? 'Active' : 'Archived' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-btns" (click)="$event.stopPropagation()">
                    <button class="btn-icon" (click)="viewResource(resource)" title="Preview">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button class="btn-icon" (click)="openEditModal(resource)" title="Edit">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon" style="color: var(--color-error);" (click)="deleteResource(resource)" title="Delete">
                      <span class="material-icons">delete_outline</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="table-card-footer" *ngIf="totalPages > 1">
          <button class="pagination-btn" [disabled]="currentPage === 0" (click)="onPageChange(currentPage - 1)">
            <span class="material-icons">arrow_back</span>
            Previous
          </button>
          
          <div class="pagination-pages">
            <button 
              *ngFor="let p of getPageArray()" 
              class="page-num" 
              [class.active]="p === currentPage"
              (click)="onPageChange(p)">
              {{ p + 1 }}
            </button>
          </div>

          <button class="pagination-btn" [disabled]="currentPage === totalPages - 1" (click)="onPageChange(currentPage + 1)">
            Next
            <span class="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Register Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 640px;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--color-gray-200); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 1rem;">
             <div style="width: 44px; height: 44px; border-radius: 10px; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
                <span class="material-icons">{{ isEditing ? 'edit_note' : 'add_link' }}</span>
             </div>
             <div>
                <h2 style="margin: 0; font-size: 1.125rem;">{{ isEditing ? 'Edit Resource' : 'Add New Resource' }}</h2>
                <p style="margin: 0; font-size: 0.8125rem; color: var(--color-gray-500);">{{ isEditing ? 'Update resource details.' : 'Register a new shared resource.' }}</p>
             </div>
          </div>
          <button class="btn-icon" (click)="closeModal()"><span class="material-icons">close</span></button>
        </div>
        
        <div class="modal-body" style="padding: 1.5rem;">
          <form #resourceForm="ngForm">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div class="form-group">
                <label class="form-label">Resource Name <span style="color: var(--color-error);">*</span></label>
                <input type="text" class="form-control" name="fileName" [(ngModel)]="currentResource.fileName" required placeholder="e.g. Marketing Guide">
              </div>
              <div class="form-group">
                <label class="form-label">Type <span style="color: var(--color-error);">*</span></label>
                <select class="form-control" name="resourceType" [(ngModel)]="currentResource.resourceType" required>
                  <option *ngFor="let type of resourceTypes" [value]="type">{{ type }}</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div class="form-group">
                <label class="form-label">Storage <span style="color: var(--color-error);">*</span></label>
                <select class="form-control" name="storageType" [(ngModel)]="currentResource.storageType" required>
                  <option *ngFor="let type of storageTypes" [value]="type">{{ type }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">External URL</label>
                <input type="url" class="form-control" name="externalUrl" [(ngModel)]="currentResource.externalUrl" placeholder="https://...">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label">Description</label>
              <textarea class="form-control" name="description" [(ngModel)]="currentResource.description" rows="2" placeholder="Brief details about this resource..."></textarea>
            </div>

            <div style="padding: 1rem; background: var(--color-gray-50); border-radius: 8px; margin-bottom: 1.5rem;">
              <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-gray-500); text-transform: uppercase; margin-bottom: 1rem; letter-spacing: 0.05em;">Ownership & Meta</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Role <span style="color: var(--color-error);">*</span></label>
                  <select class="form-control" name="selectedRoleId" [(ngModel)]="selectedRoleId" (change)="onRoleOrBranchChange()" required>
                    <option [ngValue]="null">Select Role</option>
                    <option *ngFor="let role of roles" [ngValue]="role.id">{{ role.name }}</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Branch <span style="color: var(--color-error);">*</span></label>
                  <select class="form-control" name="selectedBranchId" [(ngModel)]="selectedBranchId" (change)="onRoleOrBranchChange()" required>
                    <option [ngValue]="null">Select Branch</option>
                    <option *ngFor="let branch of branches" [ngValue]="branch.id">{{ branch.name }}</option>
                  </select>
                </div>
              </div>
              <div class="form-group" style="margin-bottom: 0; position: relative;">
                <label class="form-label">Select User <span style="color: var(--color-error);">*</span></label>
                <div class="custom-multi-select" 
                     [class.disabled]="!selectedRoleId || !selectedBranchId" 
                     (click)="toggleUserDropdown($event)"
                     style="display: flex; align-items: center; justify-content: space-between; padding: 0.625rem 0.875rem; border: 1px solid var(--color-gray-300); border-radius: 8px; cursor: pointer; background: white; min-height: 40px; font-size: 0.875rem;">
                  <span style="color: var(--color-gray-700); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ getSelectedUsersNames() }}
                  </span>
                  <span class="material-icons" style="font-size: 1.25rem; color: var(--color-gray-400);">{{ isUserDropdownOpen ? 'expand_less' : 'expand_more' }}</span>
                </div>
                
                <div *ngIf="isUserDropdownOpen" class="multi-select-dropdown shadow-lg" 
                     (click)="$event.stopPropagation()"
                     style="position: absolute; bottom: 100%; left: 0; right: 0; z-index: 100; background: white; border: 1px solid var(--color-gray-200); border-radius: 8px; margin-bottom: 4px; max-height: 200px; overflow-y: auto; padding: 4px; box-shadow: var(--shadow-lg);">
                  <div *ngIf="activeUsers.length === 0" style="padding: 12px; text-align: center; color: var(--color-gray-500); font-size: 0.875rem;">
                    No active users found.
                  </div>
                  <div *ngFor="let user of activeUsers" 
                       (click)="toggleUserSelection(user.id)"
                       class="multi-select-item"
                       style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-radius: 6px; transition: background 0.2s;">
                    <div class="checkbox-box" [class.checked]="isUserSelected(user.id)" 
                         style="width: 18px; height: 18px; border: 1px solid var(--color-gray-300); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                      <span class="material-icons" *ngIf="isUserSelected(user.id)" style="font-size: 14px; color: var(--color-primary);">check</span>
                    </div>
                    <span style="font-size: 0.875rem; color: var(--color-gray-700);">
                      {{ user.name || (user.firstName + ' ' + (user.lastName || '')) }}
                    </span>
                  </div>
                </div>
                <p *ngIf="activeUsers.length === 0 && selectedRoleId && selectedBranchId" style="font-size: 0.75rem; color: var(--color-error); margin-top: 0.25rem;">No active users found for selected role and branch.</p>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="button" class="btn btn-primary" [disabled]="!resourceForm.form.valid || isSubmitting" (click)="saveResource()">
                <span *ngIf="isSubmitting" class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>
                {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Resource') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="cancelDelete()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 400px; padding: 2rem; text-align: center;">
        <div style="background: #fee4e2; color: #d92d20; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          <span class="material-icons">delete_forever</span>
        </div>
        <h2 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Delete Resource?</h2>
        <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-bottom: 2rem;">
          Are you sure you want to delete <strong>"{{ resourceToDelete?.fileName }}"</strong>? This action cannot be undone.
        </p>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" style="flex: 1;" (click)="cancelDelete()">Cancel</button>
          <button class="btn btn-primary" style="flex: 1; background: var(--color-error); border-color: var(--color-error);" (click)="confirmDelete()" [disabled]="isSubmitting">
            {{ isSubmitting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    
    .custom-multi-select {
      transition: all 0.2s ease;
      position: relative;
    }
    .custom-multi-select:hover {
      border-color: var(--color-primary) !important;
    }
    .custom-multi-select.disabled {
      background-color: var(--color-gray-50) !important;
      cursor: not-allowed !important;
      opacity: 0.7;
    }
    .multi-select-dropdown {
      animation: fadeIn 0.2s ease-out;
    }
    .multi-select-item:hover {
      background-color: var(--color-gray-50);
    }
    .checkbox-box.checked {
      background-color: var(--color-primary-light);
      border-color: var(--color-primary) !important;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ResourceModuleComponent implements OnInit {
  router = inject(Router);
  resourceService = inject(ReferralResourceService);
  roleConfig = inject(RoleConfigService);
  roleService = inject(RoleService);
  branchService = inject(BranchService);
  employeeService = inject(EmployeeService);
  notificationService = inject(NotificationService);

  resources: ReferralResource[] = [];
  isLoading = false;
  isSubmitting = false;
  totalResources = 0;
  activeResources = 0;
  totalExternalLinks = 0;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  Math = Math;

  searchQuery = '';
  filterResourceType = '';
  filterOwnerType = '';
  private searchSubject = new Subject<string>();

  resourceTypes = Object.values(ResourceType);
  storageTypes = Object.values(StorageType);

  roles: Role[] = [];
  branches: Branch[] = [];
  activeUsers: any[] = [];
  selectedRoleId: number | null = null;
  selectedBranchId: number | null = null;
  
  showModal = false;
  showDeleteModal = false;
  isEditing = false;
  selectedOwnerIds: number[] = [];
  isUserDropdownOpen = false;
  currentResource: Partial<ReferralResource> = {};
  resourceToDelete: ReferralResource | null = null;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isUserDropdownOpen && !target.closest('.custom-multi-select') && !target.closest('.multi-select-dropdown')) {
      this.isUserDropdownOpen = false;
    }
  }

  toggleUserDropdown(event: Event) {
    if (!this.selectedRoleId || !this.selectedBranchId) return;
    event.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  toggleUserSelection(userId: number) {
    const index = this.selectedOwnerIds.indexOf(userId);
    if (index > -1) {
      this.selectedOwnerIds.splice(index, 1);
    } else {
      this.selectedOwnerIds.push(userId);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedOwnerIds.includes(userId);
  }

  getSelectedUsersNames(): string {
    if (this.selectedOwnerIds.length === 0) return 'Select User';
    
    const selectedUsers = this.activeUsers.filter(u => this.selectedOwnerIds.includes(u.id));
    if (selectedUsers.length === 0) return 'Select User';
    
    const firstUser = selectedUsers[0].name || (selectedUsers[0].firstName + ' ' + (selectedUsers[0].lastName || ''));
    if (selectedUsers.length === 1) return firstUser;
    
    return `${firstUser} + ${selectedUsers.length - 1} others`;
  }

  ngOnInit() {
    this.loadResources();
    this.loadRoles();
    this.loadBranches();
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.loadResources();
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe(roles => {
      this.roles = roles.filter(r => 
        r.name.toUpperCase().includes('REFERRAL') || 
        r.name.toUpperCase().includes('COMPANY')
      );
    });
  }

  loadBranches() {
    this.branchService.getAllBranches().subscribe(branches => {
      this.branches = branches.filter(b => b.status === 'ACTIVE');
    });
  }

  onRoleOrBranchChange() {
    if (this.selectedRoleId) {
      const selectedRole = this.roles.find(r => r.id === Number(this.selectedRoleId));
      if (selectedRole) {
        if (selectedRole.name.toUpperCase().includes('REFERRAL')) {
          this.currentResource.ownerType = OwnerType.REFERRAL;
        } else if (selectedRole.name.toUpperCase().includes('COMPANY')) {
          this.currentResource.ownerType = OwnerType.COMPANY;
        }
      }
    }

    if (this.selectedRoleId && this.selectedBranchId) {
      this.employeeService.getActiveUsersByRoleAndBranch(Number(this.selectedRoleId), Number(this.selectedBranchId)).subscribe(users => {
        this.activeUsers = users;
      });
    } else {
      this.activeUsers = [];
    }
  }

  loadResources() {
    this.isLoading = true;
    this.resourceService.getAllResources(
      this.currentPage, 
      this.pageSize, 
      undefined, 
      this.filterOwnerType || undefined, 
      this.filterResourceType || undefined,
      this.searchQuery || undefined
    ).subscribe({
      next: (res) => {
        this.resources = res.content;
        this.totalResources = res.totalElements;
        this.totalPages = res.totalPages;
        this.activeResources = res.content.filter(r => r.isActive).length;
        this.totalExternalLinks = res.content.filter(r => !!r.externalUrl).length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading resources:', err);
        this.notificationService.error('Failed to load resources');
        this.isLoading = false;
      }
    });
  }

  onSearchChange() {
    this.currentPage = 0;
    this.searchSubject.next(this.searchQuery);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadResources();
  }

  getPageArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterResourceType = '';
    this.filterOwnerType = '';
    this.currentPage = 0;
    this.loadResources();
  }

  getResourceIcon(type: string): string {
    switch (type) {
      case 'DOCUMENT': return 'description';
      case 'IMAGE': return 'image';
      case 'VIDEO': return 'videocam';
      case 'LINK': return 'link';
      case 'SPREADSHEET': return 'table_view';
      case 'PRESENTATION': return 'co_present';
      default: return 'insert_drive_file';
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'DOCUMENT': return 'info';
      case 'IMAGE': return 'warning';
      case 'VIDEO': return 'error';
      case 'LINK': return 'success';
      default: return 'info';
    }
  }

  getAvatarColor(type: string): string {
    switch (type) {
      case 'DOCUMENT': return '#38bdf8';
      case 'IMAGE': return '#fbbf24';
      case 'VIDEO': return '#f87171';
      case 'LINK': return '#34d399';
      default: return '#94a3b8';
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  viewResource(resource: ReferralResource) {
    if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank');
    } else {
      console.log('Resource access request for:', resource.fileName);
      this.notificationService.info('Downloading file...');
    }
  }
  openCreateModal() {
    this.isEditing = false;
    this.selectedRoleId = null;
    this.selectedBranchId = null;
    this.activeUsers = [];
    this.selectedOwnerIds = [];
    this.currentResource = {
      ownerType: OwnerType.REFERRAL,
      resourceType: ResourceType.DOCUMENT,
      storageType: StorageType.GOOGLE_DRIVE,
      isActive: true,
      fileSize: 0,
      mimeType: 'application/octet-stream'
    };
    this.showModal = true;
  }

  openEditModal(resource: ReferralResource) {
    this.isEditing = true;
    this.currentResource = { ...resource };
    this.selectedOwnerIds = [resource.ownerId];
    // Find role and branch for the existing owner to load the dropdowns correctly
    // This part might need more data if not present in resource, but resource has ownerName/Type
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveResource() {
    if (this.selectedOwnerIds.length === 0) {
      this.notificationService.error('Please select at least one user');
      return;
    }

    const requestTemplate = { ...this.currentResource };
    delete (requestTemplate as any).id; // Remove ID for creates

    this.isSubmitting = true;
    
    if (this.isEditing) {
      // Update mode - usually only for one resource
      const request = { ...this.currentResource, ownerId: this.selectedOwnerIds[0] } as any;
      this.resourceService.updateResource(request.id, request).subscribe({
        next: () => {
          this.notificationService.success('Resource updated successfully');
          this.loadResources();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: () => {
          this.notificationService.error('Failed to update resource');
          this.isSubmitting = false;
        }
      });
    } else {
      // Create mode - send multiple ownerIds in a single request as per new API spec
      const request: ReferralResourceRequest = {
        ...requestTemplate as any,
        ownerIds: this.selectedOwnerIds
      };

      this.resourceService.createResource(request).subscribe({
        next: () => {
          this.notificationService.success('Resource(s) created successfully');
          this.loadResources();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Failed to create resource:', err);
          this.notificationService.error('Failed to create resource');
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteResource(resource: ReferralResource) {
    this.resourceToDelete = resource;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.resourceToDelete = null;
  }

  confirmDelete() {
    if (!this.resourceToDelete) return;
    this.isSubmitting = true;
    this.resourceService.deleteResource(this.resourceToDelete.id).subscribe({
      next: () => {
        this.notificationService.success('Resource deleted successfully');
        this.showDeleteModal = false;
        this.resourceToDelete = null;
        this.isSubmitting = false;
        this.loadResources();
      },
      error: () => {
        this.notificationService.error('Failed to delete resource');
        this.isSubmitting = false;
      }
    });
  }
}
