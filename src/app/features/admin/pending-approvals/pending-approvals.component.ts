import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/services/role.service';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    .admin-container {
      padding: 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }
    .header-section {
      background: white;
      padding: 1.5rem 2rem;
      border-radius: var(--radius-lg);
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid var(--color-gray-200);
    }
    .page-title { margin: 0; font-size: 1.75rem; font-weight: 600; color: var(--color-gray-900); }
    
    .approval-card {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-gray-200);
      margin-bottom: 2rem;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-normal);
    }
    .approval-card:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--color-gray-300);
    }
    
    .card-header {
      padding: 1.25rem 2rem;
      background: var(--color-gray-50);
      border-bottom: 1px solid var(--color-gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-body {
      padding: 2rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
    }
    
    @media (max-width: 768px) {
      .card-body { grid-template-columns: 1fr; }
      .admin-container { padding: 1rem; }
      .header-section { flex-direction: column; align-items: flex-start; gap: 1rem; padding: 1.25rem; }
    }
    
    .detail-item { margin-bottom: 1.25rem; }
    .detail-label { 
      font-size: 0.75rem; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
      color: var(--color-gray-500);
      margin-bottom: 0.375rem;
      font-weight: 600;
    }
    .detail-value { font-size: 0.95rem; color: var(--color-gray-900); font-weight: 500; }
    
    .action-panel {
      background: var(--color-gray-50);
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-gray-200);
    }
    
    .status-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      background: #fffaeb;
      color: #b54708;
      border: 1px solid #fede87;
      border-radius: 6px;
    }

    .btn-reject {
      color: #b42318;
      background: white;
      border: 1px solid #fecdca;
      box-shadow: var(--shadow-xs);
    }
    .btn-reject:hover:not(:disabled) {
      background: #fef3f2;
      border-color: #fda29b;
    }

    .form-label {
      font-weight: 500;
      color: var(--color-gray-700);
      margin-bottom: 0.375rem;
      display: block;
    }

    .form-control {
      background: white;
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-md);
      padding: 0.625rem 0.875rem;
      font-size: 0.95rem;
      color: var(--color-gray-900);
      width: 100%;
      outline: none;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-fast);
    }
    .form-control:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-primary-light);
    }
    
    .empty-state-container { padding: 4rem 2rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--color-gray-300); text-align: center; display: flex; justify-content: center; align-items: center; margin-bottom: 2rem; width: 100%; }
    .empty-state-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .empty-icon { font-size: 3rem; color: var(--color-gray-300); margin-bottom: 0.5rem; }
    .empty-state-content h3 { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-800); margin: 0; }
    .empty-state-content p { color: var(--color-gray-500); margin: 0; font-size: 0.875rem; max-width: 300px; }
  `]
,
  template: `
    <div class="admin-container">
      <div class="header-section">
        <div>
          <h2 class="page-title">Registration Requests</h2>
          <p class="text-muted text-sm mt-1">Review and manage employee access requests</p>
        </div>
        <a routerLink="/admin" class="btn btn-outline">
          <span class="material-icons" style="font-size: 18px;">arrow_back</span>
          Dashboard
        </a>
      </div>

      <div class="empty-state-container" *ngIf="pendingUsers.length === 0">
        <div class="empty-state-content">
          <span class="material-icons empty-icon">pending_actions</span>
          <h3>No Pending Approvals</h3>
          <p>There are currently no items pending approval. You're all caught up!</p>
        </div>
      </div>

      <div *ngFor="let user of pendingUsers" class="approval-card">
        <div class="card-header">
          <div class="d-flex align-items-center">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-light); 
                       color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-right: 1rem; border: 1px solid var(--color-primary-border);">
              <span class="material-icons">person</span>
            </div>
            <div>
              <h4 class="mb-0" style="font-size: 1.1rem; color: var(--color-gray-900);">{{ user.name }}</h4>
              <p class="text-sm text-muted mb-0">{{ user.email }}</p>
            </div>
          </div>
          <span class="status-badge">Review Required</span>
        </div>

        <div class="card-body">
          <div class="details-section">
            <h5 class="mb-3 text-sm" style="color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.05em;">Application Details</h5>
            
            <div class="detail-item">
              <div class="detail-label">Requested Role</div>
              <div class="detail-value">{{ user.employeeType }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Phone Number</div>
              <div class="detail-value">{{ user.dialCode }} {{ user.phone }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Experience</div>
              <div class="detail-value">{{ user.experience || 'Not specified' }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Statement</div>
              <div class="detail-value text-sm text-muted" style="line-height: 1.5;">
                {{ user.notes || 'No additional notes provided.' }}
              </div>
            </div>
          </div>
          
          <div class="action-panel">
            <h5 class="mb-3 text-sm" style="text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-gray-700);">Onboarding Assignment</h5>
            
            <div class="form-group mb-3">
              <label class="form-label text-sm">System Role</label>
              <select class="form-control" [(ngModel)]="assignmentMap[user.id].role">
                <option *ngFor="let role of roles" [value]="role.name">{{ role.displayName || role.name }}</option>
              </select>
            </div>
            
            <div class="form-group mb-4">
              <label class="form-label text-sm">Assign to Branch</label>
              <input type="text" class="form-control" [(ngModel)]="assignmentMap[user.id].branch" placeholder="Enter branch name...">
            </div>

            <div class="d-flex" style="gap: 12px;">
              <button class="btn btn-primary" style="flex: 2" (click)="approve(user.id)" [disabled]="loadingId === user.id">
                <span *ngIf="loadingId !== user.id">Approve Account</span>
                <span *ngIf="loadingId === user.id">Processing...</span>
              </button>
              <button class="btn btn-reject" style="flex: 1" (click)="reject(user.id)">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PendingApprovalsComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private roleService = inject(RoleService);

  pendingUsers: User[] = [];
  assignmentMap: Record<string, { role: User['role'], isSenior: boolean, branch: string }> = {};
  loadingId: string | null = null;
  roles: Role[] = [];

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers() {
    const allUsers = this.authService.getUsers();
    this.pendingUsers = allUsers.filter(u => u.status === 'PENDING_APPROVAL');

    this.pendingUsers.forEach(u => {
      this.assignmentMap[u.id] = {
        role: 'Employee',
        isSenior: false,
        branch: ''
      };
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

  approve(userId: string) {
    this.loadingId = userId;
    const assignment = this.assignmentMap[userId];

    this.authService.approveUser(userId, assignment.role, assignment.branch).subscribe(() => {
      this.loadingId = null;
      this.notificationService.success('Account approved and assigned successfully!');
      this.loadUsers();
    });
  }

  reject(userId: string) {
    if (confirm('Are you sure you want to reject this request? This action cannot be undone.')) {
      // In a real app, you'd call a reject endpoint. For now, we'll just remove them from the mock list.
      const users = this.authService.getUsers();
      const updated = users.filter(u => u.id !== userId);
      this.authService.saveUsers(updated);
      this.notificationService.info('Application rejected.');
      this.loadUsers();
    }
  }
}
