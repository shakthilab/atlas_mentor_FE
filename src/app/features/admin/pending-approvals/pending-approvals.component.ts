import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/services/role.service';

import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EmptyStateComponent],
  styles: [`
    :host { display: block; width: 100%; }
    .approval-meta { display: flex; align-items: center; gap: 1rem; }
    .approval-actions { display: flex; gap: 0.5rem; }
  `]
,
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">Registration Requests</h1>
          <p class="page-subtitle">Review and manage employee access requests</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" routerLink="/admin">
            <span class="material-icons">dashboard</span>
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      <app-empty-state 
        *ngIf="pendingUsers.length === 0"
        title="No Pending Approvals"
        message="There are currently no items pending approval. You're all caught up!">
      </app-empty-state>

      <div class="table-card" *ngIf="pendingUsers.length > 0">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Requested Role</th>
                <th>Experience / Statement</th>
                <th>Onboarding Details</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of pendingUsers">
                <td>
                  <div class="entity-meta">
                    <div class="avatar-circle" [style.background]="getAvatarColor(user.name)">
                      {{ getInitials(user.name) }}
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ user.name }}</span>
                      <span class="entity-subtext">{{ user.email }} • {{ user.phone }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-status info">{{ user.employeeType }}</span>
                </td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-size: 0.8125rem;">{{ user.experience || 'Newcomer' }}</span>
                    <span class="entity-subtext" style="max-width: 240px; white-space: normal;">{{ user.notes || 'No statement provided.' }}</span>
                  </div>
                </td>
                <td>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 200px;">
                    <div class="form-group" style="margin-bottom: 0;">
                      <select class="filter-select" style="width: 100%;" [(ngModel)]="assignmentMap[user.id].role">
                        <option *ngFor="let role of roles" [value]="role.name">{{ role.displayName || role.name }}</option>
                      </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                      <input type="text" class="filter-select" style="width: 100%;" [(ngModel)]="assignmentMap[user.id].branch" placeholder="Branch name...">
                    </div>
                  </div>
                </td>
                <td style="text-align: right;">
                  <div class="action-btns">
                    <button class="btn btn-primary btn-sm" (click)="approve(user.id)" [disabled]="loadingId === user.id">
                      <span *ngIf="loadingId !== user.id">Approve</span>
                      <span *ngIf="loadingId === user.id">...</span>
                    </button>
                    <button class="btn btn-secondary btn-sm" style="color: var(--color-error); border-color: #fecdca;" (click)="reject(user.id)">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
