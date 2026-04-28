import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">Tasks</h1>
          <p class="page-subtitle">Track and manage student processing workflows.</p>
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button class="toggle-btn active" [routerLink]="['/admin/tasks']">
              <span class="material-icons">list</span>
            </button>
            <button class="toggle-btn" [routerLink]="['/admin/tasks/kanban']">
              <span class="material-icons">view_kanban</span>
            </button>
          </div>
          <button class="btn btn-primary">
            <span class="material-icons">add</span>
            Create Task
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search tasks..." [(ngModel)]="searchQuery">
        </div>
        <div class="filter-actions">
          <select class="filter-select" [(ngModel)]="filterStatus">
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select class="filter-select" [(ngModel)]="filterPriority">
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button class="btn btn-secondary">
            <span class="material-icons">tune</span>
          </button>
        </div>
      </div>

      <div class="empty-state-container" *ngIf="inProgressTasks.length === 0">
        <div class="empty-state-content">
          <span class="material-icons empty-icon">assignment</span>
          <h3>No Tasks Found</h3>
          <p>There are currently no tasks assigned. Create your first task to get started.</p>
        </div>
      </div>

      <!-- Task Table Card -->
      <div class="table-card" *ngIf="inProgressTasks.length > 0">
        <div class="table-card-header">
          <div class="table-header-title">
            <h2>Active Tasks</h2>
            <span class="count-badge">{{ inProgressTasks.length }} tasks</span>
          </div>
          <button class="btn-icon">
            <span class="material-icons">more_vert</span>
          </button>
        </div>

        <div style="overflow-x: auto;">
          <div class="group-header">
            <span class="material-icons expand">expand_more</span>
            <span class="group-dot in-progress"></span>
            <span class="group-name">In Progress</span>
            <span class="group-count">3</span>
          </div>
          
          <table class="premium-table">
            <thead>
              <tr>
                <th class="col-name">Name</th>
                <th class="col-assignee">Assignee</th>
                <th class="col-assigned-date">Assigned Date</th>
                <th class="col-due">Due Date</th>
                <th class="col-priority">Priority</th>
                <th class="col-status">Status</th>
                <th class="col-comments">Comments</th>
                <th class="col-actions"></th>
              </tr>
            </thead>
            <tbody>
               <tr *ngFor="let task of inProgressTasks" class="task-row" (click)="viewTaskDetails(task)">
                <td class="col-name">
                  <div class="task-title-wrap">
                    <span class="material-icons status-icon-small">radio_button_unchecked</span>
                    <span class="task-title">{{ task.title }}</span>
                  </div>
                </td>
                <td class="col-assignee">
                  <div class="assignee-wrap">
                    <div class="assignee-avatar" title="{{ task.assignee }}">{{ task.assignee.charAt(0) }}</div>
                  </div>
                </td>
                <td class="col-assigned-date">
                  <span class="assigned-date">{{ task.assignedDate }}</span>
                </td>
                <td class="col-due">
                  <div class="due-date-wrap">
                    <span class="material-icons">calendar_today</span>
                    <span class="due-date" [class.overdue]="task.isOverdue">{{ task.dueDate }}</span>
                  </div>
                </td>
                <td class="col-priority" (click)="$event.stopPropagation()">
                  <div class="custom-dropdown-container">
                    <button class="trigger-badge" [ngClass]="task.priority.toLowerCase()" (click)="toggleDropdown(task.id, 'priority')">
                      {{ task.priority }}
                    </button>
                    <div class="custom-dropdown-menu" *ngIf="openDropdown?.taskId === task.id && openDropdown?.field === 'priority'">
                      <div class="dropdown-header">Select an option or create one</div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'priority', 'High')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge high">High</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'priority', 'Medium')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge medium">Medium</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'priority', 'Low')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge low">Low</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="col-status" (click)="$event.stopPropagation()">
                  <div class="custom-dropdown-container">
                    <button class="trigger-badge" [ngClass]="task.status.toLowerCase().replace(' ', '-')" (click)="toggleDropdown(task.id, 'status')">
                      {{ task.status }}
                    </button>
                    <div class="custom-dropdown-menu" *ngIf="openDropdown?.taskId === task.id && openDropdown?.field === 'status'">
                      <div class="dropdown-header">Select an option or create one</div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'status', 'To Do')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge to-do">To Do</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'status', 'In Progress')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge in-progress">In Progress</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'status', 'Done')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge done">Done</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="col-comments">
                  <div class="comments-wrap">
                    <span class="material-icons">chat_bubble_outline</span>
                    <span class="comment-count" *ngIf="task.comments">{{ task.comments }}</span>
                  </div>
                </td>
                <td class="col-actions" (click)="$event.stopPropagation()">
                  <button class="btn-icon">
                    <span class="material-icons">more_horiz</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="group-header mt-1">
            <span class="material-icons expand">expand_more</span>
            <span class="group-dot todo"></span>
            <span class="group-name">To Do</span>
            <span class="group-count">{{ todoTasks.length }}</span>
          </div>

          <table class="premium-table" *ngIf="todoTasks.length > 0">
            <tbody>
               <tr *ngFor="let task of todoTasks" class="task-row" (click)="viewTaskDetails(task)">
                <td class="col-name">
                  <div class="task-title-wrap">
                    <span class="material-icons status-icon-small">radio_button_unchecked</span>
                    <span class="task-title">{{ task.title }}</span>
                  </div>
                </td>
                <td class="col-assignee">
                  <div class="assignee-wrap">
                    <div class="assignee-avatar" title="{{ task.assignee }}">{{ task.assignee.charAt(0) }}</div>
                  </div>
                </td>
                <td class="col-assigned-date">
                  <span class="assigned-date">{{ task.assignedDate }}</span>
                </td>
                <td class="col-due">
                  <div class="due-date-wrap">
                    <span class="material-icons">calendar_today</span>
                    <span class="due-date" [class.overdue]="task.isOverdue">{{ task.dueDate }}</span>
                  </div>
                </td>
                <td class="col-priority" (click)="$event.stopPropagation()">
                  <div class="custom-dropdown-container">
                    <button class="trigger-badge" [ngClass]="task.priority.toLowerCase()" (click)="toggleDropdown(task.id, 'priority')">
                      {{ task.priority }}
                    </button>
                    <div class="custom-dropdown-menu" *ngIf="openDropdown?.taskId === task.id && openDropdown?.field === 'priority'">
                      <div class="dropdown-header">Select an option or create one</div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'priority', 'High')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge high">High</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'priority', 'Medium')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge medium">Medium</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'priority', 'Low')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge low">Low</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="col-status" (click)="$event.stopPropagation()">
                  <div class="custom-dropdown-container">
                    <button class="trigger-badge" [ngClass]="task.status.toLowerCase().replace(' ', '-')" (click)="toggleDropdown(task.id, 'status')">
                      {{ task.status }}
                    </button>
                    <div class="custom-dropdown-menu" *ngIf="openDropdown?.taskId === task.id && openDropdown?.field === 'status'">
                      <div class="dropdown-header">Select an option or create one</div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'status', 'To Do')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge to-do">To Do</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'status', 'In Progress')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge in-progress">In Progress</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                      <div class="dropdown-item" (click)="updateTaskField(task, 'status', 'Done')">
                        <span class="drag-icon">⋮⋮</span>
                        <span class="menu-badge done">Done</span>
                        <span class="material-icons more-icon">more_horiz</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="col-comments">
                  <div class="comments-wrap">
                    <span class="material-icons">chat_bubble_outline</span>
                    <span class="comment-count" *ngIf="task.comments">{{ task.comments }}</span>
                  </div>
                </td>
                <td class="col-actions" (click)="$event.stopPropagation()">
                  <button class="btn-icon">
                    <span class="material-icons">more_horiz</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Task Detail Modal -->
        <div class="modal-overlay" *ngIf="showDetails" (click)="closeDetails()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="header-main">
                <span class="material-icons task-header-icon">assignment</span>
                <div>
                  <h2 class="modal-title">{{ selectedTask?.title }}</h2>
                  <p class="modal-subtitle">Student: {{ selectedTask?.student }}</p>
                </div>
              </div>
              <button class="btn-icon" (click)="closeDetails()">
                <span class="material-icons">close</span>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="details-grid">
                <div class="detail-item">
                  <label>Status</label>
                  <select class="modal-select" [(ngModel)]="selectedTask.status" *ngIf="selectedTask">
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div class="detail-item">
                  <label>Priority</label>
                  <select class="modal-select" [(ngModel)]="selectedTask.priority" *ngIf="selectedTask">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div class="detail-item">
                  <label>Assignee</label>
                  <div class="assignee-pill">
                    <div class="avatar">{{ selectedTask?.assignee.charAt(0) }}</div>
                    <span>{{ selectedTask?.assignee }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <label>Due Date</label>
                  <div class="date-pill">
                    <span class="material-icons">event</span>
                    {{ selectedTask?.dueDate }}
                  </div>
                </div>
              </div>

              <div class="description-section">
                <label>Description</label>
                <div class="description-content">
                  This task involves tracking and managing student processing workflows. Ensure all documents are verified and submitted according to university requirements.
                </div>
              </div>

              <div class="comments-section">
                <div class="section-header">
                  <h3>Comments</h3>
                  <span class="count">{{ selectedTask?.comments }}</span>
                </div>
                <div class="comment-input">
                  <div class="avatar">S</div>
                  <input type="text" placeholder="Add a comment...">
                  <button class="btn btn-primary btn-sm">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Footer -->
        <div class="table-card-footer">
          <button class="pagination-btn" disabled>
            <span class="material-icons">arrow_back</span>
            Previous
          </button>
          
          <div class="pagination-pages">
            <button class="page-num active">1</button>
            <button class="page-num">2</button>
            <button class="page-num">3</button>
          </div>

          <button class="pagination-btn">
            Next
            <span class="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .module-container { padding-bottom: 2rem; }
    .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .page-subtitle { color: var(--color-gray-600); margin: 0.25rem 0 0; font-size: 1rem; }

    .empty-state-container { padding: 4rem 2rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--color-gray-300); text-align: center; display: flex; justify-content: center; align-items: center; margin-bottom: 2rem; width: 100%; }
    .empty-state-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .empty-icon { font-size: 3rem; color: var(--color-gray-300); margin-bottom: 0.5rem; }
    .empty-state-content h3 { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-800); margin: 0; }
    .empty-state-content p { color: var(--color-gray-500); margin: 0; font-size: 0.875rem; max-width: 300px; }

    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .view-toggle { display: flex; background: white; border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); padding: 2px; box-shadow: var(--shadow-xs); }
    .toggle-btn { background: none; border: none; width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--color-gray-500); cursor: pointer; transition: all var(--transition-fast); }
    .toggle-btn:hover { color: var(--color-gray-700); background: var(--color-gray-50); }
    .toggle-btn.active { background: var(--color-gray-100); color: var(--color-gray-900); box-shadow: var(--shadow-xs); }


    /* Filters */
    .filters-card {
      background: white;
      padding: 1rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-gray-200);
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
    }
    .search-bar { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid var(--color-gray-300); padding: 0.5rem 0.875rem; border-radius: var(--radius-md); flex: 1; box-shadow: var(--shadow-xs); transition: all var(--transition-fast); }
    .search-bar:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-light); }
    .search-bar .material-icons { color: var(--color-gray-400); font-size: 20px; }
    .search-bar input { background: none; border: none; width: 100%; font-size: 0.875rem; color: var(--color-gray-900); outline: none; }
    .filter-actions { display: flex; gap: 0.75rem; }
    .filter-select { background: white; border: 1px solid var(--color-gray-300); padding: 0.5rem 0.875rem; border-radius: var(--radius-md); color: var(--color-gray-700); font-weight: 500; font-size: 0.875rem; outline: none; box-shadow: var(--shadow-xs); transition: all var(--transition-fast); }
    .filter-select:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-light); }


    .task-row:hover { background: var(--color-gray-50); }
    
    .col-check { width: 40px; }
    .task-title-wrap { display: flex; align-items: center; gap: 0.5rem; }
    .task-title { font-weight: 500; color: var(--color-gray-900); }
    .subtask-icon { font-size: 14px; color: var(--color-gray-300); }
    
    .student-pill { display: flex; align-items: center; gap: 0.5rem; background: var(--color-gray-100); padding: 0.25rem 0.625rem; border-radius: 6px; width: fit-content; font-size: 0.75rem; font-weight: 500; color: var(--color-gray-700); border: 1px solid var(--color-gray-200); }
    .student-pill .avatar { width: 18px; height: 18px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 600; }
    
    .task-row { cursor: pointer; transition: background 0.2s; }
    .task-row:hover { background: var(--color-gray-50); }
    
    /* Custom Dropdown Styles */
    .custom-dropdown-container { position: relative; display: inline-block; }
    
    .trigger-badge {
      border: 1px solid transparent;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.2s;
    }
    .trigger-badge:hover { border-color: var(--color-gray-300); }
    .trigger-badge.high { background: #fef3f2; color: #b42318; }
    .trigger-badge.medium { background: #fffaeb; color: #b54708; }
    .trigger-badge.low { background: #f9fafb; color: #374151; }
    .trigger-badge.to-do { background: #f3f4f6; color: #374151; }
    .trigger-badge.in-progress { background: #eff6ff; color: #1d4ed8; }
    .trigger-badge.done { background: #ecfdf5; color: #047857; }

    .custom-dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: 100;
      background: #242424;
      border: 1px solid #3f3f3f;
      border-radius: 6px;
      width: 240px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      padding: 0.5rem 0;
      color: #e0e0e0;
      text-align: left;
    }
    .dropdown-header {
      font-size: 12px;
      color: #8c8c8c;
      padding: 0.25rem 0.75rem 0.5rem;
      border-bottom: 1px solid #3f3f3f;
      margin-bottom: 0.25rem;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .dropdown-item:hover { background: #333333; }
    .drag-icon { color: #666; font-size: 12px; margin-right: 8px; letter-spacing: -2px; }
    .more-icon { margin-left: auto; color: #8c8c8c; font-size: 16px; opacity: 0; transition: opacity 0.2s; }
    .dropdown-item:hover .more-icon { opacity: 1; }

    .menu-badge {
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      display: inline-block;
    }
    .menu-badge.high { background: #a63a3a; color: #fff; }
    .menu-badge.medium { background: #a66a3a; color: #fff; }
    .menu-badge.low { background: #6b6b6b; color: #fff; }
    .menu-badge.to-do { background: #6b6b6b; color: #fff; }
    .menu-badge.in-progress { background: #2f65a6; color: #fff; }
    .menu-badge.done { background: #2d8a56; color: #fff; }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-content { background: white; border-radius: 12px; width: 600px; max-width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-2xl); border: 1px solid var(--color-gray-200); }
    .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--color-gray-100); display: flex; justify-content: space-between; align-items: flex-start; }
    .header-main { display: flex; gap: 1rem; align-items: center; }
    .task-header-icon { font-size: 32px; color: var(--color-primary); background: var(--color-primary-light); padding: 8px; border-radius: 10px; }
    .modal-title { font-size: 1.25rem; font-weight: 700; color: var(--color-gray-900); margin: 0; }
    .modal-subtitle { font-size: 0.875rem; color: var(--color-gray-500); margin: 4px 0 0; }
    
    .modal-body { padding: 1.5rem; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
    .detail-item label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-400); text-transform: uppercase; margin-bottom: 0.5rem; }
    .modal-select { width: 100%; padding: 0.5rem; border: 1px solid var(--color-gray-200); border-radius: 8px; font-size: 0.875rem; outline: none; }
    .assignee-pill, .date-pill { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: var(--color-gray-700); }
    .assignee-pill .avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; }
    .date-pill span { font-size: 18px; color: var(--color-gray-400); }
    
    .description-section { margin-bottom: 2rem; }
    .description-section label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-400); text-transform: uppercase; margin-bottom: 0.5rem; }
    .description-content { font-size: 0.9375rem; color: var(--color-gray-600); line-height: 1.6; }
    
    .comments-section { border-top: 1px solid var(--color-gray-100); padding-top: 1.5rem; }
    .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .section-header h3 { font-size: 1rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .section-header .count { font-size: 0.75rem; background: var(--color-gray-100); padding: 2px 8px; border-radius: 10px; color: var(--color-gray-600); }
    .comment-input { display: flex; align-items: center; gap: 0.75rem; }
    .comment-input .avatar { width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; color: #4b5563; }
    .comment-input input { flex: 1; border: 1px solid var(--color-gray-200); padding: 0.625rem 1rem; border-radius: 8px; font-size: 0.875rem; outline: none; }
    .btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }

    @media (max-width: 1024px) {
      .filters-card { flex-direction: column; align-items: stretch; }
      .col-priority, .col-due, .col-check, .col-assigned-date, .col-status, .col-comments { display: none; }
    }
  `]
})
export class TaskListComponent {
  searchQuery = '';
  filterStatus = '';
  filterPriority = '';
  
  selectedTask: any = null;
  showDetails = false;
  openDropdown: { taskId: number, field: string } | null = null;

  inProgressTasks = [
    { id: 1, title: 'Visa Application Processing', student: 'Mukul Sharma', assignedDate: '10 Apr 2024', dueDate: '15 Apr 2024', priority: 'High', assignee: 'Siddharth Patel', status: 'In Progress', comments: 3, isOverdue: false },
    { id: 2, title: 'IELTS Score Verification', student: 'Priya Rai', assignedDate: '08 Apr 2024', dueDate: '12 Apr 2024', priority: 'Medium', assignee: 'Rohan Gupta', status: 'In Progress', comments: 0, isOverdue: true },
    { id: 3, title: 'University Offer Letter Review', student: 'Amit Kumar', assignedDate: '14 Apr 2024', dueDate: '20 Apr 2024', priority: 'Low', assignee: 'Siddharth Patel', status: 'In Progress', comments: 1, isOverdue: false }
  ];

  todoTasks = [
    { id: 4, title: 'Passport Scan Collection', student: 'Priya Rai', assignedDate: '20 Apr 2024', dueDate: '25 Apr 2024', priority: 'Medium', assignee: 'Rohan Gupta', status: 'To Do', comments: 0, isOverdue: false },
    { id: 5, title: 'Academic Document Verification', student: 'Amit Kumar', assignedDate: '21 Apr 2024', dueDate: '26 Apr 2024', priority: 'High', assignee: 'Siddharth Patel', status: 'To Do', comments: 2, isOverdue: false }
  ];

  constructor() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      this.openDropdown = null;
    });
  }

  toggleDropdown(taskId: number, field: string) {
    if (this.openDropdown?.taskId === taskId && this.openDropdown?.field === field) {
      this.openDropdown = null;
    } else {
      this.openDropdown = { taskId, field };
    }
  }

  updateTaskField(task: any, field: string, value: string) {
    task[field] = value;
    this.openDropdown = null;
  }

  viewTaskDetails(task: any) {
    this.selectedTask = task;
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedTask = null;
  }
}
