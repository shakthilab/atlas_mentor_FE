import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService, Task, TaskFilter, CreateTaskRequest, ApiError } from '../../../../core/services/task.service';

@Component({
  selector: 'app-task-kanban',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule, FormsModule],
  template: `
    <div class="module-container" [class.panel-open]="selectedTask">
      <div class="module-header">
        <div>
          <h1 class="page-title">Tasks</h1>
          <p class="page-subtitle">Track and manage student processing workflows.</p>
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button class="toggle-btn" [routerLink]="['/admin/tasks']">
              <span class="material-icons">list</span>
              List
            </button>
            <button class="toggle-btn active" [routerLink]="['/admin/tasks/kanban']">
              <span class="material-icons">view_kanban</span>
              Board
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
          <button class="btn btn-icon-secondary">
            <span class="material-icons">tune</span>
          </button>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="kanban-wrapper" cdkDropListGroup>
        <!-- Column: To Do -->
        <div class="kanban-column">
          <div class="column-header">
            <div class="header-left">
              <span class="status-dot todo"></span>
              <h3 class="column-title">To Do</h3>
              <span class="count">{{ todo.length }}</span>
            </div>
            <button class="btn-icon-sm"><span class="material-icons">add</span></button>
          </div>
          
          <div
            cdkDropList
            [cdkDropListData]="todo"
            (cdkDropListDropped)="drop($event, 'To Do')"
            class="task-list">
            <div *ngFor="let task of todo" cdkDrag class="task-card" (click)="openTaskDetails(task)">
              <div class="card-content">
                <h4 class="task-title">{{ task.title }}</h4>
                <p class="task-desc">{{ task.description }}</p>
                
                <div class="card-meta-row">
                  <span class="priority-badge" [ngClass]="task.priority.toLowerCase()">
                    <span class="dot"></span> {{ task.priority }}
                  </span>
                  <div class="assignee-avatar" [style.background]="task.avatarColor">{{ task.assigneeInitial }}</div>
                </div>
              </div>
              <div class="card-footer">
                <div class="footer-item">
                  <span class="material-icons-outlined">event</span>
                  {{ task.dueDate }}
                </div>
                <div class="footer-item">
                  <span class="material-icons-outlined">chat_bubble_outline</span>
                  {{ task.comments }}
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
              <span class="count">{{ inProgress.length }}</span>
            </div>
            <button class="btn-icon-sm"><span class="material-icons">add</span></button>
          </div>
          
          <div
            cdkDropList
            [cdkDropListData]="inProgress"
            (cdkDropListDropped)="drop($event, 'In Progress')"
            class="task-list">
            <div *ngFor="let task of inProgress" cdkDrag class="task-card" (click)="openTaskDetails(task)">
              <div class="card-content">
                <h4 class="task-title">{{ task.title }}</h4>
                <p class="task-desc">{{ task.description }}</p>
                
                <div class="card-meta-row">
                  <span class="priority-badge" [ngClass]="task.priority.toLowerCase()">
                    <span class="dot"></span> {{ task.priority }}
                  </span>
                  <div class="assignee-avatar" [style.background]="task.avatarColor">{{ task.assigneeInitial }}</div>
                </div>
              </div>
              <div class="card-footer">
                <div class="footer-item">
                  <span class="material-icons-outlined">event</span>
                  {{ task.dueDate }}
                </div>
                <div class="footer-item">
                  <span class="material-icons-outlined">chat_bubble_outline</span>
                  {{ task.comments }}
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
              <span class="count">{{ done.length }}</span>
            </div>
            <button class="btn-icon-sm"><span class="material-icons">add</span></button>
          </div>
          
          <div
            cdkDropList
            [cdkDropListData]="done"
            (cdkDropListDropped)="drop($event, 'Done')"
            class="task-list">
            <div *ngFor="let task of done" cdkDrag class="task-card" (click)="openTaskDetails(task)">
              <div class="card-content">
                <h4 class="task-title">{{ task.title }}</h4>
                <p class="task-desc">{{ task.description }}</p>
                
                <div class="card-meta-row">
                  <span class="priority-badge" [ngClass]="task.priority.toLowerCase()">
                    <span class="dot"></span> {{ task.priority }}
                  </span>
                  <div class="assignee-avatar" [style.background]="task.avatarColor">{{ task.assigneeInitial }}</div>
                </div>
              </div>
              <div class="card-footer">
                <div class="footer-item">
                  <span class="material-icons-outlined">event</span>
                  {{ task.dueDate }}
                </div>
                <div class="footer-item">
                  <span class="material-icons-outlined">chat_bubble_outline</span>
                  {{ task.comments }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Side Panel Overlay -->
    <div class="side-panel-overlay" *ngIf="selectedTask" (click)="closeTaskDetails()">
      <div class="side-panel" (click)="$event.stopPropagation()" [class.open]="selectedTask">
        <div class="panel-header">
          <div class="panel-task-id">
            <span class="material-icons-outlined">radio_button_unchecked</span>
            Task · {{ selectedTask.id }}
          </div>
          <button class="btn-icon-sm" (click)="closeTaskDetails()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="panel-body">
          <h2 class="panel-title">{{ selectedTask.title }}</h2>
          
          <div class="panel-grid">
            <div class="grid-item">
              <label><span class="material-icons-outlined">person_outline</span> Assignee</label>
              <div class="assignee-val">
                <div class="assignee-avatar-sm" [style.background]="selectedTask.avatarColor">{{ selectedTask.assigneeInitial }}</div>
                {{ selectedTask.assignee }}
              </div>
            </div>
            <div class="grid-item">
              <label><span class="material-icons-outlined">calendar_today</span> Due date</label>
              <div class="date-val">{{ selectedTask.dueDate }}</div>
            </div>
            
            <div class="grid-item">
              <label><span class="material-icons-outlined">flag</span> Priority</label>
              <div class="dropdown-wrapper">
                <div class="priority-badge-dropdown" [ngClass]="selectedTask.priority.toLowerCase()" (click)="toggleDropdown('priority')">
                  {{ selectedTask.priority }}
                  <span class="material-icons">expand_more</span>
                </div>
                <div class="dropdown-menu" *ngIf="activeDropdown === 'priority'">
                  <div class="dropdown-item" (click)="updateTask('priority', 'High')">High</div>
                  <div class="dropdown-item" (click)="updateTask('priority', 'Medium')">Medium</div>
                  <div class="dropdown-item" (click)="updateTask('priority', 'Low')">Low</div>
                </div>
              </div>
            </div>
            <div class="grid-item">
              <label><span class="material-icons-outlined">radio_button_unchecked</span> Status</label>
              <div class="dropdown-wrapper">
                <div class="status-badge-dropdown" [ngClass]="selectedTask.status.toLowerCase().replace(' ', '-')" (click)="toggleDropdown('status')">
                  {{ selectedTask.status }}
                  <span class="material-icons">expand_more</span>
                </div>
                <div class="dropdown-menu" *ngIf="activeDropdown === 'status'">
                  <div class="dropdown-item" (click)="updateTask('status', 'To Do')">To Do</div>
                  <div class="dropdown-item" (click)="updateTask('status', 'In Progress')">In Progress</div>
                  <div class="dropdown-item" (click)="updateTask('status', 'Done')">Done</div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-section">
            <label class="section-label">DESCRIPTION</label>
            <div class="description-box">
              {{ selectedTask.description }}
            </div>
          </div>

          <div class="tabs-container">
            <div class="tab active">Comments ({{ selectedTask.comments }})</div>
            <div class="tab">Activity</div>
          </div>

          <div class="comments-list">
            <div class="comment-item">
              <div class="comment-avatar" style="background: #3b82f6;">RP</div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">Rohan Patel</span>
                  <span class="comment-time">2h ago</span>
                </div>
                <div class="comment-bubble">
                  Documents look complete. Let's submit by EOD.
                </div>
              </div>
            </div>
            <div class="comment-item">
              <div class="comment-avatar" style="background: #ef4444;">SK</div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">Sara Khan</span>
                  <span class="comment-time">1h ago</span>
                </div>
                <div class="comment-bubble">
                  Embassy slot booked for Friday 10am 👍
                </div>
              </div>
            </div>
            <div class="comment-item">
              <div class="comment-avatar" style="background: #a855f7;">MJ</div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">Mira Joshi</span>
                  <span class="comment-time">12m ago</span>
                </div>
                <div class="comment-bubble">
                  Adding the financial statement scan now.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel-footer">
          <div class="comment-input-wrapper">
            <div class="comment-avatar-small" style="background: #3b82f6;">RP</div>
            <input type="text" placeholder="Write a comment, use @ to mention...">
            <div class="input-actions">
              <span class="material-icons-outlined">alternate_email</span>
              <span class="material-icons-outlined">mood</span>
              <button class="send-btn"><span class="material-icons">send</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Core Layout */
    .module-container { background: var(--color-background-app); padding-bottom: 2rem; transition: filter 0.3s ease; }
    .module-container.panel-open { filter: blur(2px); }
    
    .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 700; color: var(--color-gray-900); margin: 0; font-family: 'Inter', sans-serif; }
    .page-subtitle { color: var(--color-gray-500); margin: 0.25rem 0 0; font-size: 0.9375rem; }

    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .view-toggle { display: flex; background: white; border: 1px solid var(--color-gray-200); border-radius: 8px; padding: 4px; gap: 4px; }
    .toggle-btn { background: transparent; border: none; padding: 6px 12px; border-radius: 6px; display: flex; align-items: center; gap: 6px; color: var(--color-gray-600); font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .toggle-btn .material-icons { font-size: 18px; }
    .toggle-btn:hover { color: var(--color-gray-900); background: var(--color-gray-50); }
    .toggle-btn.active { background: var(--color-gray-100); color: var(--color-gray-900); }

    .btn-primary { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .btn-primary:hover { background: #2563eb; }
    .btn-primary .material-icons { font-size: 18px; }

    /* Filters */
    .filters-card { background: white; padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--color-gray-200); margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .search-bar { display: flex; align-items: center; gap: 0.5rem; background: transparent; flex: 1; }
    .search-bar .material-icons { color: var(--color-gray-400); font-size: 20px; }
    .search-bar input { background: none; border: none; width: 100%; font-size: 0.9375rem; color: var(--color-gray-900); outline: none; }
    .search-bar input::placeholder { color: var(--color-gray-400); }
    
    .filter-actions { display: flex; gap: 0.75rem; align-items: center; }
    .filter-select { background: var(--color-gray-50); border: 1px solid var(--color-gray-200); padding: 6px 12px; border-radius: 8px; color: var(--color-gray-700); font-weight: 500; font-size: 0.875rem; outline: none; cursor: pointer; transition: all 0.2s; }
    .filter-select:hover { background: var(--color-gray-100); }
    
    .btn-icon-secondary { background: white; border: 1px solid var(--color-gray-200); width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--color-gray-600); cursor: pointer; transition: all 0.2s; }
    .btn-icon-secondary:hover { background: var(--color-gray-50); color: var(--color-gray-900); }

    /* Kanban Board */
    .kanban-wrapper { display: flex; gap: 1.5rem; min-height: 60vh; overflow-x: auto; padding-bottom: 1rem; align-items: flex-start; }
    .kanban-column { flex: 0 0 340px; background: #f9fafb; border-radius: 16px; display: flex; flex-direction: column; max-height: calc(100vh - 200px); padding: 6px; }
    
    .column-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px 8px; }
    .header-left { display: flex; align-items: center; gap: 8px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status-dot.todo { background: #4b5563; }
    .status-dot.in-progress { background: #3b82f6; }
    .status-dot.done { background: #10b981; }
    .column-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .count { font-size: 0.75rem; color: var(--color-gray-500); }
    
    .task-list { flex: 1; padding: 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; min-height: 150px; }
    
    /* Task Card */
    .task-card { background: white; border-radius: 12px; border: 1px solid var(--color-gray-200); padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); cursor: pointer; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .task-card:hover { border-color: var(--color-gray-300); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); transform: translateY(-2px); }
    
    .task-title { font-size: 0.9375rem; font-weight: 600; color: var(--color-gray-900); margin: 0 0 6px 0; line-height: 1.4; }
    .task-desc { font-size: 0.8125rem; color: var(--color-gray-500); margin: 0 0 16px 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    .card-meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    
    .priority-badge { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .priority-badge .dot { width: 6px; height: 6px; border-radius: 50%; }
    .priority-badge.high { background: #fef2f2; color: #b91c1c; }
    .priority-badge.high .dot { background: #ef4444; }
    .priority-badge.medium { background: #fffbeb; color: #b45309; }
    .priority-badge.medium .dot { background: #f59e0b; }
    .priority-badge.low { background: #f0fdf4; color: #047857; }
    .priority-badge.low .dot { background: #10b981; }
    
    .assignee-avatar { width: 24px; height: 24px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 600; border: 2px solid white; box-shadow: 0 0 0 1px var(--color-gray-200); }
    
    .card-footer { display: flex; gap: 16px; align-items: center; padding-top: 12px; border-top: 1px solid var(--color-gray-100); }
    .footer-item { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--color-gray-500); font-weight: 500; }
    .footer-item .material-icons-outlined { font-size: 14px; }

    /* CDK Drag & Drop */
    .cdk-drag-preview { box-sizing: border-box; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
    .cdk-drag-placeholder { opacity: 0; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .task-list.cdk-drop-list-receiving .task-card:not(.cdk-drag-placeholder) { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    
    .btn-icon-sm { width: 24px; height: 24px; border-radius: 6px; border: none; background: transparent; color: var(--color-gray-400); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .btn-icon-sm:hover { background: var(--color-gray-200); color: var(--color-gray-700); }

    /* Side Panel Overlay */
    .side-panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.2); z-index: 1000; display: flex; justify-content: flex-end; backdrop-filter: blur(2px); animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    .side-panel { width: 500px; max-width: 100%; height: 100vh; background: white; box-shadow: -4px 0 24px rgba(0,0,0,0.1); display: flex; flex-direction: column; transform: translateX(100%); animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    
    .panel-header { padding: 16px 24px; border-bottom: 1px solid var(--color-gray-200); display: flex; justify-content: space-between; align-items: center; }
    .panel-task-id { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; font-weight: 500; color: var(--color-gray-500); }
    .panel-task-id .material-icons-outlined { font-size: 16px; }
    
    .panel-body { flex: 1; overflow-y: auto; padding: 24px; }
    .panel-title { font-size: 1.5rem; font-weight: 700; color: var(--color-gray-900); margin: 0 0 24px 0; line-height: 1.3; }
    
    .panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
    .grid-item label { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--color-gray-500); margin-bottom: 8px; }
    .grid-item label .material-icons-outlined { font-size: 16px; }
    
    .assignee-val { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; font-weight: 500; color: var(--color-gray-900); }
    .assignee-avatar-sm { width: 24px; height: 24px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 600; }
    .date-val { font-size: 0.875rem; font-weight: 500; color: var(--color-gray-900); }
    
    .dropdown-wrapper { position: relative; }
    .priority-badge-dropdown, .status-badge-dropdown { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
    .priority-badge-dropdown:hover, .status-badge-dropdown:hover { background: var(--color-gray-50); border-color: var(--color-gray-200); }
    
    .priority-badge-dropdown.high { color: #b91c1c; background: #fef2f2; }
    .priority-badge-dropdown.medium { color: #b45309; background: #fffbeb; }
    .priority-badge-dropdown.low { color: #047857; background: #f0fdf4; }
    
    .status-badge-dropdown.to-do { color: #4b5563; background: #f3f4f6; }
    .status-badge-dropdown.in-progress { color: #1d4ed8; background: #eff6ff; }
    .status-badge-dropdown.done { color: #047857; background: #ecfdf5; }
    
    .priority-badge-dropdown .material-icons, .status-badge-dropdown .material-icons { font-size: 16px; }

    .dropdown-menu { position: absolute; top: 100%; left: 0; margin-top: 4px; background: white; border: 1px solid var(--color-gray-200); border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); width: 100%; z-index: 10; padding: 4px; }
    .dropdown-item { padding: 6px 12px; font-size: 0.8125rem; cursor: pointer; border-radius: 4px; transition: background 0.2s; }
    .dropdown-item:hover { background: var(--color-gray-50); }

    .panel-section { margin-bottom: 32px; }
    .section-label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-500); letter-spacing: 0.05em; margin-bottom: 12px; }
    .description-box { font-size: 0.9375rem; color: var(--color-gray-700); line-height: 1.6; background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid var(--color-gray-100); }
    
    .tabs-container { display: flex; gap: 24px; border-bottom: 1px solid var(--color-gray-200); margin-bottom: 24px; }
    .tab { padding-bottom: 12px; font-size: 0.875rem; font-weight: 600; color: var(--color-gray-500); cursor: pointer; position: relative; }
    .tab.active { color: var(--color-gray-900); }
    .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #3b82f6; border-radius: 2px 2px 0 0; }
    
    .comments-list { display: flex; flex-direction: column; gap: 20px; }
    .comment-item { display: flex; gap: 12px; }
    .comment-avatar { width: 32px; height: 32px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
    .comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .comment-author { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); }
    .comment-time { font-size: 0.75rem; color: var(--color-gray-500); }
    .comment-bubble { background: #f3f4f6; padding: 10px 14px; border-radius: 0 12px 12px 12px; font-size: 0.875rem; color: var(--color-gray-800); line-height: 1.5; display: inline-block; }
    
    .panel-footer { padding: 16px 24px; border-top: 1px solid var(--color-gray-200); background: white; }
    .comment-input-wrapper { display: flex; align-items: center; gap: 12px; }
    .comment-avatar-small { width: 32px; height: 32px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
    .comment-input-wrapper input { flex: 1; border: 1px solid var(--color-gray-200); padding: 10px 16px; border-radius: 24px; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
    .comment-input-wrapper input:focus { border-color: #3b82f6; }
    .input-actions { display: flex; align-items: center; gap: 8px; }
    .input-actions .material-icons-outlined { color: var(--color-gray-400); cursor: pointer; transition: color 0.2s; font-size: 20px; }
    .input-actions .material-icons-outlined:hover { color: var(--color-gray-600); }
    .send-btn { background: #3b82f6; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
    .send-btn:hover { background: #2563eb; }
    .send-btn .material-icons { font-size: 16px; }

    @media (max-width: 768px) {
      .filters-card { flex-direction: column; align-items: stretch; }
      .filter-actions { flex-wrap: wrap; }
      .kanban-wrapper { padding-bottom: 2rem; }
      .side-panel { width: 100%; }
    }
  `]
})
export class TaskKanbanComponent implements OnInit {
  searchQuery = '';
  filterStatus = '';
  filterPriority = '';

  tasks: Task[] = [];
  todo: Task[] = [];
  inProgress: Task[] = [];
  done: Task[] = [];
  selectedTask: Task | null = null;
  activeDropdown: string | null = null;
  loading = false;
  error: string | null = null;
  validationErrors: any[] = [];

  private taskService = inject(TaskService);

  constructor() {
    // Close dropdowns when clicking outside (rudimentary approach)
    document.addEventListener('click', () => {
      this.activeDropdown = null;
    });
  }

  ngOnInit() {
    this.loadTasks();
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
    this.todo = this.tasks.filter(task => task.status === 'TO_DO');
    this.inProgress = this.tasks.filter(task => task.status === 'IN_PROGRESS');
    this.done = this.tasks.filter(task => task.status === 'DONE');
  }

  drop(event: CdkDragDrop<any[]>, newStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      item.status = newStatus;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  openTaskDetails(task: Task) {
    this.loading = true;
    this.taskService.getTaskDetails(task.id).subscribe({
      next: (taskDetails) => {
        this.selectedTask = taskDetails.task;
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

  closeTaskDetails() {
    this.selectedTask = null;
    this.activeDropdown = null;
  }

  toggleDropdown(type: string) {
    event?.stopPropagation();
    this.activeDropdown = this.activeDropdown === type ? null : type;
  }

  updateTask(field: keyof Task, value: string) {
    if (this.selectedTask) {
      if (field === 'status') {
        this.taskService.updateStatus(this.selectedTask.id, value as Task['status']).subscribe({
          next: () => {
            (this.selectedTask as any)[field] = value;
            this.loadTasks(); // Refresh task list
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
          },
          error: (err: ApiError) => {
            this.error = err.message || 'Failed to update priority';
            this.validationErrors = err.errors || [];
            console.error('Error updating priority:', err);
          }
        });
      } else {
        (this.selectedTask as any)[field] = value;
      }
    }
    this.activeDropdown = null;
  }

  addComment(comment: string) {
    if (!this.selectedTask || !comment.trim()) return;
    
    this.taskService.addComment(this.selectedTask.id, comment).subscribe({
      next: () => {
        if (this.selectedTask) {
          this.openTaskDetails(this.selectedTask); // Reload task details to show new comment
        }
      },
      error: (err: ApiError) => {
        this.error = err.message || 'Failed to add comment';
        this.validationErrors = err.errors || [];
        console.error('Error adding comment:', err);
      }
    });
  }
}
