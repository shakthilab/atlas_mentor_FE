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
        <div class="header-left">
          <h1 class="page-title">Tasks</h1>
          <p class="page-subtitle">Track and manage student processing workflows.</p>
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button class="toggle-btn active" [routerLink]="['/admin/tasks']">
              <span class="material-icons">list</span>
              <span>List</span>
            </button>
            <button class="toggle-btn" [routerLink]="['/admin/tasks/kanban']">
              <span class="material-icons">grid_view</span>
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
          <input type="text" placeholder="Search tasks..." [(ngModel)]="searchQuery">
        </div>
        <div class="filter-actions">
          <div class="filter-dropdown">
            <select class="filter-select" [(ngModel)]="filterStatus">
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <span class="material-icons dropdown-chevron">expand_more</span>
          </div>
          <div class="filter-dropdown">
            <select class="filter-select" [(ngModel)]="filterPriority">
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <span class="material-icons dropdown-chevron">expand_more</span>
          </div>
          <button class="btn-icon-secondary">
            <span class="material-icons">tune</span>
          </button>
        </div>
      </div>

      <div class="empty-state-container" *ngIf="inProgressTasks.length === 0 && todoTasks.length === 0 && doneTasks.length === 0">
        <div class="empty-state-content">
          <span class="material-icons empty-icon">assignment</span>
          <h3>No Tasks Found</h3>
          <p>There are currently no tasks assigned. Create your first task to get started.</p>
        </div>
      </div>

      <!-- Task Card List -->
      <div class="task-list-wrapper">
        
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
                    <span>{{ task.comments }}</span>
                  </div>

                  <div class="meta-item assignee">
                    <div class="avatar-circle" [attr.data-initials]="task.assignee" [ngClass]="'avatar-' + task.assignee.toLowerCase()">
                      {{ task.assignee }}
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
            <div *ngFor="let task of todoTasks" class="task-card-row" [class.selected]="task.selected" (click)="viewTaskDetails(task)">
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
                    <span>{{ task.comments }}</span>
                  </div>

                  <div class="meta-item assignee">
                    <div class="avatar-circle" [attr.data-initials]="task.assignee" [ngClass]="'avatar-' + task.assignee.toLowerCase()">
                      {{ task.assignee }}
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
                    <span>{{ task.comments }}</span>
                  </div>

                  <div class="meta-item assignee">
                    <div class="avatar-circle" [attr.data-initials]="task.assignee" [ngClass]="'avatar-' + task.assignee.toLowerCase()">
                      {{ task.assignee }}
                    </div>
                  </div>
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
            <h2 class="modal-title">Create New Task</h2>
            <button class="btn-icon" (click)="closeCreateModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Task Title</label>
              <input type="text" class="form-control" placeholder="e.g. Verify Academic Documents" [(ngModel)]="newTask.title">
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="form-control" rows="2" placeholder="Add task details..." [(ngModel)]="newTask.description"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Student Name</label>
                <input type="text" class="form-control" placeholder="Search student..." [(ngModel)]="newTask.student">
              </div>
              <div class="form-group flex-1">
                <label>Assignee (Initials)</label>
                <input type="text" class="form-control" placeholder="e.g. SK" [(ngModel)]="newTask.assignee">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Priority</label>
                <select class="form-control" [(ngModel)]="newTask.priority">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>Due Date</label>
                <input type="text" class="form-control" placeholder="Apr 15, 2026" [(ngModel)]="newTask.dueDate">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeCreateModal()">Cancel</button>
            <button class="btn-primary" (click)="createTask()">Create Task</button>
          </div>
        </div>
      </div>

      <!-- Side Panel Overlay (identical to board) -->
      <div class="side-panel-overlay" *ngIf="showDetails" (click)="closeDetails()">
        <div class="side-panel" (click)="$event.stopPropagation()" [class.open]="showDetails">
          <div class="panel-header">
            <div class="panel-task-id">
              <span class="material-icons-outlined">radio_button_unchecked</span>
              Task · {{ selectedTask?.id }}
            </div>
            <button class="btn-icon-sm" (click)="closeDetails()">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="panel-body">
            <h2 class="panel-title">{{ selectedTask?.title }}</h2>

            <div class="panel-grid">
              <div class="grid-item">
                <label><span class="material-icons-outlined">person_outline</span> Assignee</label>
                <div class="assignee-val">
                  <div class="assignee-avatar-sm" [ngClass]="'avatar-' + selectedTask?.assignee?.toLowerCase()">
                    {{ selectedTask?.assignee }}
                  </div>
                  {{ selectedTask?.assignee }}
                </div>
              </div>
              <div class="grid-item">
                <label><span class="material-icons-outlined">calendar_today</span> Due date</label>
                <div class="date-val">{{ selectedTask?.dueDate }}</div>
              </div>

              <div class="grid-item">
                <label><span class="material-icons-outlined">flag</span> Priority</label>
                <div class="dropdown-wrapper">
                  <div class="priority-badge-dropdown" [ngClass]="selectedTask?.priority?.toLowerCase()" (click)="togglePanelDropdown('priority')">
                    {{ selectedTask?.priority }}
                    <span class="material-icons">expand_more</span>
                  </div>
                  <div class="dropdown-menu" *ngIf="panelDropdown === 'priority'">
                    <div class="dropdown-item" (click)="updateSelectedTask('priority', 'High')">High</div>
                    <div class="dropdown-item" (click)="updateSelectedTask('priority', 'Medium')">Medium</div>
                    <div class="dropdown-item" (click)="updateSelectedTask('priority', 'Low')">Low</div>
                  </div>
                </div>
              </div>
              <div class="grid-item">
                <label><span class="material-icons-outlined">radio_button_unchecked</span> Status</label>
                <div class="dropdown-wrapper">
                  <div class="status-badge-dropdown" [ngClass]="selectedTask?.status?.toLowerCase()?.replace(' ', '-')" (click)="togglePanelDropdown('status')">
                    {{ selectedTask?.status }}
                    <span class="material-icons">expand_more</span>
                  </div>
                  <div class="dropdown-menu" *ngIf="panelDropdown === 'status'">
                    <div class="dropdown-item" (click)="updateSelectedTask('status', 'To Do')">To Do</div>
                    <div class="dropdown-item" (click)="updateSelectedTask('status', 'In Progress')">In Progress</div>
                    <div class="dropdown-item" (click)="updateSelectedTask('status', 'Done')">Done</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="panel-section">
              <label class="section-label">DESCRIPTION</label>
              <div class="description-box">{{ selectedTask?.description }}</div>
            </div>

            <div class="tabs-container">
              <div class="tab" [class.active]="activeTab === 'comments'" (click)="activeTab = 'comments'">Comments ({{ selectedTask?.comments }})</div>
              <div class="tab" [class.active]="activeTab === 'activity'" (click)="activeTab = 'activity'">Activity</div>
            </div>

            <!-- Comments Tab -->
            <div class="comments-list" *ngIf="activeTab === 'comments'">
              <div class="comment-item">
                <div class="comment-avatar" style="background: #3b82f6;">RP</div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">Rohan Patel</span>
                    <span class="comment-time">2h ago</span>
                  </div>
                  <div class="comment-bubble">Documents look complete. Let's submit by EOD.</div>
                </div>
              </div>
              <div class="comment-item">
                <div class="comment-avatar" style="background: #ef4444;">SK</div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">Sara Khan</span>
                    <span class="comment-time">1h ago</span>
                  </div>
                  <div class="comment-bubble">Embassy slot booked for Friday 10am 👍</div>
                </div>
              </div>
              <div class="comment-item">
                <div class="comment-avatar" style="background: #a855f7;">MJ</div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">Mira Joshi</span>
                    <span class="comment-time">12m ago</span>
                  </div>
                  <div class="comment-bubble">Adding the financial statement scan now.</div>
                </div>
              </div>
            </div>

            <!-- Activity Tab -->
            <div class="activity-list" *ngIf="activeTab === 'activity'">
              <div class="activity-item">
                <div class="activity-dot" style="background: #3b82f6;"></div>
                <div class="activity-content">
                  <span class="activity-text"><strong>Sara Khan</strong> changed status to <span class="activity-badge in-progress">In Progress</span></span>
                  <span class="activity-time">3h ago</span>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-dot" style="background: #f59e0b;"></div>
                <div class="activity-content">
                  <span class="activity-text"><strong>Rohan Patel</strong> changed priority to <span class="activity-badge high">High</span></span>
                  <span class="activity-time">5h ago</span>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-dot" style="background: #10b981;"></div>
                <div class="activity-content">
                  <span class="activity-text"><strong>Mira Joshi</strong> was assigned to this task</span>
                  <span class="activity-time">Yesterday</span>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-dot" style="background: #6b7280;"></div>
                <div class="activity-content">
                  <span class="activity-text"><strong>Sara Khan</strong> created this task</span>
                  <span class="activity-time">Apr 10, 2026</span>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-footer" *ngIf="activeTab === 'comments'">
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
    </div>
  `,
  styles: [`
    :host { display: block; background-color: #fcfcfd; min-height: 100vh; }
    .module-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    
    .module-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 700; color: #101828; margin: 0; letter-spacing: -0.02em; }
    .page-subtitle { color: #667085; margin: 0.5rem 0 0; font-size: 1rem; }
    
    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .view-toggle { display: flex; background: #f2f4f7; padding: 4px; border-radius: 10px; border: 1px solid #eaecf0; }
    .toggle-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: none; background: transparent; color: #667085; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .toggle-btn.active { background: white; color: #344054; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.1); }
    .toggle-btn .material-icons { font-size: 20px; }

    .btn-primary { background: #2e90fa; color: white; border: 1px solid #2e90fa; padding: 10px 18px; border-radius: 10px; font-weight: 600; font-size: 0.875rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05); }
    .btn-primary:hover { background: #1570ef; border-color: #1570ef; }

    /* Filters Card */
    .filters-card { background: white; padding: 16px 24px; border-radius: 12px; border: 1px solid #eaecf0; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05); }
    .search-bar { display: flex; align-items: center; gap: 12px; flex: 1; max-width: 480px; }
    .search-bar .material-icons { color: #667085; font-size: 20px; }
    .search-bar input { border: none; outline: none; width: 100%; font-size: 0.9375rem; color: #101828; }
    .search-bar input::placeholder { color: #667085; }

    .filter-actions { display: flex; gap: 12px; align-items: center; }
    .filter-dropdown { position: relative; display: flex; align-items: center; }
    .filter-select { appearance: none; background: white; border: 1px solid #d0d5dd; padding: 10px 36px 10px 14px; border-radius: 8px; color: #344054; font-size: 0.875rem; font-weight: 600; outline: none; cursor: pointer; transition: all 0.2s; min-width: 140px; }
    .filter-select:hover { border-color: #98a2b3; }
    .dropdown-chevron { position: absolute; right: 10px; color: #667085; font-size: 20px; pointer-events: none; }
    
    .btn-icon-secondary { background: white; border: 1px solid #d0d5dd; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #667085; cursor: pointer; transition: all 0.2s; }
    .btn-icon-secondary:hover { background: #f9fafb; border-color: #98a2b3; }

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
    .modal-content { background: white; border-radius: 20px; width: 640px; max-width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03); border: 1px solid #eaecf0; }
    .modal-header { padding: 24px; border-bottom: 1px solid #eaecf0; display: flex; justify-content: space-between; align-items: center; }
    .modal-title { font-size: 1.25rem; font-weight: 700; color: #101828; margin: 0; }
    .btn-icon { background: transparent; border: none; color: #667085; cursor: pointer; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon:hover { background: #f2f4f7; }
    
    .modal-body { padding: 24px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #344054; margin-bottom: 6px; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #d0d5dd; border-radius: 8px; font-size: 0.9375rem; outline: none; transition: all 0.2s; box-sizing: border-box; }
    .form-control:focus { border-color: #2e90fa; box-shadow: 0 0 0 4px rgba(46, 144, 250, 0.1); }
    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }

    .modal-footer { padding: 24px; border-top: 1px solid #eaecf0; display: flex; justify-content: flex-end; gap: 12px; }
    .btn-secondary { background: white; border: 1px solid #d0d5dd; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 0.875rem; color: #344054; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: #f9fafb; }

    /* Side Panel — identical to board */
    .side-panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.2); z-index: 1000; display: flex; justify-content: flex-end; backdrop-filter: blur(2px); animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .side-panel { width: 500px; max-width: 100%; height: 100vh; background: white; box-shadow: -4px 0 24px rgba(0,0,0,0.1); display: flex; flex-direction: column; transform: translateX(100%); animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
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
  `]
})
export class TaskListComponent {
  searchQuery = '';
  filterStatus = '';
  filterPriority = '';
  
  selectedTask: any = null;
  showDetails = false;
  showCreateModal = false;
  panelDropdown: string | null = null;
  activeTab: string = 'comments';
  activeActionMenu: number | null = null;
  openDropdown: { taskId: number, field: string } | null = null;

  newTask: any = {
    title: '',
    description: '',
    student: '',
    priority: 'Medium',
    assignee: '',
    dueDate: '',
    status: 'To Do'
  };

  inProgressTasks = [
    { id: 1, title: 'Visa Application Processing', description: 'Review and submit visa documentation for the UK student visa application. Coordinate with the embassy for the appointment slot.', student: 'Mukul Sharma', assignedDate: '10 Apr 2026', dueDate: 'Apr 15, 2026', priority: 'High', assignee: 'SK', status: 'In Progress', comments: 3, isOverdue: false },
    { id: 2, title: 'IELTS Score Verification', description: 'Verify candidate IELTS scores with the official IELTS portal and attach the verification certificate.', student: 'Priya Rai', assignedDate: '08 Apr 2026', dueDate: 'Apr 12, 2026', priority: 'Medium', assignee: 'RM', status: 'In Progress', comments: 1, isOverdue: false },
    { id: 3, title: 'University Offer Letter Review', description: 'Cross-check offer letter details for accuracy: name, course, intake, fees, and conditions.', student: 'Amit Kumar', assignedDate: '14 Apr 2026', dueDate: 'Apr 20, 2026', priority: 'Low', assignee: 'SK', status: 'In Progress', comments: 0, isOverdue: false }
  ];

  todoTasks = [
    { id: 4, title: 'Passport Scan Collection', description: 'Collect high-resolution passport scans from the student and verify legibility.', student: 'Priya Rai', assignedDate: '20 Apr 2026', dueDate: 'Apr 25, 2026', priority: 'Medium', assignee: 'RM', status: 'To Do', comments: 0, isOverdue: false, selected: true },
    { id: 5, title: 'Academic Document Verification', description: 'Verify academic transcripts and degree certificates with issuing institutions.', student: 'Amit Kumar', assignedDate: '21 Apr 2026', dueDate: 'Apr 26, 2026', priority: 'High', assignee: 'SK', status: 'To Do', comments: 2, isOverdue: false }
  ];

  doneTasks = [
    { id: 6, title: 'Financial Aid Application', description: 'Prepare and submit financial aid forms with supporting bank statements.', student: 'Sonal Singh', assignedDate: '05 Apr 2026', dueDate: 'Apr 9, 2026', priority: 'High', assignee: 'AV', status: 'Done', comments: 0, isOverdue: false },
    { id: 7, title: 'Onboarding Welcome Pack', description: 'Send the welcome pack with orientation details to the newly enrolled student.', student: 'Rahul Verma', assignedDate: '01 Apr 2026', dueDate: 'Apr 7, 2026', priority: 'Low', assignee: 'MJ', status: 'Done', comments: 0, isOverdue: false }
  ];

  constructor() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      this.openDropdown = null;
      this.activeActionMenu = null;
    });
  }

  openCreateModal() {
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
      student: '',
      priority: 'Medium',
      assignee: '',
      dueDate: '',
      status: 'To Do'
    };
  }

  createTask() {
    if (!this.newTask.title) return;
    
    const task = {
      ...this.newTask,
      id: Math.max(...this.inProgressTasks.map(t => t.id), ...this.todoTasks.map(t => t.id), ...this.doneTasks.map(t => t.id)) + 1,
      assignedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      comments: 0,
      isOverdue: false
    };

    if (task.status === 'In Progress') {
      this.inProgressTasks.unshift(task);
    } else if (task.status === 'Done') {
      this.doneTasks.unshift(task);
    } else {
      this.todoTasks.unshift(task);
    }

    this.closeCreateModal();
  }

  deleteTask(task: any) {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.inProgressTasks = this.inProgressTasks.filter(t => t.id !== task.id);
      this.todoTasks = this.todoTasks.filter(t => t.id !== task.id);
      this.doneTasks = this.doneTasks.filter(t => t.id !== task.id);
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

  updateTaskField(task: any, field: string, value: string) {
    const oldStatus = task.status;
    task[field] = value;
    
    // Move between lists if status changed
    if (field === 'status' && oldStatus !== value) {
      this.moveTask(task, oldStatus, value);
    }
    
    this.openDropdown = null;
  }

  moveTask(task: any, from: string, to: string) {
    // Remove from old list
    if (from === 'In Progress') {
      this.inProgressTasks = this.inProgressTasks.filter(t => t.id !== task.id);
    } else if (from === 'To Do') {
      this.todoTasks = this.todoTasks.filter(t => t.id !== task.id);
    } else if (from === 'Done') {
      this.doneTasks = this.doneTasks.filter(t => t.id !== task.id);
    }

    // Add to new list
    if (to === 'In Progress') {
      this.inProgressTasks.unshift(task);
    } else if (to === 'To Do') {
      this.todoTasks.unshift(task);
    } else if (to === 'Done') {
      this.doneTasks.unshift(task);
    }
  }

  viewTaskDetails(task: any) {
    this.selectedTask = task;
    this.showDetails = true;
    this.activeTab = 'comments';
    this.panelDropdown = null;
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

  updateSelectedTask(field: string, value: string) {
    if (this.selectedTask) {
      const oldStatus = this.selectedTask.status;
      this.selectedTask[field] = value;
      if (field === 'status' && oldStatus !== value) {
        this.moveTask(this.selectedTask, oldStatus, value);
      }
    }
    this.panelDropdown = null;
  }
}
