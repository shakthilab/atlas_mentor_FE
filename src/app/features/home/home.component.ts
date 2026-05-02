import { Component, inject, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

declare const lucide: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="task-card-premium">
      <div class="card-title-wrap">
        <i data-lucide="list-todo" class="card-title-icon"></i>
        <span class="card-title-text">My Tasks</span>
      </div>

      <!-- IN PROGRESS GROUP -->
      <div class="task-group">
        <div class="task-group-header">
           <i data-lucide="chevron-up" style="width: 16px; height: 16px; opacity: 0.5;"></i>
           <span class="group-status-badge">IN PROGRESS</span>
           <span class="dot" style="width: 4px; height: 4px; background: #94a3b8; border-radius: 50%;"></span>
           <span class="group-meta">3 tasks</span>
        </div>

        <table class="task-table-premium">
          <thead>
            <tr>
              <th style="width: 60%">Name</th>
              <th style="width: 20%">Priority</th>
              <th style="width: 20%; text-align: right;">Due date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of inProgressTasks" class="task-item-row">
              <td>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <i data-lucide="chevron-down" style="width: 16px; height: 16px; opacity: 0.3;"></i>
                  <input type="checkbox" style="width: 18px; height: 18px; border-radius: 4px; border: 2px solid #e2e8f0; appearance: none; cursor: pointer; background: white;">
                  <div [style.background]="task.color" style="width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0;"></div>
                  <span style="font-weight: 500; font-size: 0.9375rem; color: #334155;">{{ task.name }}</span>
                </div>
              </td>
              <td>
                <span class="priority-badge" [ngClass]="'priority-' + task.priority.toLowerCase()">
                  {{ task.priority }}
                </span>
              </td>
              <td style="text-align: right; color: #f43f5e; font-weight: 600; font-size: 0.875rem;">
                {{ task.dueDate }}
              </td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 1.5rem 0;">
                <button style="background: none; border: none; color: #94a3b8; font-size: 0.875rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                  <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
                  Add task
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TO DO GROUP -->
      <div class="task-group" style="margin-top: 2rem;">
        <div class="task-group-header">
           <i data-lucide="chevron-up" style="width: 16px; height: 16px; opacity: 0.5;"></i>
           <span class="group-status-badge" style="background: #f1f5f9; color: #64748b;">TO DO</span>
           <span class="dot" style="width: 4px; height: 4px; background: #94a3b8; border-radius: 50%;"></span>
           <span class="group-meta">1 task</span>
        </div>

        <table class="task-table-premium">
          <thead>
            <tr>
              <th style="width: 60%">Name</th>
              <th style="width: 20%">Priority</th>
              <th style="width: 20%; text-align: right;">Due date</th>
            </tr>
          </thead>
          <tbody>
            <tr class="task-item-row">
              <td>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <i data-lucide="chevron-down" style="width: 16px; height: 16px; opacity: 0.3;"></i>
                  <input type="checkbox" style="width: 18px; height: 18px; border-radius: 4px; border: 2px solid #e2e8f0; appearance: none; cursor: pointer; background: white;">
                  <div style="width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; background: #e2e8f0;"></div>
                  <span style="font-weight: 500; font-size: 0.9375rem; color: #334155;">Communication with a team</span>
                </div>
              </td>
              <td>
                <span class="priority-badge priority-normal">Normal</span>
              </td>
              <td style="text-align: right; color: #94a3b8; font-weight: 600; font-size: 0.875rem;">
                4 days left
              </td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 1.5rem 0;">
                <button style="background: none; border: none; color: #94a3b8; font-size: 0.875rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                  <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
                  Add task
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: [`
    :host { display: block; }
  `]
})
export class HomeComponent implements AfterViewInit {
  authService = inject(AuthService);
  private router = inject(Router);

  inProgressTasks = [
    { name: 'One-on-One Meeting', priority: 'High', dueDate: 'Today', color: '#0ea5e9' },
    { name: 'Send a summary email to stakeholders', priority: 'Low', dueDate: '3 days left', color: '#a855f7' },
    { name: 'Identify any blockers and plan solutions', priority: 'Low', dueDate: '5 days left', color: '#2dd4bf' }
  ];

  constructor() {
    this.redirectByRole();
  }

  private redirectByRole() {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        const role = user.role?.toUpperCase();
        const isEmployee = user.isEmployee;

        if (isEmployee || role === 'EMPLOYEE' || role === 'SENIOR_COUNSELLOR' || role === 'JUNIOR_COUNSELLOR') {
          this.router.navigate(['/employee']);
        } else {
          switch(role) {
            case 'ADMIN':
              this.router.navigate(['/admin']);
              break;
            case 'STUDENT':
              this.router.navigate(['/student']);
              break;
            case 'MANAGER':
              this.router.navigate(['/manager']);
              break;
            case 'COMPANY':
              this.router.navigate(['/company']);
              break;
            case 'REFERRAL':
              this.router.navigate(['/referral']);
              break;
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    this.initIcons();
  }

  private initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}
