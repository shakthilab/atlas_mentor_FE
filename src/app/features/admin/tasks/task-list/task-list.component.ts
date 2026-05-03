import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService, Task, TaskFilter, CreateTaskRequest, ApiError, TaskComment, Activity } from '../../../../core/services/task.service';
import { EmployeeService, Employee } from '../../../../core/services/employee.service';
import { RoleService, Role } from '../../../../core/services/role.service';
import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../core/models/branch.model';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { TaskDetailPanelComponent } from '../components/task-detail-panel/task-detail-panel.component';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RoleConfigService } from '../../../../core/services/role-config.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule, EmptyStateComponent, TaskDetailPanelComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">Tasks</h1>
          <p class="page-subtitle">Track and manage student processing workflows.</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher">
            <button class="switcher-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="List View">
              <span class="material-icons">list</span>
              <span>List</span>
            </button>
            <button class="switcher-btn" [class.active]="viewMode === 'board'" (click)="viewMode = 'board'" title="Board View">
              <span class="material-icons">dashboard</span>
              <span>Board</span>
            </button>
          </div>
          <button class="btn btn-primary" (click)="openCreateModal()" *ngIf="roleConfig.getCurrentUserRole() !== 'JUNIOR_COUNSELLOR'">
            <span class="material-icons">add</span>
            <span>Create Task</span>
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search tasks..." [(ngModel)]="searchQuery" (input)="applyFilters()">
        </div>
        <div class="filter-actions">
          <div class="filter-dropdown">
            <select class="filter-select" [(ngModel)]="filterStatus" (change)="applyFilters()">
              <option value="">All Statuses</option>
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <span class="material-icons dropdown-chevron">expand_more</span>
          </div>
          <div class="filter-dropdown">
            <select class="filter-select" [(ngModel)]="filterPriority" (change)="applyFilters()">
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <span class="material-icons dropdown-chevron">expand_more</span>
          </div>
          <button class="btn-icon-secondary" [class.active]="showAdvancedFilters" (click)="showAdvancedFilters = !showAdvancedFilters">
            <span class="material-icons">tune</span>
          </button>
        </div>
      </div>

      <!-- Advanced Filters (Date Range) -->
      <div class="advanced-filters-panel" [class.show]="showAdvancedFilters">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Due Date From</label>
            <input type="date" [(ngModel)]="dueDateFrom" (change)="applyFilters()">
          </div>
          <div class="filter-group">
            <label>Due Date To</label>
            <input type="date" [(ngModel)]="dueDateTo" (change)="applyFilters()">
          </div>
          <div class="filter-group">
            <label>Assigned From</label>
            <input type="date" [(ngModel)]="assignedDateFrom" (change)="applyFilters()">
          </div>
          <div class="filter-group">
            <label>Assigned To</label>
            <input type="date" [(ngModel)]="assignedDateTo" (change)="applyFilters()">
          </div>
          <div class="filter-group">
            <label>&nbsp;</label>
            <button class="btn-ghost-sm" (click)="clearAdvancedFilters()">Clear All</button>
          </div>
        </div>
      </div>

      <app-empty-state 
        *ngIf="inProgressTasks.length === 0 && todoTasks.length === 0 && doneTasks.length === 0"
        title="No Tasks Found"
        message="There are currently no tasks assigned."
        [showAction]="roleConfig.getCurrentUserRole() !== 'JUNIOR_COUNSELLOR'"
        actionText="Create Task"
        (actionClick)="openCreateModal()">
      </app-empty-state>

      <!-- View: List -->
      <div class="task-list-wrapper" *ngIf="viewMode === 'list' && !loading && tasks.length > 0">
        <!-- Group: In Progress -->
        <div class="group-section" *ngIf="inProgressTasks.length > 0">
          <div class="group-header in-progress">
            <div class="group-title-wrap">
              <span class="material-icons collapse-icon">expand_more</span>
              <h2 class="group-title">In Progress</h2>
              <span class="group-count">{{ inProgressTasks.length }}</span>
            </div>
          </div>

          <div class="cards-container">
            <div *ngFor="let task of inProgressTasks" class="task-card-row" (click)="viewTaskDetails(task)">
              <div class="card-content-wrap">
                <div class="check-box" (click)="$event.stopPropagation()">
                  <span class="material-icons-outlined">radio_button_unchecked</span>
                </div>
                
                <div class="task-main-info">
                  <h4 class="task-title">{{ task.title }}</h4>
                  <p class="task-description">{{ task.description }}</p>
                </div>

                <div class="task-metadata">
                  <div class="meta-item date">
                    <span class="material-icons-outlined">calendar_today</span>
                    <span>{{ task.dueDate }}</span>
                  </div>

                  <div class="meta-item priority" (click)="$event.stopPropagation()">
                    <div class="priority-badge" [ngClass]="task.priority.toLowerCase()">
                      <span class="priority-dot"></span>
                      <span>{{ task.priority }}</span>
                    </div>
                  </div>

                  <div class="meta-item status" (click)="$event.stopPropagation()">
                    <div class="status-badge in-progress">
                      {{ task.status }}
                    </div>
                  </div>

                  <div class="meta-item comments">
                    <span class="material-icons-outlined">chat_bubble_outline</span>
                    <span>{{ task.comments || 0 }}</span>
                  </div>

                  <div class="meta-item assignee">
                    <div class="avatar-circle" [style.background]="getAvatarColor(task.assigneeName || task.assignee)" [attr.title]="task.assigneeName || task.assignee || 'Unassigned'">
                      {{ getInitials(task.assigneeName || task.assignee) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Group: To Do -->
        <div class="group-section mt-4" *ngIf="todoTasks.length > 0">
          <div class="group-header todo">
            <div class="group-title-wrap">
              <span class="material-icons collapse-icon">expand_more</span>
              <h2 class="group-title">To Do</h2>
              <span class="group-count">{{ todoTasks.length }}</span>
            </div>
          </div>

          <div class="cards-container">
            <div *ngFor="let task of todoTasks" class="task-card-row" (click)="viewTaskDetails(task)">
              <div class="card-content-wrap">
                <div class="check-box" (click)="$event.stopPropagation()">
                  <span class="material-icons-outlined">radio_button_unchecked</span>
                </div>
                
                <div class="task-main-info">
                  <h4 class="task-title">{{ task.title }}</h4>
                  <p class="task-description">{{ task.description }}</p>
                </div>

                <div class="task-metadata">
                  <div class="meta-item date">
                    <span class="material-icons-outlined">calendar_today</span>
                    <span>{{ task.dueDate }}</span>
                  </div>

                  <div class="meta-item priority" (click)="$event.stopPropagation()">
                    <div class="priority-badge" [ngClass]="task.priority.toLowerCase()">
                      <span class="priority-dot"></span>
                      <span>{{ task.priority }}</span>
                    </div>
                  </div>

                  <div class="meta-item status" (click)="$event.stopPropagation()">
                    <div class="status-badge todo">
                      {{ task.status }}
                    </div>
                  </div>

                  <div class="meta-item comments">
                    <span class="material-icons-outlined">chat_bubble_outline</span>
                    <span>{{ task.comments || 0 }}</span>
                  </div>

                  <div class="meta-item assignee">
                    <div class="avatar-circle" [style.background]="getAvatarColor(task.assigneeName || task.assignee)" [attr.title]="task.assigneeName || task.assignee || 'Unassigned'">
                      {{ getInitials(task.assigneeName || task.assignee) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Group: Done -->
        <div class="group-section mt-4" *ngIf="doneTasks.length > 0">
          <div class="group-header done">
            <div class="group-title-wrap">
              <span class="material-icons collapse-icon">expand_more</span>
              <h2 class="group-title">Done</h2>
              <span class="group-count">{{ doneTasks.length }}</span>
            </div>
          </div>

          <div class="cards-container">
            <div *ngFor="let task of doneTasks" class="task-card-row" (click)="viewTaskDetails(task)">
              <div class="card-content-wrap">
                <div class="check-box" (click)="$event.stopPropagation()">
                  <span class="material-icons-outlined">radio_button_unchecked</span>
                </div>
                
                <div class="task-main-info">
                  <h4 class="task-title">{{ task.title }}</h4>
                  <p class="task-description">{{ task.description }}</p>
                </div>

                <div class="task-metadata">
                  <div class="meta-item date">
                    <span class="material-icons-outlined">calendar_today</span>
                    <span>{{ task.dueDate }}</span>
                  </div>

                  <div class="meta-item priority" (click)="$event.stopPropagation()">
                    <div class="priority-badge" [ngClass]="task.priority.toLowerCase()">
                      <span class="priority-dot"></span>
                      <span>{{ task.priority }}</span>
                    </div>
                  </div>

                  <div class="meta-item status" (click)="$event.stopPropagation()">
                    <div class="status-badge done">
                      {{ task.status }}
                    </div>
                  </div>

                  <div class="meta-item comments">
                    <span class="material-icons-outlined">chat_bubble_outline</span>
                    <span>{{ task.comments || 0 }}</span>
                  </div>

                  <div class="meta-item assignee">
                    <div class="avatar-circle" [style.background]="getAvatarColor(task.assigneeName || task.assignee)" [attr.title]="task.assigneeName || task.assignee || 'Unassigned'">
                      {{ getInitials(task.assigneeName || task.assignee) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- View: Board (Kanban) -->
      <div class="kanban-wrapper" cdkDropListGroup *ngIf="viewMode === 'board' && !loading && tasks.length > 0">
        <!-- Column: To Do -->
        <div class="kanban-column">
          <div class="column-header">
            <div class="header-left">
              <span class="status-dot todo"></span>
              <h3 class="column-title">To Do</h3>
              <span class="count">{{ todoTasks.length }}</span>
            </div>
            <button class="btn-icon-sm" (click)="openCreateModal()" *ngIf="roleConfig.getCurrentUserRole() !== 'JUNIOR_COUNSELLOR'"><span class="material-icons">add</span></button>
          </div>
          
          <div
            cdkDropList
            [cdkDropListData]="todoTasks"
            (cdkDropListDropped)="drop($event, 'TO_DO')"
            class="kanban-task-list">
            <div *ngFor="let task of todoTasks" cdkDrag class="kanban-task-card" (click)="viewTaskDetails(task)">
              <div class="card-content">
                <h4 class="task-title">{{ task.title }}</h4>
                <p class="task-desc">{{ task.description }}</p>
                
                <div class="card-meta-row">
                  <span class="priority-badge" [ngClass]="task.priority.toLowerCase()">
                    <span class="dot"></span> {{ task.priority }}
                  </span>
                  <div class="assignee-avatar-sm" [style.background]="getAvatarColor(task.assigneeName || task.assignee)" [attr.title]="task.assigneeName || task.assignee || 'Unassigned'">
                    {{ getInitials(task.assigneeName || task.assignee) }}
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <div class="footer-item">
                  <span class="material-icons-outlined">event</span>
                  {{ task.dueDate | date:'MMM d' }}
                </div>
                <div class="footer-item">
                  <span class="material-icons-outlined">chat_bubble_outline</span>
                  {{ task.comments || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Column: In Progress -->
        <div class="kanban-column">
          <div class="column-header">
            <div class="header-left">
              <span class="status-dot in-progress"></span>
              <h3 class="column-title">In Progress</h3>
              <span class="count">{{ inProgressTasks.length }}</span>
            </div>
            <button class="btn-icon-sm" (click)="openCreateModal()" *ngIf="roleConfig.getCurrentUserRole() !== 'JUNIOR_COUNSELLOR'"><span class="material-icons">add</span></button>
          </div>
          
          <div
            cdkDropList
            [cdkDropListData]="inProgressTasks"
            (cdkDropListDropped)="drop($event, 'IN_PROGRESS')"
            class="kanban-task-list">
            <div *ngFor="let task of inProgressTasks" cdkDrag class="kanban-task-card" (click)="viewTaskDetails(task)">
              <div class="card-content">
                <h4 class="task-title">{{ task.title }}</h4>
                <p class="task-desc">{{ task.description }}</p>
                
                <div class="card-meta-row">
                  <span class="priority-badge" [ngClass]="task.priority.toLowerCase()">
                    <span class="dot"></span> {{ task.priority }}
                  </span>
                  <div class="assignee-avatar-sm" [style.background]="getAvatarColor(task.assigneeName || task.assignee)" [attr.title]="task.assigneeName || task.assignee || 'Unassigned'">
                    {{ getInitials(task.assigneeName || task.assignee) }}
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <div class="footer-item">
                  <span class="material-icons-outlined">event</span>
                  {{ task.dueDate | date:'MMM d' }}
                </div>
                <div class="footer-item">
                  <span class="material-icons-outlined">chat_bubble_outline</span>
                  {{ task.comments || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Column: Done -->
        <div class="kanban-column">
          <div class="column-header">
            <div class="header-left">
              <span class="status-dot done"></span>
              <h3 class="column-title">Done</h3>
              <span class="count">{{ doneTasks.length }}</span>
            </div>
            <button class="btn-icon-sm" (click)="openCreateModal()" *ngIf="roleConfig.getCurrentUserRole() !== 'JUNIOR_COUNSELLOR'"><span class="material-icons">add</span></button>
          </div>
          
          <div
            cdkDropList
            [cdkDropListData]="doneTasks"
            (cdkDropListDropped)="drop($event, 'DONE')"
            class="kanban-task-list">
            <div *ngFor="let task of doneTasks" cdkDrag class="kanban-task-card" (click)="viewTaskDetails(task)">
              <div class="card-content">
                <h4 class="task-title">{{ task.title }}</h4>
                <p class="task-desc">{{ task.description }}</p>
                
                <div class="card-meta-row">
                  <span class="priority-badge" [ngClass]="task.priority.toLowerCase()">
                    <span class="dot"></span> {{ task.priority }}
                  </span>
                  <div class="assignee-avatar-sm" [style.background]="getAvatarColor(task.assigneeName || task.assignee)" [attr.title]="task.assigneeName || task.assignee || 'Unassigned'">
                    {{ getInitials(task.assigneeName || task.assignee) }}
                  </div>
                </div>
              </div>
              <div class="card-footer">
                <div class="footer-item">
                  <span class="material-icons-outlined">event</span>
                  {{ task.dueDate | date:'MMM d' }}
                </div>
                <div class="footer-item">
                  <span class="material-icons-outlined">chat_bubble_outline</span>
                  {{ task.comments || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Task Modal -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="closeCreateModal()">
        <div class="modal-content create-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Create task</h2>
            <button class="btn-icon" (click)="closeCreateModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-subtitle">Required fields are marked with an asterisk <span class="text-danger">*</span></p>
            
            <div class="form-group">
              <label>Summary <span class="text-danger">*</span></label>
              <input type="text" class="form-control" placeholder="e.g. Verify academic documents" [(ngModel)]="newTask.title">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="form-control" rows="3" placeholder="Add more details..." [(ngModel)]="newTask.description"></textarea>
            </div>
            <div class="form-row" *ngIf="roleConfig.getCurrentUserRole() !== 'SENIOR_COUNSELLOR'">
              <div class="form-group flex-1">
                <label>Branch</label>
                <select class="form-control" [(ngModel)]="selectedBranchId" (change)="loadEmployees()">
                  <option value="">All Branches</option>
                  <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>Role</label>
                <select class="form-control" [(ngModel)]="selectedRoleId" (change)="loadEmployees()">
                  <option value="">All Roles</option>
                  <option *ngFor="let role of roles" [value]="role.id">{{ role.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Assigned To <span class="text-danger">*</span></label>
              <select class="form-control" [(ngModel)]="newTask.assigneeId" required #assignee="ngModel" [class.is-invalid]="assignee.invalid && assignee.touched">
                <option value="" disabled selected>Select employee...</option>
                <option *ngFor="let emp of employees" [value]="emp.id">
                  {{ emp.name || (emp.firstName + ' ' + (emp.lastName || '')) }}
                </option>
              </select>
              <div class="invalid-feedback" *ngIf="assignee.invalid && assignee.touched">Assignee is required</div>
            </div>
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Priority <span class="text-danger">*</span></label>
                <div class="priority-options">
                  <div class="priority-option" [class.selected]="newTask.priority === 'HIGH'" (click)="newTask.priority = 'HIGH'">
                    <span class="priority-dot high-dot"></span> High
                  </div>
                  <div class="priority-option" [class.selected]="newTask.priority === 'MEDIUM'" (click)="newTask.priority = 'MEDIUM'">
                    <span class="priority-dot medium-dot"></span> Medium
                  </div>
                  <div class="priority-option" [class.selected]="newTask.priority === 'LOW'" (click)="newTask.priority = 'LOW'">
                    <span class="priority-dot low-dot"></span> Low
                  </div>
                </div>
              </div>
              <div class="form-group flex-1">
                <label>Due date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [(ngModel)]="newTask.dueDate" required #dueDate="ngModel" [class.is-invalid]="dueDate.invalid && dueDate.touched" [min]="minDate">
                <div class="invalid-feedback" *ngIf="dueDate.invalid && dueDate.touched">
                  <span *ngIf="dueDate.errors?.['required']">Due date is required</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="closeCreateModal()">Cancel</button>
            <button class="btn btn-primary" (click)="createTask()">Create</button>
          </div>
        </div>
      </div>

      <!-- Side Panel Overlay -->
      <app-task-detail-panel
        *ngIf="showDetails"
        [task]="selectedTask"
        [comments]="selectedTaskComments"
        [activities]="selectedTaskActivities"
        (close)="closeDetails()"
        (updateField)="onPanelUpdateField($event)"
        (commentAdded)="addComment($event)">
      </app-task-detail-panel>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    /* Advanced Filters Panel */
    .advanced-filters-panel {
      background: white;
      border: 1px solid #eaecf0;
      border-radius: 12px;
      margin-bottom: 24px;
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
    }
    .advanced-filters-panel.show {
      max-height: 200px;
      padding: 20px 24px;
      opacity: 1;
      margin-bottom: 32px;
    }
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      align-items: flex-end;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .filter-group label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #475467;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .filter-group input {
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.875rem;
      color: #101828;
      outline: none;
      transition: all 0.2s;
    }
    .filter-group input:focus {
      border-color: #667cb0;
      box-shadow: 0 0 0 4px rgba(102, 124, 176, 0.1);
    }
    .btn-ghost-sm {
      background: transparent;
      border: none;
      color: #667085;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      padding: 8px;
      text-align: left;
    }
    .btn-ghost-sm:hover {
      color: #f04438;
    }

    /* Task List Wrapper */
    .task-list-wrapper { display: flex; flex-direction: column; gap: 32px; }
    .group-header { margin-bottom: 16px; display: flex; align-items: center; }
    .group-title-wrap { display: flex; align-items: center; gap: 12px; }
    .collapse-icon { font-size: 20px; color: #667085; cursor: pointer; }
    .group-title { font-size: 1rem; font-weight: 700; margin: 0; }
    
    .group-header.in-progress .group-title { color: #175cd3; }
    .group-header.todo .group-title { color: #344054; }
    .group-header.done .group-title { color: #027a48; }
    
    .group-count { background: #f2f4f7; color: #344054; font-size: 0.75rem; font-weight: 700; padding: 2px 10px; border-radius: 12px; border: 1px solid #eaecf0; }

    .cards-container { display: flex; flex-direction: column; gap: 12px; }
    .task-card-row { background: white; border: 1px solid #eaecf0; border-radius: 20px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.04); }
    .task-card-row:hover { border-color: #d0d5dd; box-shadow: 0 4px 12px rgba(16, 24, 40, 0.08); transform: translateY(-1px); }
    .task-card-row.selected { border: 2px solid #2e90fa; box-shadow: 0 0 0 4px rgba(46, 144, 250, 0.1); }
    
    .card-content-wrap { padding: 18px 24px; display: flex; align-items: center; gap: 16px; min-height: 72px; }
    
    .check-box { display: flex; align-items: center; color: #d0d5dd; flex-shrink: 0; }
    .check-box .material-icons { font-size: 22px; color: #2e90fa; }
    .check-box .material-icons-outlined { font-size: 22px; }

    .task-main-info { flex: 1; min-width: 0; }
    .task-title { font-size: 0.9375rem; font-weight: 700; color: #101828; margin: 0 0 4px 0; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .task-description { font-size: 0.8125rem; color: #667085; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

    .task-metadata { display: flex; align-items: center; gap: 20px; flex-shrink: 0; white-space: nowrap; }
    
    .meta-item { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: #667085; font-weight: 500; white-space: nowrap; }
    .meta-item .material-icons-outlined { font-size: 18px; color: #98a2b3; }

    @media (max-width: 1024px) {
      .card-content-wrap { padding: 16px; flex-wrap: wrap; }
      .task-main-info { order: 1; flex: 1; min-width: 200px; }
      .check-box { order: 0; }
      .task-metadata { order: 2; width: 100%; margin-top: 12px; gap: 12px; justify-content: space-between; }
      .meta-item.date, .meta-item.comments { display: none; }
    }
    
    @media (max-width: 480px) {
      .task-metadata { flex-wrap: wrap; }
      .meta-item.assignee { order: -1; margin-right: auto; }
      .meta-item.status, .meta-item.priority { flex: none; }
    }

    /* Priority Badges */
    .priority-badge { display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 0.8125rem; border: 1px solid #eaecf0; background: white; }
    .priority-dot { width: 6px; height: 6px; border-radius: 50%; }
    
    .priority-badge.high { color: #f04438; }
    .priority-badge.high .priority-dot { background: #f04438; }
    
    .priority-badge.medium { color: #f79009; }
    .priority-badge.medium .priority-dot { background: #f79009; }
    
    .priority-badge.low { color: #12b76a; }
    .priority-badge.low .priority-dot { background: #12b76a; }

    /* Status Badges */
    .status-badge { padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 0.8125rem; }
    .status-badge.in-progress { background: #eff8ff; color: #175cd3; }
    .status-badge.todo { background: #f2f4f7; color: #344054; }
    .status-badge.done { background: #ecfdf3; color: #027a48; }

    /* Avatar Circles */
    .avatar-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: white; border: 2px solid white; box-shadow: 0 0 0 1px #eaecf0; }
    .avatar-sk { background: #f04438; }
    .avatar-rm { background: #12b76a; }
    .avatar-av { background: #f79009; }
    .avatar-mj { background: #9b51e0; }

    /* Create Task Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(16, 24, 40, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
    .modal-content { background: white; border-radius: 12px; width: 560px; max-width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03); border: 1px solid #eaecf0; }
    .modal-header { padding: 20px 24px 16px; display: flex; justify-content: space-between; align-items: center; }
    .modal-title { font-size: 1.125rem; font-weight: 600; color: #101828; margin: 0; }
    .btn-icon { background: transparent; border: none; color: #667085; cursor: pointer; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; margin-right: -8px; }
    .btn-icon:hover { background: #f2f4f7; }
    
    .modal-body { padding: 0 24px 24px; }
    .modal-subtitle { font-size: 0.8125rem; color: #667085; margin: 0 0 20px 0; }
    .text-danger { color: #f04438; }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #344054; margin-bottom: 6px; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #d0d5dd; border-radius: 8px; font-size: 0.9375rem; outline: none; transition: all 0.2s; box-sizing: border-box; background: white; color: #101828; }
    .form-control::placeholder { color: #98a2b3; }
    .form-control:focus { border-color: #2e90fa; box-shadow: 0 0 0 4px rgba(46, 144, 250, 0.1); }
    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }

    .priority-options { display: flex; gap: 8px; }
    .priority-option { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 4px; border: 1px solid #d0d5dd; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; color: #344054; background: #fcfcfd; transition: all 0.2s; }
    .priority-option:hover { background: #f9fafb; border-color: #98a2b3; }
    .priority-option.selected { border-color: #2e90fa; background: white; box-shadow: 0 0 0 1px #2e90fa; color: #101828; }
    .high-dot { background: #f04438; }
    .medium-dot { background: #f79009; }
    .low-dot { background: #12b76a; }

    @media (max-width: 640px) {
      .modal-content.create-modal { width: 100%; border-radius: 20px 20px 0 0; }
      .form-row { flex-direction: column; gap: 0; }
      .modal-footer { flex-direction: column-reverse; padding: 16px; }
      .modal-footer button { width: 100%; }
    }

    .modal-footer { padding: 16px 24px 24px; display: flex; justify-content: flex-end; gap: 12px; }
    .btn-secondary { background: white; border: 1px solid #d0d5dd; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 0.875rem; color: #344054; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: #f9fafb; }
    .btn-ghost { background: transparent; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 0.875rem; color: #344054; cursor: pointer; transition: all 0.2s; }
    .btn-ghost:hover { background: #f2f4f7; color: #101828; }

    /* Side Panel — identical to board */
    .side-panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.2); z-index: 1000; display: flex; justify-content: flex-end; backdrop-filter: blur(2px); animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .side-panel { width: 500px; max-width: 100%; height: 100vh; background: white; box-shadow: -4px 0 24px rgba(0,0,0,0.1); display: flex; flex-direction: column; transform: translateX(100%); animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    
    @media (max-width: 640px) {
      .side-panel { width: 100%; }
      .panel-grid { grid-template-columns: 1fr; gap: 16px; }
      .panel-header { padding: 12px 16px; }
      .panel-body { padding: 16px; }
      .panel-title { font-size: 1.25rem; margin-bottom: 16px; }
    }
    .panel-header { padding: 16px 24px; border-bottom: 1px solid #eaecf0; display: flex; justify-content: space-between; align-items: center; }
    .panel-task-id { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; font-weight: 500; color: #667085; }
    .panel-task-id .material-icons-outlined { font-size: 16px; }
    .panel-body { flex: 1; overflow-y: auto; padding: 24px; }
    .panel-title { font-size: 1.5rem; font-weight: 700; color: #101828; margin: 0 0 24px 0; line-height: 1.3; }
    .panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
    .grid-item label { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: #667085; margin-bottom: 8px; }
    .grid-item label .material-icons-outlined { font-size: 16px; }
    .assignee-val { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; font-weight: 500; color: #101828; }
    .assignee-avatar-sm { width: 24px; height: 24px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; }
    .assignee-avatar-sm.avatar-sk { background: #f04438; }
    .assignee-avatar-sm.avatar-rm { background: #12b76a; }
    .assignee-avatar-sm.avatar-av { background: #f79009; }
    .assignee-avatar-sm.avatar-mj { background: #9b51e0; }
    .date-val { font-size: 0.875rem; font-weight: 500; color: #101828; }
    .dropdown-wrapper { position: relative; }
    .priority-badge-dropdown, .status-badge-dropdown { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
    .priority-badge-dropdown:hover, .status-badge-dropdown:hover { background: #f9fafb; border-color: #eaecf0; }
    .priority-badge-dropdown.high { color: #b91c1c; background: #fef2f2; }
    .priority-badge-dropdown.medium { color: #b45309; background: #fffbeb; }
    .priority-badge-dropdown.low { color: #047857; background: #f0fdf4; }
    .status-badge-dropdown.to-do { color: #4b5563; background: #f3f4f6; }
    .status-badge-dropdown.in-progress { color: #1d4ed8; background: #eff6ff; }
    .status-badge-dropdown.done { color: #047857; background: #ecfdf5; }
    .priority-badge-dropdown .material-icons, .status-badge-dropdown .material-icons { font-size: 16px; }
    .dropdown-menu { position: absolute; top: 100%; left: 0; margin-top: 4px; background: white; border: 1px solid #eaecf0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); width: 100%; z-index: 10; padding: 4px; }
    .dropdown-item { padding: 6px 12px; font-size: 0.8125rem; cursor: pointer; border-radius: 4px; transition: background 0.2s; color: #344054; }
    .dropdown-item:hover { background: #f9fafb; }
    .panel-section { margin-bottom: 32px; }
    .section-label { display: block; font-size: 0.75rem; font-weight: 600; color: #667085; letter-spacing: 0.05em; margin-bottom: 12px; }
    .description-box { font-size: 0.9375rem; color: #344054; line-height: 1.6; background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #f2f4f7; }
    .tabs-container { display: flex; gap: 24px; border-bottom: 1px solid #eaecf0; margin-bottom: 24px; }
    .tab { padding-bottom: 12px; font-size: 0.875rem; font-weight: 600; color: #667085; cursor: pointer; position: relative; }
    .tab.active { color: #101828; }
    .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #3b82f6; border-radius: 2px 2px 0 0; }
    .comments-list { display: flex; flex-direction: column; gap: 20px; }
    .comment-item { display: flex; gap: 12px; }
    .comment-avatar { width: 32px; height: 32px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
    .comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .comment-author { font-size: 0.875rem; font-weight: 600; color: #101828; }
    .comment-time { font-size: 0.75rem; color: #667085; }
    .comment-bubble { background: #f3f4f6; padding: 10px 14px; border-radius: 0 12px 12px 12px; font-size: 0.875rem; color: #374151; line-height: 1.5; display: inline-block; }
    .panel-footer { padding: 16px 24px; border-top: 1px solid #eaecf0; background: white; }
    .comment-input-wrapper { display: flex; align-items: center; gap: 12px; }
    .comment-avatar-small { width: 32px; height: 32px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
    .comment-input-wrapper input { flex: 1; border: 1px solid #eaecf0; padding: 10px 16px; border-radius: 24px; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
    .comment-input-wrapper input:focus { border-color: #3b82f6; }
    .input-actions { display: flex; align-items: center; gap: 8px; }
    .input-actions .material-icons-outlined { color: #98a2b3; cursor: pointer; font-size: 20px; }
    .input-actions .material-icons-outlined:hover { color: #667085; }
    .send-btn { background: #3b82f6; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .send-btn:hover { background: #2563eb; }
    .send-btn .material-icons { font-size: 16px; }
    .btn-icon-sm { width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent; color: #98a2b3; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .btn-icon-sm:hover { background: #f2f4f7; color: #667085; }

    /* Activity feed */
    .activity-list { display: flex; flex-direction: column; gap: 0; }
    .activity-item { display: flex; gap: 16px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid #f2f4f7; }
    .activity-item:last-child { border-bottom: none; }
    .activity-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
    .activity-content { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .activity-text { font-size: 0.875rem; color: #374151; line-height: 1.5; }
    .activity-time { font-size: 0.75rem; color: #98a2b3; }
    .activity-badge { display: inline-flex; align-items: center; padding: 1px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .activity-badge.in-progress { color: #1d4ed8; background: #eff6ff; }
    .activity-badge.high { color: #b91c1c; background: #fef2f2; }
    .activity-badge.done { color: #047857; background: #ecfdf5; }
    .activity-badge.to-do { color: #4b5563; background: #f3f4f6; }

    .mt-4 { margin-top: 1.5rem; }

    /* Kanban Styles */
    .kanban-wrapper { display: flex; gap: 1.5rem; min-height: 60vh; overflow-x: auto; padding-bottom: 1rem; align-items: flex-start; }
    .kanban-column { flex: 0 0 340px; background: #f9fafb; border-radius: 16px; display: flex; flex-direction: column; max-height: calc(100vh - 250px); padding: 6px; }
    .column-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px 8px; }
    .header-left { display: flex; align-items: center; gap: 8px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status-dot.todo { background: #4b5563; }
    .status-dot.in-progress { background: #3b82f6; }
    .status-dot.done { background: #10b981; }
    .column-title { font-size: 0.9375rem; font-weight: 600; color: #101828; margin: 0; }
    .count { font-size: 0.75rem; color: #667085; }
    .kanban-task-list { flex: 1; padding: 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; min-height: 150px; }
    .kanban-task-card { background: white; border-radius: 12px; border: 1px solid #eaecf0; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); cursor: pointer; position: relative; transition: all 0.2s; }
    .kanban-task-card:hover { border-color: #d0d5dd; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .card-content { display: flex; flex-direction: column; gap: 8px; }
    .card-content .task-title { font-size: 0.9375rem; font-weight: 600; color: #101828; margin: 0; }
    .card-content .task-desc { font-size: 0.8125rem; color: #667085; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-meta-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .priority-badge-sm { display: inline-flex; align-items: center; gap: 4px; font-size: 0.6875rem; font-weight: 600; padding: 2px 8px; border-radius: 12px; text-transform: uppercase; }
    .priority-badge-sm.high { color: #b91c1c; background: #fef2f2; }
    .priority-badge-sm.high .dot { background: #b91c1c; }
    .priority-badge-sm.medium { color: #b45309; background: #fffbeb; }
    .priority-badge-sm.medium .dot { background: #b45309; }
    .priority-badge-sm.low { color: #047857; background: #f0fdf4; }
    .priority-badge-sm.low .dot { background: #047857; }
    .priority-badge-sm .dot { width: 4px; height: 4px; border-radius: 50%; }
    .assignee-avatar-sm { width: 24px; height: 24px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 600; border: 2px solid white; }
    .card-footer { display: flex; gap: 16px; align-items: center; padding-top: 12px; border-top: 1px solid #f2f4f7; margin-top: 12px; }
    .footer-item { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #667085; font-weight: 500; }
    .footer-item .material-icons-outlined { font-size: 14px; }
    .cdk-drag-preview { box-sizing: border-box; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .cdk-drag-placeholder { opacity: 0; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
  `]
})
export class TaskListComponent implements OnInit {
  viewMode: 'list' | 'board' = 'list';
  searchQuery = '';
  filterStatus = '';
  filterPriority = '';
  dueDateFrom = '';
  dueDateTo = '';
  assignedDateFrom = '';
  assignedDateTo = '';
  showAdvancedFilters = false;
  
  roles: Role[] = [];
  selectedRoleId: string = '';
  branches: Branch[] = [];
  selectedBranchId: string = '';
  employees: Employee[] = [];
  minDate = new Date().toISOString().split('T')[0];
  
  tasks: Task[] = [];
  inProgressTasks: Task[] = [];
  todoTasks: Task[] = [];
  doneTasks: Task[] = [];
  selectedTask: Task | null = null;
  selectedTaskComments: TaskComment[] = [];
  selectedTaskActivities: Activity[] = [];
  
  showDetails = false;
  showCreateModal = false;
  panelDropdown: string | null = null;
  activeTab: string = 'comments';
  activeActionMenu: number | null = null;
  openDropdown: { taskId: number, field: string } | null = null;
  loading = false;
  error: string | null = null;
  validationErrors: any[] = [];

  newTask: any = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: '',
    status: 'TO_DO'
  };

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

  private taskService = inject(TaskService);
  private employeeService = inject(EmployeeService);
  private roleService = inject(RoleService);
  private branchService = inject(BranchService);
  private authService = inject(AuthService);
  roleConfig = inject(RoleConfigService);

  constructor() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      this.openDropdown = null;
      this.activeActionMenu = null;
    });
  }

  ngOnInit() {
    this.loadTasks();
    this.loadEmployees();
    this.loadRoles();
    this.loadBranches();
  }

  loadBranches() {
    this.branchService.getAllBranches().subscribe({
      next: (branches) => {
        this.branches = branches;
      },
      error: (err) => console.error('Error loading branches:', err)
    });
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        // If senior counsellor, reload employees now that roles are available to filter junior counsellors
        if (this.roleConfig.getCurrentUserRole() === 'SENIOR_COUNSELLOR') {
          this.loadEmployees();
        }
      },
      error: (err) => console.error('Error loading roles:', err)
    });
  }

  loadEmployees() {
    let roleId = this.selectedRoleId;
    let branchId = this.selectedBranchId;
    
    if (this.roleConfig.getCurrentUserRole() === 'SENIOR_COUNSELLOR') {
      const user = this.authService.currentUserValue;
      branchId = (user?.branchId || '').toString();
      
      const juniorRole = this.roles.find(r => r.name === 'JUNIOR_COUNSELLOR');
      if (juniorRole) {
        roleId = juniorRole.id.toString();
      }
    }

    this.employeeService.getAdminEmployees(roleId, branchId).subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  loadTasks(filter?: TaskFilter) {
    this.loading = true;
    this.error = null;
    this.validationErrors = [];
    this.taskService.getTasks(filter).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.groupTasksByStatus();
        this.loading = false;
        
        // Fetch comments count for each task asynchronously to display on the cards
        this.tasks.forEach(task => {
          this.taskService.getComments(task.id).subscribe({
            next: (comments: any) => {
              task.comments = comments && Array.isArray(comments) ? comments.length : 0;
            },
            error: () => {
              task.comments = 0;
            }
          });
        });
      },
      error: (err: ApiError) => {
        this.error = err.message || 'Failed to load tasks';
        this.validationErrors = err.errors || [];
        this.loading = false;
        console.error('Error loading tasks:', err);
      }
    });
  }

  groupTasksByStatus() {
    this.inProgressTasks = this.tasks.filter(task => {
      const status = task.status as any;
      return status === 'IN_PROGRESS' || status === 'IN PROGRESS';
    });
    this.todoTasks = this.tasks.filter(task => {
      const status = task.status as any;
      return status === 'TO_DO' || status === 'TO DO' || status === 'TODO' || status === 'PENDING';
    });
    this.doneTasks = this.tasks.filter(task => {
      const status = task.status as any;
      return status === 'DONE' || status === 'COMPLETED';
    });
  }

  applyFilters() {
    const filter: TaskFilter = {
      search: this.searchQuery || undefined,
      status: this.filterStatus as Task['status'] || undefined,
      priority: this.filterPriority as Task['priority'] || undefined,
      dueDateFrom: this.dueDateFrom || undefined,
      dueDateTo: this.dueDateTo || undefined,
      assignedDateFrom: this.assignedDateFrom || undefined,
      assignedDateTo: this.assignedDateTo || undefined
    };
    this.loadTasks(filter);
  }

  clearAdvancedFilters() {
    this.dueDateFrom = '';
    this.dueDateTo = '';
    this.assignedDateFrom = '';
    this.assignedDateTo = '';
    this.applyFilters();
  }

  openCreateModal() {
    if (this.roleConfig.getCurrentUserRole() === 'SENIOR_COUNSELLOR') {
      const user = this.authService.currentUserValue;
      this.selectedBranchId = (user?.branchId || '').toString();
      this.loadEmployees();
    }
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetNewTask();
  }

  resetNewTask() {
    this.newTask = {
      title: '',
      description: '',
      priority: 'MEDIUM',
      assigneeId: '',
      dueDate: '',
      status: 'TO_DO'
    };
  }

  createTask() {
    if (!this.newTask.title || !this.newTask.assigneeId || !this.newTask.dueDate) {
      // Mark fields as touched for validation display
      this.validationErrors = [{ field: 'form', message: 'Please fill all required fields' }];
      return;
    }
    
    const taskData: CreateTaskRequest = {
      title: this.newTask.title,
      description: this.newTask.description,
      priority: this.newTask.priority as Task['priority'],
      assignedToId: parseInt(this.newTask.assigneeId),
      dueDate: this.newTask.dueDate
    };

    this.taskService.createTask(taskData).subscribe({
      next: (task) => {
        this.closeCreateModal();
        this.loadTasks();
      },
      error: (err: ApiError) => {
        this.error = err.message || 'Failed to create task';
        this.validationErrors = err.errors || [];
        console.error('Error creating task:', err);
      }
    });
  }

  deleteTask(task: Task) {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.softDeleteTask(task.id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
          this.groupTasksByStatus();
        },
        error: (err: ApiError) => {
          this.error = err.message || 'Failed to delete task';
          console.error('Error deleting task:', err);
        }
      });
    }
  }

  toggleActionMenu(taskId: number) {
    event?.stopPropagation();
    this.activeActionMenu = this.activeActionMenu === taskId ? null : taskId;
  }

  toggleDropdown(taskId: number, field: string) {
    if (this.openDropdown?.taskId === taskId && this.openDropdown?.field === field) {
      this.openDropdown = null;
    } else {
      this.openDropdown = { taskId, field };
    }
  }

  updateTaskField(task: Task, field: keyof Task, value: string) {
    const oldStatus = task.status;
    (task as any)[field] = value;
    
    // API call for specific field updates
    if (field === 'status') {
      this.taskService.updateStatus(task.id, value as Task['status']).subscribe({
        next: () => {
          this.moveTask(task, oldStatus, value);
          if (this.selectedTask && this.selectedTask.id === task.id) {
            this.loadActivity(task.id);
          }
        },
        error: (err: ApiError) => {
          this.error = err.message || 'Failed to update status';
          this.validationErrors = err.errors || [];
          console.error('Error updating status:', err);
        }
      });
    } else if (field === 'priority') {
      this.taskService.updatePriority(task.id, value as Task['priority']).subscribe({
        next: () => {
          if (this.selectedTask && this.selectedTask.id === task.id) {
            this.loadActivity(task.id);
          }
        },
        error: (err: ApiError) => {
          this.error = err.message || 'Failed to update priority';
          this.validationErrors = err.errors || [];
          console.error('Error updating priority:', err);
        }
      });
    }
    
    this.openDropdown = null;
  }

  moveTask(task: Task, from: string, to: string) {
    // Remove from old list
    if (from === 'IN_PROGRESS') {
      this.inProgressTasks = this.inProgressTasks.filter(t => t.id !== task.id);
    } else if (from === 'TO_DO') {
      this.todoTasks = this.todoTasks.filter(t => t.id !== task.id);
    } else if (from === 'DONE') {
      this.doneTasks = this.doneTasks.filter(t => t.id !== task.id);
    }

    // Add to new list
    if (to === 'IN_PROGRESS') {
      this.inProgressTasks.unshift(task);
    } else if (to === 'TO_DO') {
      this.todoTasks.unshift(task);
    } else if (to === 'DONE') {
      this.doneTasks.unshift(task);
    }
  }

  viewTaskDetails(task: Task) {
    this.loading = true;
    this.taskService.getTaskDetails(task.id).subscribe({
      next: (taskDetails) => {
        this.selectedTask = taskDetails.task;
        this.selectedTaskComments = taskDetails.comments;
        this.selectedTaskActivities = taskDetails.activities;
        this.showDetails = true;
        this.activeTab = 'comments';
        this.panelDropdown = null;
        this.loading = false;
      },
      error: (err: ApiError) => {
        this.error = err.message || 'Failed to load task details';
        this.validationErrors = err.errors || [];
        this.loading = false;
        console.error('Error loading task details:', err);
      }
    });
  }

  onPanelUpdateField(event: any) {
    this.updateSelectedTask(event.field, event.value);
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedTask = null;
    this.panelDropdown = null;
  }

  togglePanelDropdown(type: string) {
    event?.stopPropagation();
    this.panelDropdown = this.panelDropdown === type ? null : type;
  }

  updateSelectedTask(field: keyof Task, value: string) {
    if (this.selectedTask) {
      const oldStatus = this.selectedTask.status;
      
      if (field === 'status') {
        this.taskService.updateStatus(this.selectedTask.id, value as Task['status']).subscribe({
          next: () => {
            (this.selectedTask as any)[field] = value;
            this.loadTasks(); // Refresh task list
            this.loadActivity(this.selectedTask!.id); // Refresh activity timeline
          },
          error: (err: ApiError) => {
            this.error = err.message || 'Failed to update status';
            this.validationErrors = err.errors || [];
            console.error('Error updating status:', err);
          }
        });
      } else if (field === 'priority') {
        this.taskService.updatePriority(this.selectedTask.id, value as Task['priority']).subscribe({
          next: () => {
            (this.selectedTask as any)[field] = value;
            this.loadActivity(this.selectedTask!.id); // Refresh activity timeline
          },
          error: (err: ApiError) => {
            this.error = err.message || 'Failed to update priority';
            this.validationErrors = err.errors || [];
            console.error('Error updating priority:', err);
          }
        });
      } else if (field === 'dueDate') {
        this.taskService.updateDueDate(this.selectedTask.id, value).subscribe({
          next: () => {
            (this.selectedTask as any)[field] = value;
            this.loadActivity(this.selectedTask!.id); // Refresh activity timeline
          },
          error: (err: ApiError) => {
            this.error = err.message || 'Failed to update due date';
            this.validationErrors = err.errors || [];
            console.error('Error updating due date:', err);
          }
        });
      } else {
        (this.selectedTask as any)[field] = value;
      }
    }
    this.panelDropdown = null;
  }

  addComment(comment: string) {
    if (!this.selectedTask || !comment.trim()) return;
    
    this.taskService.addComment(this.selectedTask.id, comment).subscribe({
      next: () => {
        // Reload task details to show new comment and activity
        this.taskService.getTaskDetails(this.selectedTask!.id).subscribe({
          next: (taskDetails) => {
            this.selectedTaskComments = taskDetails.comments;
            this.selectedTaskActivities = taskDetails.activities;
            // Also update the comment count in the main task list if needed
            const taskInList = this.tasks.find(t => t.id === this.selectedTask!.id);
            if (taskInList) taskInList.comments = (taskInList.comments || 0) + 1;
          }
        });
      },
      error: (err: ApiError) => {
        this.error = err.message || 'Failed to add comment';
        this.validationErrors = err.errors || [];
        console.error('Error adding comment:', err);
      }
    });
  }

  loadActivity(taskId: number) {
    this.taskService.getActivity(taskId).subscribe({
      next: (activities) => {
        this.selectedTaskActivities = activities;
      },
      error: (err) => {
        this.error = 'Failed to load activity';
        console.error('Error loading activity:', err);
      }
    });
  }

  drop(event: CdkDragDrop<any[]>, newStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      const oldStatus = item.status;
      item.status = newStatus;
      
      this.taskService.updateStatus(item.id, newStatus as Task['status']).subscribe({
        next: () => {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
          );
          // Refresh list views to sync
          this.groupTasksByStatus();
          // If the panel is open for this task, refresh the activities
          if (this.selectedTask && this.selectedTask.id === item.id) {
            this.loadActivity(item.id);
          }
        },
        error: (err: ApiError) => {
          item.status = oldStatus; // Revert on error
          this.error = err.message || 'Failed to update task status';
          console.error('Error updating status on drop:', err);
        }
      });
    }
  }
}
