import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService, Task, TaskFilter, CreateTaskRequest, ApiError, TaskComment, Activity } from '../../../core/services/task.service';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { RoleService, Role } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { DatepickerComponent } from '../../../shared/components/datepicker/datepicker.component';

import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-manager-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule, EmptyStateComponent, DatepickerComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">Branch Tasks</h1>
          <p class="page-subtitle">Manage tasks for {{ getCurrentBranchName() }} branch.</p>
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
          <button class="btn btn-primary" (click)="openCreateModal()">
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
            <app-datepicker [(ngModel)]="dueDateFrom" (ngModelChange)="applyFilters()"></app-datepicker>
          </div>
          <div class="filter-group">
            <label>Due Date To</label>
            <app-datepicker [(ngModel)]="dueDateTo" (ngModelChange)="applyFilters()"></app-datepicker>
          </div>
          <div class="filter-group">
            <label>Assigned From</label>
            <app-datepicker [(ngModel)]="assignedDateFrom" (ngModelChange)="applyFilters()"></app-datepicker>
          </div>
          <div class="filter-group">
            <label>Assigned To</label>
            <app-datepicker [(ngModel)]="assignedDateTo" (ngModelChange)="applyFilters()"></app-datepicker>
          </div>
          <div class="filter-group">
            <label>&nbsp;</label>
            <button class="btn-ghost-sm" (click)="clearAdvancedFilters()">Clear All</button>
          </div>
        </div>
      </div>

      <app-empty-state 
        *ngIf="inProgressTasks.length === 0 && todoTasks.length === 0 && doneTasks.length === 0"
        icon="assignment"
        title="No tasks found"
        description="No tasks match your current filters. Try adjusting your search criteria."
        [showAction]="true"
        actionText="Create First Task"
        (actionClicked)="openCreateModal()">
      </app-empty-state>

      <!-- Board View -->
      <div *ngIf="viewMode === 'board' && (inProgressTasks.length > 0 || todoTasks.length > 0 || doneTasks.length > 0)" class="board-view">
        <div class="board-columns">
          <div class="board-column">
            <div class="column-header">
              <h3>To Do</h3>
              <span class="task-count">{{ todoTasks.length }}</span>
            </div>
            <div class="task-list" cdkDropList [cdkDropListData]="todoTasks" (cdkDropListDropped)="drop($event, 'todo')">
              <div *ngFor="let task of todoTasks" class="task-card" cdkDrag>
                <div class="task-priority" [class]="task.priority.toLowerCase()"></div>
                <div class="task-content">
                  <h4 class="task-title">{{ task.title }}</h4>
                  <p class="task-description">{{ task.description }}</p>
                  <div class="task-meta">
                    <span class="task-student">{{ task.student }}</span>
                    <span class="task-assignee">
                      <div class="avatar-circle-sm" [style.background]="task.avatarColor || '#6366f1'">
                        {{ task.assigneeInitial || '?' }}
                      </div>
                      {{ task.assigneeName }}
                    </span>
                  </div>
                  <div class="task-dates">
                    <span class="due-date" [class.overdue]="isOverdue(task.dueDate || '')">
                      Due: {{ formatDate(task.dueDate || '') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="board-column">
            <div class="column-header">
              <h3>In Progress</h3>
              <span class="task-count">{{ inProgressTasks.length }}</span>
            </div>
            <div class="task-list" cdkDropList [cdkDropListData]="inProgressTasks" (cdkDropListDropped)="drop($event, 'inProgress')">
              <div *ngFor="let task of inProgressTasks" class="task-card" cdkDrag>
                <div class="task-priority" [class]="task.priority.toLowerCase()"></div>
                <div class="task-content">
                  <h4 class="task-title">{{ task.title }}</h4>
                  <p class="task-description">{{ task.description }}</p>
                  <div class="task-meta">
                    <span class="task-student">{{ task.student }}</span>
                    <span class="task-assignee">
                      <div class="avatar-circle-sm" [style.background]="task.avatarColor || '#6366f1'">
                        {{ task.assigneeInitial || '?' }}
                      </div>
                      {{ task.assigneeName }}
                    </span>
                  </div>
                  <div class="task-dates">
                    <span class="due-date" [class.overdue]="isOverdue(task.dueDate || '')">
                      Due: {{ formatDate(task.dueDate || '') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="board-column">
            <div class="column-header">
              <h3>Done</h3>
              <span class="task-count">{{ doneTasks.length }}</span>
            </div>
            <div class="task-list" cdkDropList [cdkDropListData]="doneTasks" (cdkDropListDropped)="drop($event, 'done')">
              <div *ngFor="let task of doneTasks" class="task-card completed" cdkDrag>
                <div class="task-priority" [class]="task.priority.toLowerCase()"></div>
                <div class="task-content">
                  <h4 class="task-title">{{ task.title }}</h4>
                  <p class="task-description">{{ task.description }}</p>
                  <div class="task-meta">
                    <span class="task-student">{{ task.student }}</span>
                    <span class="task-assignee">
                      <div class="avatar-circle-sm" [style.background]="task.avatarColor || '#6366f1'">
                        {{ task.assigneeInitial || '?' }}
                      </div>
                      {{ task.assigneeName }}
                    </span>
                  </div>
                  <div class="task-dates">
                    <span class="completed-date">Completed: {{ formatDate(task.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div *ngIf="viewMode === 'list' && (inProgressTasks.length > 0 || todoTasks.length > 0 || doneTasks.length > 0)" class="list-view">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Student</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of allTasks" class="task-row">
                <td class="task-info">
                  <div class="task-title-cell">{{ task.title }}</div>
                  <div class="task-description-cell">{{ task.description }}</div>
                </td>
                <td>{{ task.student }}</td>
                <td class="assignee-cell">
                  <div class="avatar-circle-sm" [style.background]="task.avatarColor || '#6366f1'">
                    {{ task.assigneeInitial || '?' }}
                  </div>
                  {{ task.assigneeName }}
                </td>
                <td>
                  <span class="priority-badge" [class]="task.priority.toLowerCase()">
                    {{ task.priority }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class]="task.status.toLowerCase().replace('_', '-')">
                    {{ formatStatus(task.status) }}
                  </span>
                </td>
                <td>
                  <span class="due-date-cell" [class.overdue]="isOverdue(task.dueDate || '')">
                    {{ formatDate(task.dueDate || '') }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon-sm" (click)="editTask(task)" title="Edit">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon-sm" (click)="viewTaskDetails(task)" title="View Details">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button class="btn-icon-sm danger" (click)="deleteTask(task)" title="Delete">
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
  `,
  styles: [`
   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

   

    .board-view {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .board-column {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-gray-200);
      overflow: hidden;
    }

    .column-header {
      padding: 1rem;
      background: var(--color-gray-50);
      border-bottom: 1px solid var(--color-gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .column-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-gray-900);
    }

    .task-count {
      background: var(--color-gray-200);
      color: var(--color-gray-700);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
    }

    .task-list {
      padding: 1rem;
      min-height: 200px;
    }

    .task-card {
      background: white;
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-md);
      padding: 1rem;
      margin-bottom: 0.75rem;
      cursor: move;
      transition: all var(--transition-fast);
    }

    .task-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .task-card.completed {
      opacity: 0.7;
    }

    .task-priority {
      width: 4px;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      border-radius: var(--radius-md) 0 0 var(--radius-md);
    }

    .task-priority.high { background: #ef4444; }
    .task-priority.medium { background: #f59e0b; }
    .task-priority.low { background: #10b981; }

    .task-content {
      margin-left: 0.5rem;
    }

    .task-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-gray-900);
      margin: 0 0 0.5rem;
    }

    .task-description {
      font-size: 0.75rem;
      color: var(--color-gray-600);
      margin: 0 0 1rem;
      line-height: 1.4;
    }

    .task-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .task-student {
      font-size: 0.75rem;
      color: var(--color-gray-700);
      font-weight: 500;
    }

    .task-assignee {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--color-gray-600);
    }

    .avatar-circle-sm {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.625rem;
      font-weight: 700;
      color: white;
    }

    .task-dates {
      font-size: 0.75rem;
    }

    .due-date {
      color: var(--color-gray-600);
    }

    .due-date.overdue {
      color: #ef4444;
      font-weight: 600;
    }

    .completed-date {
      color: #10b981;
      font-weight: 500;
    }

    .list-view {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-gray-200);
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      text-align: left;
      padding: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-gray-700);
      background: var(--color-gray-50);
      border-bottom: 1px solid var(--color-gray-200);
    }

    .data-table td {
      padding: 1rem;
      font-size: 0.875rem;
      color: var(--color-gray-600);
      border-bottom: 1px solid var(--color-gray-100);
    }

    .task-row:hover {
      background: var(--color-gray-50);
    }

    .task-info {
      min-width: 250px;
    }

    .task-title-cell {
      font-weight: 600;
      color: var(--color-gray-900);
      margin-bottom: 0.25rem;
    }

    .task-description-cell {
      color: var(--color-gray-600);
      font-size: 0.75rem;
    }

    .assignee-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .priority-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .priority-badge.high {
      background: #fef2f2;
      color: #dc2626;
    }

    .priority-badge.medium {
      background: #fef3c7;
      color: #d97706;
    }

    .priority-badge.low {
      background: #ecfdf5;
      color: #059669;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge.to-do {
      background: #f3f4f6;
      color: #6b7280;
    }

    .status-badge.in-progress {
      background: #dbeafe;
      color: #2563eb;
    }

    .status-badge.done {
      background: #ecfdf5;
      color: #059669;
    }

    .due-date-cell.overdue {
      color: #ef4444;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon-sm {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--color-gray-100);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-icon-sm:hover {
      background: var(--color-gray-200);
    }

    .btn-icon-sm.danger:hover {
      background: #fef2f2;
      color: #dc2626;
    }

    @media (max-width: 1024px) {
      .board-view {
        grid-template-columns: 1fr;
      }
    }

    
  `]
})
export class ManagerTaskListComponent implements OnInit {
  taskService = inject(TaskService);
  employeeService = inject(EmployeeService);
  roleService = inject(RoleService);
  authService = inject(AuthService);
  router = inject(Router);

  // View modes
  viewMode: 'list' | 'board' = 'board';

  // Filter properties
  searchQuery = '';
  filterStatus = '';
  filterPriority = '';
  showAdvancedFilters = false;
  dueDateFrom = '';
  dueDateTo = '';
  assignedDateFrom = '';
  assignedDateTo = '';

  // Task data
  allTasks: Task[] = [];
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  // Branch-specific data
  currentBranchId: string = '';
  currentUserId: string = '';

  ngOnInit() {
    this.currentBranchId = this.getCurrentBranchId();
    this.currentUserId = this.getCurrentUserId();
    this.loadBranchTasks();
  }

  getCurrentBranchId(): string {
    const user = (this.authService.currentUser$ as any)?.value;
    return user?.branchId || '1';
  }

  getCurrentUserId(): string {
    const user = (this.authService.currentUser$ as any)?.value;
    return user?.id || '';
  }

  getCurrentBranchName(): string {
    const user = (this.authService.currentUser$ as any)?.value;
    return user?.branchName || 'Main';
  }

  loadBranchTasks() {
    // Load tasks filtered by branch
    const branchFilter: TaskFilter = {
      branchId: parseInt(this.currentBranchId),
      search: this.searchQuery,
      status: this.filterStatus as Task['status'] || undefined,
      priority: this.filterPriority as Task['priority'] || undefined,
      dueDateFrom: this.dueDateFrom,
      dueDateTo: this.dueDateTo,
      assignedDateFrom: this.assignedDateFrom,
      assignedDateTo: this.assignedDateTo
    };

    this.taskService.getTasks(branchFilter).subscribe({
      next: (tasks) => {
        this.allTasks = tasks.tasks;
        this.categorizeTasks();
      },
      error: (error) => {
        console.error('Error loading branch tasks:', error);
      }
    });
  }

  categorizeTasks() {
    this.todoTasks = this.allTasks.filter(task => task.status === 'TO_DO');
    this.inProgressTasks = this.allTasks.filter(task => task.status === 'IN_PROGRESS');
    this.doneTasks = this.allTasks.filter(task => task.status === 'DONE');
  }

  applyFilters() {
    this.loadBranchTasks();
  }

  clearAdvancedFilters() {
    this.dueDateFrom = '';
    this.dueDateTo = '';
    this.assignedDateFrom = '';
    this.assignedDateTo = '';
    this.applyFilters();
  }

  drop(event: CdkDragDrop<Task[]>, targetColumn: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update task status
      const task = event.container.data[event.currentIndex];
      const newStatus = targetColumn === 'todo' ? 'TO_DO' : 
                       targetColumn === 'inProgress' ? 'IN_PROGRESS' : 'DONE';
      
      this.updateTaskStatus(task, newStatus);
    }
  }

  updateTaskStatus(task: Task, newStatus: 'TO_DO' | 'IN_PROGRESS' | 'DONE') {
    this.taskService.updateStatus(task.id, newStatus).subscribe({
      next: (updatedTask: Task) => {
        // Update local task
        const index = this.allTasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.allTasks[index] = updatedTask;
          this.categorizeTasks();
        }
      },
      error: (error: any) => {
        console.error('Error updating task status:', error);
        // Revert the change
        this.categorizeTasks();
      }
    });
  }

  openCreateModal() {
    // Navigate to create task page or open modal
    this.router.navigate(['/manager/tasks/create']);
  }

  editTask(task: Task) {
    this.router.navigate(['/manager/tasks/edit', task.id]);
  }

  viewTaskDetails(task: Task) {
    this.router.navigate(['/manager/tasks', task.id]);
  }

  deleteTask(task: Task) {
    if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      this.taskService.softDeleteTask(task.id).subscribe({
        next: () => {
          this.allTasks = this.allTasks.filter(t => t.id !== task.id);
          this.categorizeTasks();
        },
        error: (error: any) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  isOverdue(dueDate: string): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  formatDate(date: string): string {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString();
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
}
