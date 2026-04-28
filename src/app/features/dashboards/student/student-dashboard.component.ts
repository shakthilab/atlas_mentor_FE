import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-card">
      <div class="card-header">
        <h2 class="card-title">
           <span class="material-icons" style="color: #6366f1; margin-right: 8px;">assignment</span>
           My Tasks
        </h2>
      </div>

      <div class="task-tabs" style="display: flex; gap: 1rem; margin: 1.5rem 0 2.5rem 0;">
        <button class="tab active">
          IN PROGRESS 
          <span class="dot" style="background: #14b8a6;"></span>
          <span class="count">3 tasks</span>
        </button>
        <button class="tab">
          TO DO
          <span class="dot" style="background: #64748b;"></span>
          <span class="count">1 task</span>
        </button>
      </div>

      <div class="table-container shadow-premium">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Priority</th>
              <th style="text-align: right;">Due date</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of inProgressTasks" class="task-row">
              <td>
                <div class="task-title-cell">
                  <span class="material-icons expand-icon">keyboard_arrow_down</span>
                  <input type="checkbox" class="task-checkbox">
                  <span class="project-dot" [style.background]="task.color"></span>
                  <span class="task-name">{{ task.name }}</span>
                </div>
              </td>
              <td>
                <span class="priority-pill" [ngClass]="'priority-' + task.priority.toLowerCase()">
                  {{ task.priority }}
                </span>
              </td>
              <td style="text-align: right; color: var(--color-error); font-weight: 600;">
                {{ task.dueDate }}
              </td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 1.5rem;">
                <button class="btn-add-task">+ Add task</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      padding: 0.5rem 0.875rem;
      border-radius: 0.5rem;
      font-size: 0.7rem;
      font-weight: 800;
      color: #64748b;
      cursor: pointer;
      background: #f8fafc;
      transition: all 0.2s;
    }
    .tab.active { background: #ccfbf1; color: #0d9488; }
    .tab .dot { width: 6px; height: 6px; border-radius: 50%; }
    .tab .count { opacity: 0.6; font-weight: 500; }
    
    .task-title-cell { display: flex; align-items: center; gap: 1rem; }
    .expand-icon { color: var(--color-gray-300); font-size: 18px; cursor: pointer; }
    .task-name { font-weight: 500; font-size: 0.9375rem; color: var(--color-gray-700); }
    
    .task-row { border-bottom: 1px solid var(--color-gray-50); }
    .btn-add-task {
      background: none;
      border: none;
      color: var(--color-gray-400);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
      transition: color var(--transition-fast);
    }
    .btn-add-task:hover { color: var(--color-primary); }
    .project-dot { width: 10px; height: 10px; border-radius: 3px; }
    .task-checkbox {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1.5px solid var(--color-gray-300);
      appearance: none;
      cursor: pointer;
      background: white;
      transition: all var(--transition-fast);
    }
    .task-checkbox:checked {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }
    .priority-pill {
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .priority-high { background: #fee2e2; color: #ef4444; }
    .priority-low { background: #f1f5f9; color: #64748b; }
    .priority-normal { background: #e0f2fe; color: #0ea5e9; }
  `]
})
export class StudentDashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  inProgressTasks = [
    { name: 'One-on-One Meeting', priority: 'High', dueDate: 'Today', color: '#0ea5e9' },
    { name: 'Send a summary email to stakeholders', priority: 'Low', dueDate: '3 days left', color: '#a855f7' },
    { name: 'Identify any blockers and plan solutions', priority: 'Low', dueDate: '5 days left', color: '#2dd4bf' }
  ];
}
