import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskComment, Activity, TaskService, ApiError } from '../../../../../core/services/task.service';
import { RoleConfigService } from '../../../../../core/services/role-config.service';

@Component({
  selector: 'app-task-detail-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="side-panel-overlay" (click)="onClose()">
      <div class="side-panel" (click)="$event.stopPropagation()" [class.open]="task">
        <div class="panel-header">
          <div class="panel-task-id">
            <span class="material-icons-outlined">assignment</span>
            TASK · {{ task?.id }}
          </div>
          <button class="btn-icon-sm" (click)="onClose()">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="panel-body">
          <div class="title-section">
             <h2 class="panel-title">{{ task?.title }}</h2>
             <p class="task-created-info">Created on {{ task?.createdAt | date:'MMM d, yyyy' }} by {{ task?.assignerName || 'System' }}</p>
          </div>

          <div class="panel-grid">
            <div class="grid-item">
              <label><span class="material-icons-outlined">person_outline</span> Assignee</label>
              <div class="assignee-val">
                <div class="assignee-avatar-sm" [style.background]="getAvatarColor(task?.assigneeName)">
                  {{ getInitials(task?.assigneeName) }}
                </div>
                {{ task?.assigneeName || 'Unassigned' }}
              </div>
            </div>
            
            <div class="grid-item">
              <label><span class="material-icons-outlined">calendar_today</span> Due date</label>
              <div class="date-val">{{ task?.dueDate | date:'MMM d, yyyy' }}</div>
            </div>

            <div class="grid-item">
              <label><span class="material-icons-outlined">flag</span> Priority</label>
              <div class="dropdown-wrapper">
                <div class="priority-badge-dropdown" [ngClass]="task?.priority?.toLowerCase()" (click)="canEditPriority() ? toggleDropdown('priority') : null" [style.cursor]="canEditPriority() ? 'pointer' : 'default'">
                  <span class="priority-dot"></span>
                  {{ task?.priority }}
                  <span class="material-icons" *ngIf="canEditPriority()">expand_more</span>
                </div>
                <div class="dropdown-menu" *ngIf="activeDropdown === 'priority'">
                  <div class="dropdown-item" (click)="onUpdateField('priority', 'HIGH')">
                    <span class="priority-dot high"></span> High
                  </div>
                  <div class="dropdown-item" (click)="onUpdateField('priority', 'MEDIUM')">
                    <span class="priority-dot medium"></span> Medium
                  </div>
                  <div class="dropdown-item" (click)="onUpdateField('priority', 'LOW')">
                    <span class="priority-dot low"></span> Low
                  </div>
                </div>
              </div>
            </div>

            <div class="grid-item">
              <label><span class="material-icons-outlined">radio_button_unchecked</span> Status</label>
              <div class="dropdown-wrapper">
                <div class="status-badge-dropdown" [ngClass]="task?.status?.toLowerCase()?.replace(' ', '-')" (click)="toggleDropdown('status')">
                  {{ task?.status }}
                  <span class="material-icons">expand_more</span>
                </div>
                <div class="dropdown-menu" *ngIf="activeDropdown === 'status'">
                  <div class="dropdown-item" (click)="onUpdateField('status', 'TO_DO')">To Do</div>
                  <div class="dropdown-item" (click)="onUpdateField('status', 'IN_PROGRESS')">In Progress</div>
                  <div class="dropdown-item" (click)="onUpdateField('status', 'DONE')">Done</div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-section">
            <label class="section-label">DESCRIPTION</label>
            <div class="description-box" *ngIf="task?.description; else noDesc">
              {{ task?.description }}
            </div>
            <ng-template #noDesc>
              <div class="description-box empty">No description provided.</div>
            </ng-template>
          </div>

          <div class="tabs-container">
            <div class="tab" [class.active]="activeTab === 'comments'" (click)="activeTab = 'comments'">
              Comments <span class="tab-count">{{ comments.length }}</span>
            </div>
            <div class="tab" [class.active]="activeTab === 'activity'" (click)="activeTab = 'activity'">
              Activity
            </div>
          </div>

          <!-- Comments Tab -->
          <div class="tab-content" *ngIf="activeTab === 'comments'">
            <div class="comments-list" *ngIf="comments.length > 0; else noComments">
              <div class="comment-item" *ngFor="let comment of comments">
                <div class="comment-avatar" [style.background]="getAvatarColor(comment.commentedByName)">
                  {{ getInitials(comment.commentedByName) }}
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.commentedByName }}</span>
                    <span class="comment-time">{{ getTimeAgo(comment.createdAt) }}</span>
                  </div>
                  <div class="comment-bubble">{{ comment.comment }}</div>
                </div>
              </div>
            </div>
            <ng-template #noComments>
              <div class="empty-state-mini">
                <span class="material-icons-outlined">chat_bubble_outline</span>
                <p>No comments yet. Be the first to chime in!</p>
              </div>
            </ng-template>
          </div>

          <!-- Activity Tab -->
          <div class="tab-content" *ngIf="activeTab === 'activity'">
            <div class="activity-timeline" *ngIf="activities.length > 0; else noActivity">
              <div class="activity-item" *ngFor="let activity of activities">
                <div class="activity-marker" [ngClass]="activity.action.toLowerCase()"></div>
                <div class="activity-details">
                  <p class="activity-msg" [innerHTML]="formatActivityMessage(activity)"></p>
                  <span class="activity-time">{{ getTimeAgo(activity.createdAt) }}</span>
                </div>
              </div>
            </div>
            <ng-template #noActivity>
              <div class="empty-state-mini">
                <span class="material-icons-outlined">history</span>
                <p>No activity history found.</p>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="panel-footer" *ngIf="activeTab === 'comments'">
          <div class="comment-input-wrapper" [class.focused]="isCommentFocused">
            <input 
              type="text" 
              placeholder="Write a comment..." 
              [(ngModel)]="newComment"
              (focus)="isCommentFocused = true"
              (blur)="isCommentFocused = false"
              (keyup.enter)="onPostComment()">
            <div class="input-actions">
              <button class="send-btn" [disabled]="!newComment.trim() || isSubmitting" (click)="onPostComment()">
                <span class="material-icons" *ngIf="!isSubmitting">send</span>
                <span class="spinner" *ngIf="isSubmitting"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .side-panel-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(16, 24, 40, 0.4); z-index: 2000; display: flex; justify-content: flex-end; backdrop-filter: blur(4px); transition: all 0.3s ease; }
    .side-panel { width: 520px; max-width: 100%; height: 100vh; background: white; box-shadow: -10px 0 30px rgba(0,0,0,0.1); display: flex; flex-direction: column; transform: translateX(100%); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

    .panel-header { padding: 20px 24px; border-bottom: 1px solid #f2f4f7; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
    .panel-task-id { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 700; color: #667085; letter-spacing: 0.05em; }
    .panel-task-id .material-icons-outlined { font-size: 18px; color: #98a2b3; }

    .panel-body { flex: 1; overflow-y: auto; padding: 32px 24px; }
    .title-section { margin-bottom: 32px; }
    .panel-title { font-size: 1.75rem; font-weight: 700; color: #101828; margin: 0 0 8px 0; line-height: 1.3; letter-spacing: -0.02em; }
    .task-created-info { font-size: 0.875rem; color: #667085; margin: 0; }

    .panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; }
    .grid-item label { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; font-weight: 600; color: #475467; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.02em; }
    .grid-item label .material-icons-outlined { font-size: 16px; color: #98a2b3; }

    .assignee-val { display: flex; align-items: center; gap: 10px; font-size: 0.9375rem; font-weight: 600; color: #101828; }
    .assignee-avatar-sm { width: 28px; height: 28px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
    .date-val { font-size: 0.9375rem; font-weight: 600; color: #101828; padding: 4px 0; }

    .dropdown-wrapper { position: relative; }
    .priority-badge-dropdown, .status-badge-dropdown { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid #eaecf0; background: white; }
    .priority-badge-dropdown:hover, .status-badge-dropdown:hover { border-color: #d0d5dd; background: #f9fafb; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05); }
    
    .priority-dot { width: 8px; height: 8px; border-radius: 50%; }
    .priority-badge-dropdown.high { color: #b42318; }
    .priority-badge-dropdown.high .priority-dot { background: #d92d20; }
    .priority-badge-dropdown.medium { color: #b54708; }
    .priority-badge-dropdown.medium .priority-dot { background: #f79009; }
    .priority-badge-dropdown.low { color: #067647; }
    .priority-badge-dropdown.low .priority-dot { background: #12b76a; }

    .priority-dot.high { background: #d92d20; }
    .priority-dot.medium { background: #f79009; }
    .priority-dot.low { background: #12b76a; }

    .status-badge-dropdown.to-do { color: #344054; }
    .status-badge-dropdown.in-progress { color: #175cd3; background: #eff8ff; border-color: #d1e9ff; }
    .status-badge-dropdown.done { color: #067647; background: #ecfdf3; border-color: #abefc6; }
    
    .dropdown-menu { position: absolute; top: 100%; left: 0; margin-top: 8px; background: white; border: 1px solid #eaecf0; border-radius: 12px; box-shadow: 0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03); width: 180px; z-index: 100; padding: 6px; overflow: hidden; animation: popIn 0.2s ease; }
    @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .dropdown-item { padding: 10px 12px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border-radius: 6px; transition: all 0.2s; color: #344054; display: flex; align-items: center; gap: 10px; }
    .dropdown-item:hover { background: #f2f4f7; color: #101828; }

    .panel-section { margin-bottom: 40px; }
    .section-label { display: block; font-size: 0.8125rem; font-weight: 700; color: #475467; letter-spacing: 0.05em; margin-bottom: 12px; text-transform: uppercase; }
    .description-box { font-size: 1rem; color: #344054; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #f2f4f7; white-space: pre-wrap; }
    .description-box.empty { color: #98a2b3; font-style: italic; }

    .tabs-container { display: flex; gap: 32px; border-bottom: 1px solid #eaecf0; margin-bottom: 24px; }
    .tab { padding-bottom: 16px; font-size: 0.9375rem; font-weight: 700; color: #667085; cursor: pointer; position: relative; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .tab:hover { color: #344054; }
    .tab.active { color: #101828; }
    .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 3px; background: #3b82f6; border-radius: 3px 3px 0 0; }
    .tab-count { background: #f2f4f7; color: #667085; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
    .tab.active .tab-count { background: #eff8ff; color: #175cd3; }

    .comments-list { display: flex; flex-direction: column; gap: 24px; padding-bottom: 20px; }
    .comment-item { display: flex; gap: 14px; }
    .comment-avatar { width: 36px; height: 36px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 700; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .comment-content { flex: 1; min-width: 0; }
    .comment-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .comment-author { font-size: 0.875rem; font-weight: 700; color: #101828; }
    .comment-time { font-size: 0.75rem; color: #667085; }
    .comment-bubble { background: #f2f4f7; padding: 12px 16px; border-radius: 0 16px 16px 16px; font-size: 0.9375rem; color: #344054; line-height: 1.5; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }

    .activity-timeline { display: flex; flex-direction: column; gap: 0; position: relative; padding-left: 20px; }
    .activity-timeline::before { content: ''; position: absolute; left: 0; top: 10px; bottom: 10px; width: 2px; background: #f2f4f7; }
    .activity-item { display: flex; gap: 16px; align-items: flex-start; padding: 16px 0; position: relative; }
    .activity-marker { width: 10px; height: 10px; border-radius: 50%; background: #d0d5dd; border: 2px solid white; position: absolute; left: -24px; top: 22px; z-index: 1; box-shadow: 0 0 0 4px white; }
    .activity-marker.created { background: #3b82f6; }
    .activity-marker.status_changed { background: #f59e0b; }
    .activity-marker.priority_changed { background: #ef4444; }
    .activity-details { flex: 1; }
    .activity-msg { font-size: 0.875rem; color: #344054; margin: 0 0 4px 0; line-height: 1.5; }
    .activity-time { font-size: 0.75rem; color: #98a2b3; }

    .empty-state-mini { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0; color: #98a2b3; text-align: center; }
    .empty-state-mini .material-icons-outlined { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
    .empty-state-mini p { font-size: 0.9375rem; margin: 0; }

    .panel-footer { padding: 20px 24px 32px; border-top: 1px solid #f2f4f7; background: white; }
    .comment-input-wrapper { display: flex; align-items: center; gap: 12px; background: #f9fafb; border: 1px solid #eaecf0; padding: 8px 12px 8px 16px; border-radius: 28px; transition: all 0.2s; }
    .comment-input-wrapper.focused { background: white; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
    .comment-input-wrapper input { flex: 1; border: none; background: transparent; padding: 8px 0; font-size: 0.9375rem; outline: none; color: #101828; }
    .comment-input-wrapper input::placeholder { color: #98a2b3; }
    .send-btn { background: #3b82f6; color: white; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
    .send-btn:hover:not(:disabled) { background: #2563eb; transform: scale(1.05); }
    .send-btn:disabled { background: #f2f4f7; color: #d0d5dd; cursor: not-allowed; }
    .send-btn .material-icons { font-size: 20px; }

    .btn-icon-sm { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: #667085; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .btn-icon-sm:hover { background: #f2f4f7; color: #101828; }

    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .side-panel { width: 100%; }
      .panel-grid { grid-template-columns: 1fr; gap: 16px; }
      .panel-title { font-size: 1.5rem; }
    }
  `]
})
export class TaskDetailPanelComponent {
  @Input() task: Task | null = null;
  @Input() comments: TaskComment[] = [];
  @Input() activities: Activity[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() updateField = new EventEmitter<{ field: keyof Task, value: string }>();
  @Output() commentAdded = new EventEmitter<string>();

  private taskService = inject(TaskService);
  
  activeTab: 'comments' | 'activity' = 'comments';
  activeDropdown: 'status' | 'priority' | null = null;
  newComment: string = '';
  isCommentFocused = false;
  isSubmitting = false;
  private roleConfig = inject(RoleConfigService);

  canEditPriority(): boolean {
    return this.roleConfig.getCurrentUserRole() !== 'JUNIOR_COUNSELLOR';
  }

  onClose() {
    this.close.emit();
  }

  toggleDropdown(type: 'status' | 'priority') {
    this.activeDropdown = this.activeDropdown === type ? null : type;
  }

  onUpdateField(field: keyof Task, value: string) {
    this.updateField.emit({ field, value });
    this.activeDropdown = null;
  }

  onPostComment() {
    if (!this.newComment.trim() || this.isSubmitting) return;
    
    this.isSubmitting = true;
    this.commentAdded.emit(this.newComment);
    this.newComment = '';
    
    // Reset submitting state after a short delay (the parent will reload data)
    setTimeout(() => {
      this.isSubmitting = false;
    }, 500);
  }

  getInitials(name?: string): string {
    if (!name || name.trim() === '') return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getAvatarColor(name?: string): string {
    if (!name) return '#94a3b8';
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa', '#e879f9', '#f43f5e'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatActivityMessage(activity: Activity): string {
    let msg = activity.message;
    // Highlight important parts if they are in the message
    if (activity.oldValue && activity.newValue) {
        msg = msg.replace(activity.oldValue, `<strong>${activity.oldValue}</strong>`);
        msg = msg.replace(activity.newValue, `<strong>${activity.newValue}</strong>`);
    }
    msg = msg.replace(activity.doneByName, `<strong>${activity.doneByName}</strong>`);
    return msg;
  }
}
