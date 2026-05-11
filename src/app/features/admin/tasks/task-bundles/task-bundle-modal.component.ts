import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TaskBundleService, TaskBundle, BundleTask, ScheduleType, BundleStatus, TaskPriority } from '../../../../core/services/task-bundle.service';
import { RoleService, Role } from '../../../../core/services/role.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DatepickerComponent } from '../../../../shared/components/datepicker/datepicker.component';

@Component({
  selector: 'app-task-bundle-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatepickerComponent],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content bundle-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-title-group">
            <span class="material-icons bundle-icon">auto_awesome_motion</span>
            <h2 class="modal-title">{{ isEdit ? 'Edit Task Bundle' : 'Create Task Bundle' }}</h2>
          </div>
          <button class="btn-close" (click)="onCancel()">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body">
          <form [formGroup]="bundleForm" class="bundle-form-container">
            <!-- Left Side: Configuration -->
            <div class="form-section-left">
              <div class="section-card">
                <div class="section-header">
                  <span class="material-icons">info_outline</span>
                  <h3>Basic Information</h3>
                </div>
                <div class="section-body">
                  <div class="form-group">
                    <label>Bundle Name <span class="required">*</span></label>
                    <input type="text" formControlName="name" class="form-control" placeholder="e.g., Onboarding Workflow">
                    <div class="error-msg" *ngIf="bundleForm.get('name')?.touched && bundleForm.get('name')?.invalid">
                      Bundle name is required
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Description</label>
                    <textarea formControlName="description" class="form-control" rows="2" placeholder="Describe the purpose of this bundle..."></textarea>
                  </div>

                  <div class="form-row">
                    <div class="form-group flex-1">
                      <label>Role <span class="required">*</span></label>
                      <select formControlName="roleId" class="form-control">
                        <option [ngValue]="null" disabled>Select Role</option>
                        <option *ngFor="let role of roles" [ngValue]="role.id">{{ role.name }}</option>
                      </select>
                    </div>
                    <div class="form-group flex-1">
                      <label>Status</label>
                      <div class="status-toggle-wrapper">
                        <div class="toggle-btn" [class.active]="bundleForm.get('status')?.value === 'ACTIVE'" (click)="bundleForm.patchValue({status: 'ACTIVE'})">ACTIVE</div>
                        <div class="toggle-btn" [class.active]="bundleForm.get('status')?.value === 'INACTIVE'" (click)="bundleForm.patchValue({status: 'INACTIVE'})">INACTIVE</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section-card mt-4">
                <div class="section-header">
                  <span class="material-icons">schedule</span>
                  <h3>Schedule Configuration</h3>
                </div>
                <div class="section-body">
                  <div class="form-row">
                    <div class="form-group flex-1">
                      <label>Schedule Type <span class="required">*</span></label>
                      <select formControlName="scheduleType" class="form-control" (change)="onScheduleTypeChange()">
                        <option value="DAILY">DAILY</option>
                        <option value="WEEKLY">WEEKLY</option>
                        <option value="MONTHLY">MONTHLY</option>
                        <option value="ONE_TIME">ONE TIME</option>
                      </select>
                    </div>
                    <div class="form-group flex-1">
                      <label>Execution Time <span class="required">*</span></label>
                      <input type="time" formControlName="executionTime" class="form-control">
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Start Date <span class="required">*</span></label>
                    <app-datepicker formControlName="startDate" [min]="minDate"></app-datepicker>
                  </div>

                  <!-- Conditional UI -->
                  <div class="conditional-fields" *ngIf="bundleForm.get('scheduleType')?.value === 'WEEKLY'">
                    <label>Select Weekday <span class="required">*</span></label>
                    <div class="weekday-selector">
                      <div *ngFor="let day of weekDays" 
                           class="day-chip" 
                           [class.selected]="bundleForm.get('weekDay')?.value === day"
                           (click)="bundleForm.patchValue({weekDay: day})">
                        {{ day.substring(0, 3) }}
                      </div>
                    </div>
                  </div>

                  <div class="conditional-fields" *ngIf="bundleForm.get('scheduleType')?.value === 'MONTHLY'">
                    <label>Day of Month <span class="required">*</span></label>
                    <input type="number" formControlName="dayOfMonth" class="form-control" min="1" max="31" placeholder="e.g., 1">
                  </div>

                  <div class="conditional-fields" *ngIf="bundleForm.get('scheduleType')?.value === 'ONE_TIME'">
                    <label>Execution Date <span class="required">*</span></label>
                    <app-datepicker formControlName="executionDate" [min]="minDate"></app-datepicker>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Side: Task Management -->
            <div class="form-section-right">
              <div class="tasks-container-header">
                <div class="title-with-count">
                  <h3>Bundle Tasks</h3>
                  <span class="task-count-badge" *ngIf="!isLoadingTasks">{{ tasksArray.length }}</span>
                  <span class="spinner" *ngIf="isLoadingTasks" style="border-top-color: var(--color-primary); width: 16px; height: 16px;"></span>
                </div>
                <button type="button" class="btn-add-task" (click)="addTask()">
                  <span class="material-icons">add</span>
                  <span>Add Task</span>
                </button>
              </div>

              <div class="tasks-scroll-area">
                <div *ngIf="isLoadingTasks" class="empty-tasks">
                   <div class="spinner" style="border-top-color: var(--color-primary); width: 32px; height: 32px; border-width: 3px; margin-bottom: 12px;"></div>
                   <p>Loading tasks...</p>
                </div>

                <div *ngIf="!isLoadingTasks && tasksArray.length === 0" class="empty-tasks">
                  <span class="material-icons">assignment_late</span>
                  <p>No tasks added to this bundle yet.</p>
                  <button type="button" class="btn btn-outline-primary btn-sm" (click)="addTask()">Add your first task</button>
                </div>

                <div formArrayName="tasks" class="tasks-list" *ngIf="!isLoadingTasks">
                  <div *ngFor="let task of tasksArray.controls; let i = index" [formGroupName]="i" class="task-card-item">
                    <div class="task-card-header" (click)="toggleTaskCollapse(i)">
                      <div class="task-header-left">
                        <span class="task-number">{{ i + 1 }}</span>
                        <span class="task-card-title">{{ task.get('title')?.value || 'New Task' }}</span>
                      </div>
                      <div class="task-header-actions">
                        <span class="priority-indicator" [ngClass]="task.get('priority')?.value?.toLowerCase()"></span>
                        <button type="button" class="btn-icon-danger" (click)="removeTask(i, $event)">
                          <span class="material-icons">delete_outline</span>
                        </button>
                        <span class="material-icons collapse-icon" [class.collapsed]="collapsedTasks[i]">expand_more</span>
                      </div>
                    </div>

                    <div class="task-card-body" *ngIf="!collapsedTasks[i]">
                      <div class="form-group">
                        <label>Task Title <span class="required">*</span></label>
                        <input type="text" formControlName="title" class="form-control" placeholder="e.g., Document Verification">
                      </div>
                      <div class="form-group">
                        <label>Description</label>
                        <textarea formControlName="description" class="form-control" rows="2" placeholder="Task details..."></textarea>
                      </div>
                      <div class="form-row">
                        <div class="form-group flex-1">
                          <label>Priority <span class="required">*</span></label>
                          <select formControlName="priority" class="form-control">
                            <option value="HIGH">HIGH</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="LOW">LOW</option>
                          </select>
                        </div>
                        <div class="form-group flex-1">
                          <label>Due Days <span class="required">*</span></label>
                          <input type="number" formControlName="defaultDueDays" class="form-control" min="0">
                          <small class="help-text">Days from bundle execution</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="onCancel()">Cancel</button>
          <button class="btn btn-primary" (click)="onSave()" [disabled]="bundleForm.invalid || tasksArray.length === 0 || isSubmitting">
            <span class="spinner" *ngIf="isSubmitting"></span>
            <span>{{ isEdit ? 'Update Bundle' : 'Save Bundle' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(16, 24, 40, 0.4); z-index: 3000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
    .bundle-modal { width: 95vw; max-width: 1100px; height: 85vh; max-height: 900px; background: white; border-radius: 16px; box-shadow: 0 24px 48px -12px rgba(16, 24, 40, 0.18); display: flex; flex-direction: column; overflow: hidden; animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes modalPop { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    .modal-header { padding: 20px 28px; border-bottom: 1px solid #eaecf0; display: flex; justify-content: space-between; align-items: center; background: #fcfcfd; }
    .header-title-group { display: flex; align-items: center; gap: 12px; }
    .bundle-icon { color: var(--color-primary); font-size: 28px; }
    .modal-title { font-size: 1.25rem; font-weight: 700; color: #101828; margin: 0; letter-spacing: -0.01em; }
    .btn-close { background: none; border: none; color: #667085; cursor: pointer; padding: 4px; border-radius: 8px; transition: all 0.2s; }
    .btn-close:hover { background: #f2f4f7; color: #101828; }

    .modal-body { flex: 1; overflow: hidden; padding: 24px 28px; background: #f9fafb; display: flex; flex-direction: column; }
    .bundle-form-container { display: grid; grid-template-columns: 400px 1fr; gap: 32px; height: 100%; }

    .form-section-left { overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 20px; }
    .section-card { background: white; border: 1px solid #eaecf0; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.05); }
    .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; color: #475467; }
    .section-header h3 { font-size: 0.9375rem; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .section-header .material-icons { font-size: 18px; }

    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #344054; margin-bottom: 6px; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #d0d5dd; border-radius: 8px; font-size: 0.9375rem; color: #101828; outline: none; transition: all 0.2s; box-sizing: border-box; }
    .form-control:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
    .form-row { display: flex; gap: 16px; }
    .flex-1 { flex: 1; }
    .required { color: #f04438; }

    .status-toggle-wrapper { display: flex; background: #f2f4f7; padding: 4px; border-radius: 8px; height: 42px; box-sizing: border-box; }
    .toggle-btn { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #667085; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
    .toggle-btn.active { background: white; color: #101828; shadow: 0 1px 2px rgba(16, 24, 40, 0.06); }

    .weekday-selector { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .day-chip { padding: 8px 12px; background: white; border: 1px solid #d0d5dd; border-radius: 20px; font-size: 0.8125rem; font-weight: 600; color: #475467; cursor: pointer; transition: all 0.2s; }
    .day-chip:hover { background: #f9fafb; }
    .day-chip.selected { background: #eff8ff; border-color: var(--color-primary); color: #175cd3; }

    .form-section-right { background: white; border: 1px solid #eaecf0; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 1px 3px rgba(16, 24, 40, 0.05); }
    .tasks-container-header { padding: 16px 20px; border-bottom: 1px solid #eaecf0; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
    .title-with-count { display: flex; align-items: center; gap: 10px; }
    .title-with-count h3 { font-size: 1rem; font-weight: 700; color: #101828; margin: 0; }
    .task-count-badge { background: var(--color-primary); color: white; font-size: 0.75rem; font-weight: 700; padding: 2px 10px; border-radius: 12px; }
    
    .btn-add-task { display: flex; align-items: center; gap: 6px; background: var(--color-primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-add-task:hover { background: var(--color-primary-hover); transform: translateY(-1px); }

    .tasks-scroll-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .empty-tasks { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #98a2b3; text-align: center; gap: 12px; }
    .empty-tasks .material-icons { font-size: 48px; opacity: 0.5; }
    
    .tasks-list { display: flex; flex-direction: column; gap: 12px; }
    .task-card-item { border: 1px solid #eaecf0; border-radius: 10px; overflow: hidden; transition: all 0.2s; }
    .task-card-item:hover { border-color: #d0d5dd; box-shadow: 0 4px 6px -1px rgba(16, 24, 40, 0.05); }
    
    .task-card-header { padding: 12px 16px; background: #fcfcfd; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
    .task-header-left { display: flex; align-items: center; gap: 12px; }
    .task-number { width: 24px; height: 24px; background: #f2f4f7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #475467; }
    .task-card-title { font-size: 0.875rem; font-weight: 600; color: #101828; }
    
    .task-header-actions { display: flex; align-items: center; gap: 12px; }
    .priority-indicator { width: 8px; height: 8px; border-radius: 50%; }
    .priority-indicator.high { background: #f04438; }
    .priority-indicator.medium { background: #f79009; }
    .priority-indicator.low { background: #12b76a; }
    
    .btn-icon-danger { background: none; border: none; color: #f04438; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
    .btn-icon-danger:hover { background: #fef2f2; }
    
    .collapse-icon { font-size: 20px; color: #98a2b3; transition: transform 0.3s; }
    .collapse-icon.collapsed { transform: rotate(-90deg); }

    .task-card-body { padding: 16px; border-top: 1px solid #eaecf0; background: white; animation: slideDown 0.2s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    .help-text { font-size: 0.75rem; color: #667085; margin-top: 4px; display: block; }
    .error-msg { font-size: 0.75rem; color: #f04438; margin-top: 4px; }

    .modal-footer { padding: 20px 28px; border-top: 1px solid #eaecf0; display: flex; justify-content: flex-end; gap: 12px; background: #fcfcfd; }
    .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-primary { background: var(--color-primary); color: white; }
    .btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-ghost { background: transparent; color: #475467; }
    .btn-ghost:hover { background: #f2f4f7; color: #101828; }
    .btn-outline-primary { background: transparent; border: 1px solid var(--color-primary); color: var(--color-primary); }
    .btn-outline-primary:hover { background: #eff8ff; }
    .btn-sm { padding: 6px 12px; font-size: 0.75rem; }

    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; margin-right: 8px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1200px) {
      .bundle-form-container { grid-template-columns: 350px 1fr; gap: 20px; }
    }

    @media (max-width: 1024px) {
      .bundle-modal { height: 95vh; max-height: none; }
      .modal-body { overflow-y: auto; padding: 16px; }
      .bundle-form-container { grid-template-columns: 1fr; height: auto; gap: 24px; }
      .form-section-left { overflow-y: visible; height: auto; }
      .form-section-right { min-height: 500px; height: auto; }
      .tasks-scroll-area { height: 400px; flex: none; }
    }

    @media (max-width: 768px) {
      .modal-header { padding: 16px 20px; }
      .modal-title { font-size: 1.1rem; }
      .form-row { flex-direction: column; gap: 0; }
      .modal-footer { padding: 16px 20px; flex-direction: column-reverse; }
      .modal-footer .btn { width: 100%; }
      .header-title-group .bundle-icon { font-size: 24px; }
    }

    @media (max-width: 480px) {
      .bundle-modal { width: 100vw; height: 100vh; border-radius: 0; }
      .modal-body { padding: 12px; }
      .section-card { padding: 16px; }
      .tasks-container-header { padding: 12px 16px; }
      .tasks-scroll-area { height: 350px; padding: 12px; }
    }
  `]
})
export class TaskBundleModalComponent implements OnInit {
  @Input() isEdit = false;
  @Input() bundleData: TaskBundle | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private bundleService = inject(TaskBundleService);
  private roleService = inject(RoleService);
  private notification = inject(NotificationService);

  bundleForm: FormGroup;
  roles: Role[] = [];
  isSubmitting = false;
  isLoadingTasks = false;
  minDate = new Date().toISOString().split('T')[0];
  weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  collapsedTasks: boolean[] = [];

  constructor() {
    this.bundleForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      roleId: [null, Validators.required],
      status: ['ACTIVE'],
      scheduleType: ['DAILY', Validators.required],
      executionTime: ['', Validators.required],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      weekDay: [''],
      dayOfMonth: [null],
      executionDate: [''],
      tasks: this.fb.array([], Validators.required)
    });
  }

  ngOnInit() {
    this.loadRoles();
    if (this.isEdit && this.bundleData?.id) {
      // Fetch full details to ensure nested objects like role and schedule are present
      this.bundleService.getBundleById(this.bundleData.id).subscribe({
        next: (fullBundle) => {
          this.patchForm(fullBundle);
          // If tasks aren't included in the main bundle payload, fetch them separately
          if (!fullBundle.tasks || fullBundle.tasks.length === 0) {
            this.loadTasks();
          }
        },
        error: (err) => {
          this.patchForm(this.bundleData!);
          this.loadTasks();
        }
      });
    } else {
      this.addTask(); // Add one empty task by default
    }
  }

  get tasksArray() {
    return this.bundleForm.get('tasks') as FormArray;
  }

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (roles: Role[]) => this.roles = roles,
      error: (err: any) => this.notification.error('Failed to load roles')
    });
  }

  loadTasks() {
    if (!this.bundleData?.id) return;
    this.isLoadingTasks = true;
    this.bundleService.getTasksInBundle(this.bundleData.id).subscribe({
      next: (tasks: BundleTask[]) => {
        this.tasksArray.clear();
        this.collapsedTasks = [];
        if (tasks && tasks.length > 0) {
          tasks.forEach((t: BundleTask) => this.addTask(t));
        }
        this.isLoadingTasks = false;
      },
      error: (err: any) => {
        this.notification.error('Failed to load tasks for this bundle');
        this.isLoadingTasks = false;
      }
    });
  }

  patchForm(data: TaskBundle) {
    const schedule: any = data.schedule || {
      scheduleType: data.scheduleType,
      executionTime: data.executionTime,
      startDate: data.startDate,
      weekDay: data.weekDay,
      dayOfMonth: data.dayOfMonth,
      executionDate: data.executionDate
    };

    this.bundleForm.patchValue({
      name: data.name,
      description: data.description,
      roleId: data.role?.id || data.roleId,
      status: data.status,
      scheduleType: schedule.scheduleType,
      executionTime: schedule.executionTime ? schedule.executionTime.substring(0, 5) : null,
      startDate: schedule.startDate || new Date().toISOString().split('T')[0],
      weekDay: schedule.weekDay || schedule.executionDay,
      dayOfMonth: schedule.dayOfMonth || schedule.executionDayOfMonth,
      executionDate: schedule.executionDate || schedule.oneTimeExecutionDate
    });

    this.tasksArray.clear();
    this.collapsedTasks = [];
    if (data.tasks && data.tasks.length > 0) {
      data.tasks.forEach((t: BundleTask) => this.addTask(t));
    }
  }

  addTask(task?: BundleTask) {
    const taskGroup = this.fb.group({
      id: [task?.id || null],
      title: [task?.title || '', Validators.required],
      description: [task?.description || ''],
      priority: [task?.priority || 'MEDIUM', Validators.required],
      defaultDueDays: [task?.defaultDueDays || 0, [Validators.required, Validators.min(0)]]
    });
    this.tasksArray.push(taskGroup);
    this.collapsedTasks.push(false);
  }

  removeTask(index: number, event: Event) {
    event.stopPropagation();
    this.tasksArray.removeAt(index);
    this.collapsedTasks.splice(index, 1);
  }

  toggleTaskCollapse(index: number) {
    this.collapsedTasks[index] = !this.collapsedTasks[index];
  }

  onScheduleTypeChange() {
    const type = this.bundleForm.get('scheduleType')?.value;
    // Clear conditional validators if needed, or just let them be
  }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    if (this.bundleForm.invalid || this.tasksArray.length === 0) {
      this.bundleForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.bundleForm.value;
    
    const payload: Partial<TaskBundle> = {
      name: formValue.name,
      description: formValue.description,
      roleId: formValue.roleId,
      status: formValue.status,
      schedule: {
        scheduleType: formValue.scheduleType,
        executionTime: formValue.executionTime ? formValue.executionTime + ':00' : '',
        startDate: formValue.startDate,
        executionDay: formValue.weekDay,
        executionDayOfMonth: formValue.dayOfMonth,
        oneTimeExecutionDate: formValue.executionDate
      },
      tasks: formValue.tasks
    };

    const request = this.isEdit && this.bundleData?.id 
      ? this.bundleService.updateBundle(this.bundleData.id, payload)
      : this.bundleService.createBundle(payload);

    request.subscribe({
      next: () => {
        this.notification.success(`Task bundle ${this.isEdit ? 'updated' : 'created'} successfully`);
        this.saved.emit();
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.notification.error(err.message || 'Failed to save bundle');
        this.isSubmitting = false;
      }
    });
  }
}
