import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskBundleService, TaskBundle, BundleFilter, ScheduleType, BundleStatus } from '../../../../core/services/task-bundle.service';
import { RoleService, Role } from '../../../../core/services/role.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-task-bundle-manage-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content manage-modal" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="modal-header">
          <div class="header-title-group">
            <div class="icon-container">
              <span class="material-icons manage-icon">account_tree</span>
            </div>
            <div>
              <h2 class="modal-title">Task Bundles</h2>
              <p class="modal-subtitle">Manage and schedule automated workflow bundles</p>
            </div>
          </div>
          <button class="btn-close" (click)="onClose()" title="Close">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body">
          <!-- Filters Section -->
          <div class="filters-wrapper">
            <div class="search-container">
              <span class="material-icons search-icon">search</span>
              <input type="text" [(ngModel)]="filters.search" (input)="loadBundles()" placeholder="Search bundles by name...">
            </div>
            <div class="select-wrapper">
              <span class="material-icons select-icon">group</span>
              <select class="filter-select" [(ngModel)]="filters.roleId" (change)="loadBundles()">
                <option value="">All Roles</option>
                <option *ngFor="let role of roles" [value]="role.id">{{ role.name }}</option>
              </select>
            </div>
            <div class="select-wrapper">
              <span class="material-icons select-icon">toggle_on</span>
              <select class="filter-select" [(ngModel)]="filters.status" (change)="loadBundles()">
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div class="select-wrapper">
              <span class="material-icons select-icon">event_repeat</span>
              <select class="filter-select" [(ngModel)]="filters.scheduleType" (change)="loadBundles()">
                <option value="">All Schedules</option>
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="ONE_TIME">ONE TIME</option>
              </select>
            </div>
          </div>

          <!-- Bundles Table -->
          <div class="table-card shadow-sm">
            <div *ngIf="loading" class="loading-overlay">
              <div class="spinner"></div>
              <p>Loading bundles...</p>
            </div>

            <div *ngIf="!loading && bundles.length === 0" class="empty-state">
              <div class="empty-icon-wrap">
                <span class="material-icons">inventory_2</span>
              </div>
              <h3>No bundles found</h3>
              <p>Try adjusting your filters or create a new bundle.</p>
              <button class="btn btn-outline-primary mt-3" (click)="onCreateNew()">Create Bundle</button>
            </div>

            <div class="table-responsive" *ngIf="!loading && bundles.length > 0">
              <table class="premium-table">
                <thead>
                  <tr>
                    <th>Bundle Info</th>
                    <th>Role</th>
                    <th>Schedule</th>
                    <th>Tasks</th>
                    <th>Status</th>
                    <th class="actions-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let bundle of bundles">
                    <td>
                      <div class="info-cell">
                        <div class="info-icon">
                          <span class="material-icons">view_module</span>
                        </div>
                        <div class="info-text">
                          <span class="main-text">{{ bundle.name }}</span>
                          <span class="sub-text" *ngIf="bundle.description">{{ bundle.description }}</span>
                        </div>
                      </div>
                    </td>
                    <td><span class="role-badge">{{ bundle.roleName || 'N/A' }}</span></td>
                    <td>
                      <div class="schedule-cell">
                        <span class="schedule-badge">{{ bundle.formattedScheduleType || bundle.schedule?.scheduleType || bundle.scheduleType || 'N/A' }}</span>
                        <span class="schedule-time" *ngIf="bundle.nextExecutionAt || bundle.schedule?.executionTime || bundle.executionTime">
                          {{ bundle.nextExecutionAt ? (bundle.nextExecutionAt | date:'mediumDate') + ' ' + (bundle.nextExecutionAt | date:'shortTime') : (bundle.schedule?.executionTime || bundle.executionTime) }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div class="task-count-pill">
                        <span class="count-num">{{ bundle.activeTaskCount ?? bundle.totalTasks ?? 0 }}</span>
                        <span class="count-label">Tasks</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill" [ngClass]="(bundle.status || '').toLowerCase()">
                        <span class="status-dot"></span>
                        {{ bundle.formattedStatus || bundle.status }}
                      </span>
                    </td>
                    <td class="actions-cell">
                      <div class="action-buttons">
                        <button class="btn-icon outline primary" (click)="onExecute(bundle)" title="Execute Now">
                          <span class="material-icons">play_arrow</span>
                        </button>
                        <button class="btn-icon outline dark" (click)="onEdit(bundle)" title="Edit">
                          <span class="material-icons">edit</span>
                        </button>
                        <button class="btn-icon outline" 
                                [class.success]="bundle.status === 'INACTIVE'" 
                                [class.warning]="bundle.status === 'ACTIVE'"
                                (click)="toggleStatus(bundle)" 
                                [title]="bundle.status === 'ACTIVE' ? 'Deactivate' : 'Activate'">
                          <span class="material-icons">{{ bundle.status === 'ACTIVE' ? 'pause' : 'power_settings_new' }}</span>
                        </button>
                        <button class="btn-icon outline danger" (click)="onDelete(bundle)" title="Delete">
                          <span class="material-icons">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <div class="footer-metrics">
            <div class="metric-item">
              <span class="metric-label">Total</span>
              <span class="metric-value">{{ totalCount }}</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item success">
              <span class="metric-label">Active</span>
              <span class="metric-value">{{ activeCount }}</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item neutral">
              <span class="metric-label">Inactive</span>
              <span class="metric-value">{{ inactiveCount }}</span>
            </div>
          </div>
          <button class="btn btn-primary btn-glow" (click)="onCreateNew()">
            <span class="material-icons">add_circle</span>
            <span>New Bundle</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal Overlay -->
    <div class="modal-overlay" *ngIf="showConfirmModal" (click)="closeConfirmModal()" style="z-index: 2600;">
      <div class="modal-content manage-modal" (click)="$event.stopPropagation()" style="width: 400px; height: auto; padding: 32px; text-align: center; animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
        <div [style.background]="confirmModalBtnClass === 'btn-danger' ? '#fee4e2' : (confirmModalBtnClass === 'btn-warning' ? '#fef0c7' : (confirmModalBtnClass === 'btn-success' ? '#d1fadf' : '#eff6ff'))" 
             [style.color]="confirmModalBtnClass === 'btn-danger' ? '#d92d20' : (confirmModalBtnClass === 'btn-warning' ? '#dc6803' : (confirmModalBtnClass === 'btn-success' ? '#039855' : 'var(--color-primary)'))" 
             style="width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <span class="material-icons" style="font-size: 28px;">{{ confirmModalBtnClass === 'btn-danger' ? 'delete_outline' : (confirmModalBtnClass === 'btn-warning' ? 'power_settings_new' : (confirmModalBtnClass === 'btn-success' ? 'play_circle' : 'bolt')) }}</span>
        </div>
        <h2 style="margin: 0 0 12px; font-size: 1.25rem; color: #0f172a; font-weight: 700;">{{ confirmModalTitle }}</h2>
        <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 32px; line-height: 1.5;">{{ confirmModalMessage }}</p>
        <div style="display: flex; gap: 16px;">
          <button class="btn btn-outline-primary" style="flex: 1;" (click)="closeConfirmModal()">Cancel</button>
          <button class="btn" style="flex: 1;" [ngClass]="confirmModalBtnClass" (click)="executeConfirmAction()" [disabled]="processingAction">
            <span *ngIf="processingAction" class="spinner-small"></span>
            {{ confirmModalBtnText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Layout & Modal Container */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); z-index: 2500; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); padding: 24px; box-sizing: border-box; }
    .manage-modal { width: 100%; max-width: 1280px; height: 90vh; max-height: 900px; background: #ffffff; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; overflow: hidden; animation: modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes modalPop { from { opacity: 0; transform: scale(0.96) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    /* Header */
    .modal-header { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #ffffff; }
    .header-title-group { display: flex; align-items: center; gap: 16px; }
    .icon-container { width: 48px; height: 48px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--color-primary); }
    .icon-container .material-icons { font-size: 24px; }
    .modal-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2; }
    .modal-subtitle { font-size: 0.875rem; color: #64748b; margin: 4px 0 0 0; }
    .btn-close { width: 36px; height: 36px; background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-close:hover { background: #f1f5f9; color: #0f172a; transform: rotate(90deg); }

    /* Body & Filters */
    .modal-body { flex: 1; overflow: hidden; padding: 24px 32px; display: flex; flex-direction: column; background: #f8fafc; }
    
    .filters-wrapper { display: grid; grid-template-columns: minmax(250px, 1fr) auto auto auto; gap: 16px; margin-bottom: 24px; }
    .search-container { position: relative; width: 100%; }
   
    .search-container input { width: 100%; height: 44px; padding: 0 16px 0 44px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.9375rem; color: #0f172a; outline: none; transition: all 0.2s; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.03); box-sizing: border-box; }
    .search-container input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
    .search-container input::placeholder { color: #94a3b8; }

    .select-wrapper { position: relative; display: flex; align-items: center; }
    .select-icon { position: absolute; left: 14px; color: #64748b; font-size: 18px; pointer-events: none; z-index: 1; }
   
   
   

    /* Table Container */
   
    .table-responsive { flex: 1; overflow: auto; }
    
   
   
   
    .premium-table tbody tr:hover td { background: #f8fafc; }
    .premium-table tbody tr:last-child td { border-bottom: none; }

    /* Table Cell Styling */
    .info-cell { display: flex; align-items: center; gap: 14px; }
    .info-icon { width: 40px; height: 40px; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #64748b; flex-shrink: 0; }
    .info-text { display: flex; flex-direction: column; gap: 4px; }
    .main-text { font-weight: 600; color: #0f172a; }
    .sub-text { font-size: 0.75rem; color: #64748b; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .role-badge { display: inline-flex; align-items: center; padding: 4px 10px; background: #f1f5f9; color: #475569; border-radius: 8px; font-size: 0.75rem; font-weight: 600; border: 1px solid #e2e8f0; }
    
    .schedule-cell { display: flex; flex-direction: column; gap: 4px; }
    .schedule-badge { font-weight: 600; color: #334155; }
    .schedule-time { font-size: 0.75rem; color: #64748b; }

    .task-count-pill { display: inline-flex; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; overflow: hidden; font-size: 0.75rem; font-weight: 600; }
    .count-num { background: var(--color-primary); color: white; padding: 4px 10px; }
    .count-label { padding: 4px 10px; color: #1e3a8a; }

    .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; }
    .status-pill.active { background: #ecfdf5; color: #059669; }
    .status-pill.active .status-dot { background: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
    .status-pill.inactive { background: #f1f5f9; color: #64748b; }
    .status-pill.inactive .status-dot { background: #94a3b8; }

    .actions-cell { text-align: right; width: 180px; }
    .action-buttons { display: flex; justify-content: flex-end; gap: 8px; }
    .btn-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: white; border: 1px solid #e2e8f0; color: #64748b; }
    .btn-icon .material-icons { font-size: 18px; }
    .btn-icon:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .btn-icon.primary:hover { color: var(--color-primary); border-color: var(--color-primary); background: #eff6ff; }
    .btn-icon.success:hover { color: #10b981; border-color: #10b981; background: #ecfdf5; }
    .btn-icon.warning:hover { color: #f59e0b; border-color: #f59e0b; background: #fffbeb; }
    .btn-icon.danger:hover { color: #ef4444; border-color: #ef4444; background: #fef2f2; }
    .btn-icon.dark:hover { color: #0f172a; border-color: #0f172a; background: #f8fafc; }

    /* States */
    .loading-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.8); backdrop-filter: blur(4px); z-index: 20; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; font-weight: 500; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
    
    .empty-state { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; z-index: 15; text-align: center; }
    .empty-icon-wrap { width: 80px; height: 80px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: #94a3b8; }
    .empty-icon-wrap .material-icons { font-size: 40px; }
    .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0 0 8px 0; }
    .empty-state p { font-size: 0.875rem; color: #64748b; margin: 0; max-width: 300px; line-height: 1.5; }

    /* Footer */
    .modal-footer { padding: 20px 32px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #ffffff; }
    .footer-metrics { display: flex; align-items: center; background: #f8fafc; padding: 6px 16px; border-radius: 12px; border: 1px solid #e2e8f0; gap: 16px; }
    .metric-item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; }
    .metric-label { color: #64748b; font-weight: 500; }
    .metric-value { font-weight: 700; color: #0f172a; }
    .metric-divider { width: 1px; height: 20px; background: #e2e8f0; }
    .metric-item.success .metric-value { color: #059669; }
    .metric-item.neutral .metric-value { color: #64748b; }

    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
    .btn .material-icons { font-size: 20px; }
    .btn-primary { background: var(--color-primary); color: white; }
    .btn-primary:hover { background: var(--color-primary-hover, #2563eb); transform: translateY(-1px); }
    .btn-glow { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
    .btn-outline-primary { background: transparent; border: 1px solid var(--color-primary); color: var(--color-primary); }
    .btn-outline-primary:hover { background: #eff6ff; }
    .mt-3 { margin-top: 16px; }

    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover { background: #dc2626; transform: translateY(-1px); }
    .btn-warning { background: #f59e0b; color: white; }
    .btn-warning:hover { background: #d97706; transform: translateY(-1px); }
    .btn-success { background: #10b981; color: white; }
    .btn-success:hover { background: #059669; transform: translateY(-1px); }
    .spinner-small { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Responsive */
    @media (max-width: 1024px) {
      .filters-wrapper { grid-template-columns: 1fr 1fr 1fr; }
      .search-container { grid-column: 1 / -1; }
      .manage-modal { height: 95vh; border-radius: 16px; }
    }
    
    @media (max-width: 768px) {
      .filters-wrapper { grid-template-columns: 1fr; gap: 12px; }
      .modal-header, .modal-body, .modal-footer { padding: 16px 20px; }
      .header-title-group { gap: 12px; }
      .icon-container { width: 40px; height: 40px; }
      .icon-container .material-icons { font-size: 20px; }
      .modal-title { font-size: 1.125rem; }
      .footer-metrics { display: none; } /* Hide metrics on small mobile to save space */
      .btn-primary { width: 100%; }
      .modal-footer { flex-direction: column; gap: 16px; }
    }
  `]
})
export class TaskBundleManageModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<TaskBundle>();
  @Output() create = new EventEmitter<void>();

  private bundleService = inject(TaskBundleService);
  private roleService = inject(RoleService);
  private notification = inject(NotificationService);

  bundles: TaskBundle[] = [];
  roles: Role[] = [];
  loading = true;
  totalCount = 0;
  activeCount = 0;
  inactiveCount = 0;
  filters: BundleFilter = {
    search: '',
    roleId: '',
    status: '',
    scheduleType: ''
  };

  showConfirmModal = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalBtnText = '';
  confirmModalBtnClass = '';
  processingAction = false;
  private pendingAction: (() => void) | null = null;

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.pendingAction = null;
  }

  executeConfirmAction() {
    if (this.pendingAction) {
      this.processingAction = true;
      this.pendingAction();
    }
  }

  ngOnInit() {
    this.loadRoles();
    this.loadBundles();
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (roles: Role[]) => this.roles = roles,
      error: () => this.notification.error('Failed to load roles')
    });
  }

  loadBundles() {
    this.loading = true;
    this.bundleService.getBundles(this.filters).subscribe({
      next: (response: any) => {
        this.bundles = response.content || (Array.isArray(response) ? response : []);
        this.totalCount = response.totalCount ?? this.bundles.length;
        this.activeCount = response.activeCount ?? this.bundles.filter((b: any) => b.status === 'ACTIVE').length;
        this.inactiveCount = response.inactiveCount ?? this.bundles.filter((b: any) => b.status === 'INACTIVE').length;
        this.loading = false;
      },
      error: (err: any) => {
        this.notification.error('Failed to load bundles');
        this.loading = false;
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  onCreateNew() {
    this.create.emit();
  }

  onEdit(bundle: TaskBundle) {
    this.edit.emit(bundle);
  }

  toggleStatus(bundle: TaskBundle) {
    const isActivating = bundle.status === 'INACTIVE';
    
    this.confirmModalTitle = isActivating ? 'Activate Bundle' : 'Deactivate Bundle';
    this.confirmModalMessage = isActivating 
      ? `Are you sure you want to activate "${bundle.name}"? It will resume its scheduled execution.` 
      : `Are you sure you want to deactivate "${bundle.name}"? It will stop executing automatically.`;
    this.confirmModalBtnText = isActivating ? 'Activate' : 'Deactivate';
    this.confirmModalBtnClass = isActivating ? 'btn-success' : 'btn-warning';
    
    this.pendingAction = () => {
      const request = isActivating 
        ? this.bundleService.activateBundle(bundle.id!) 
        : this.bundleService.deactivateBundle(bundle.id!);

      request.subscribe({
        next: () => {
          this.processingAction = false;
          this.closeConfirmModal();
          this.notification.success(`Bundle ${isActivating ? 'activated' : 'deactivated'} successfully`);
          this.loadBundles();
        },
        error: (err: any) => {
          this.processingAction = false;
          this.closeConfirmModal();
          this.notification.error(err.message || 'Action failed');
        }
      });
    };
    this.showConfirmModal = true;
  }

  onExecute(bundle: TaskBundle) {
    this.confirmModalTitle = 'Execute Bundle Now';
    this.confirmModalMessage = `Are you sure you want to immediately execute "${bundle.name}"? This will run all tasks associated with this bundle right away.`;
    this.confirmModalBtnText = 'Execute';
    this.confirmModalBtnClass = 'btn-primary';

    this.pendingAction = () => {
      this.bundleService.executeBundle(bundle.id!).subscribe({
        next: () => {
          this.processingAction = false;
          this.closeConfirmModal();
          this.notification.success('Bundle execution triggered successfully');
        },
        error: (err: any) => {
          this.processingAction = false;
          this.closeConfirmModal();
          this.notification.error(err.message || 'Execution failed');
        }
      });
    };
    this.showConfirmModal = true;
  }

  onDelete(bundle: TaskBundle) {
    this.confirmModalTitle = 'Delete Task Bundle';
    this.confirmModalMessage = `Are you sure you want to delete "${bundle.name}"? This action cannot be undone.`;
    this.confirmModalBtnText = 'Delete';
    this.confirmModalBtnClass = 'btn-danger';

    this.pendingAction = () => {
      this.bundleService.deleteBundle(bundle.id!).subscribe({
        next: () => {
          this.processingAction = false;
          this.closeConfirmModal();
          this.notification.success('Bundle deleted successfully');
          this.loadBundles();
        },
        error: (err: any) => {
          this.processingAction = false;
          this.closeConfirmModal();
          this.notification.error(err.message || 'Delete failed');
        }
      });
    };
    this.showConfirmModal = true;
  }
}
