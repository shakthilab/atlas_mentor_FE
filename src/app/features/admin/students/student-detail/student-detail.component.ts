import { Component, inject, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../../core/services/student.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RoleConfigService } from '../../../../core/services/role-config.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="form-modal-container" *ngIf="student">
      <!-- Left Sidebar: Stepper -->
      <div class="stepper-sidebar">
        <div class="stepper-header">
          <div class="stepper-icon-box">
            <span class="material-icons">person_search</span>
          </div>
          <div class="stepper-title-box">
            <h3>Student Profile</h3>
            <p>Information</p>
          </div>
        </div>

        <div class="vertical-stepper">
          <div class="v-step" [class.active]="activeTab === 'personal'" (click)="activeTab = 'personal'">
            <div class="v-step-indicator">1</div>
            <div class="v-step-content">
              <span class="v-step-label">Personal Info</span>
              <span class="v-step-sublabel">Identity & Contact</span>
            </div>
            <div class="v-step-line"></div>
          </div>

          <div class="v-step" [class.active]="activeTab === 'academic'" (click)="activeTab = 'academic'">
            <div class="v-step-indicator">2</div>
            <div class="v-step-content">
              <span class="v-step-label">Academic Records</span>
              <span class="v-step-sublabel">Previous Education</span>
            </div>
            <div class="v-step-line"></div>
          </div>

          <div class="v-step" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'">
            <div class="v-step-indicator">3</div>
            <div class="v-step-content">
              <span class="v-step-label">Documents</span>
              <span class="v-step-sublabel">Uploaded Files</span>
            </div>
          </div>
        </div>

        <div class="stepper-footer">
          <div class="help-box">
            <span class="material-icons">verified</span>
            <p>Verified Student Record</p>
          </div>
        </div>
      </div>

      <!-- Right Main Area -->
      <div class="form-main-area">
        <div class="form-header">
          <div class="header-left">
            <h2 class="form-title">Student Details</h2>
            <p class="form-subtitle">Information portal for ID #{{ student.id }}</p>
          </div>
          <button class="btn-close" (click)="close.emit()">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="form-body custom-scrollbar">
          <!-- Profile Header Section -->
          <div class="profile-masthead">
            <div class="profile-header-content">
              <div class="profile-title-row">
                <div class="name-display">
                  <span class="first-name">{{ student.firstName }}</span>
                  <span class="last-name">{{ student.lastName }}</span>
                </div>
                <div class="status-dropdown-container">
                  <div class="status-pill-modern" [ngClass]="[student.status?.toLowerCase(), roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY' ? 'clickable' : '']" 
                       (click)="roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY' ? toggleStatusDropdown($event) : null">
                    {{ student.status }}
                    <span class="material-icons" *ngIf="roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY'">expand_more</span>
                  </div>
                  
                  <div class="status-dropdown shadow-premium" *ngIf="showStatusDropdown && roleConfig.getCurrentUserRole() !== 'REFERRAL' && roleConfig.getCurrentUserRole() !== 'COMPANY'" (click)="$event.stopPropagation()">
                    <div class="dropdown-item" *ngFor="let s of statusOptions" (click)="selectNewStatus(s)">
                      <span class="dot" [ngClass]="s.toLowerCase()"></span>
                      {{ s }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="meta-row-modern">
                <span class="meta-item-modern"><span class="material-icons">location_on</span> {{ student.country?.name || student.destinationCountry || 'N/A' }}</span>
                <span class="meta-item-modern"><span class="material-icons">mail</span> {{ student.email }}</span>
                <span class="meta-item-modern"><span class="material-icons">call</span> {{ student.phone }}</span>
              </div>
            </div>
          </div>

          <div class="content-separator"></div>

          <!-- Tabbed Content Areas -->
          <div class="tab-fade-in" *ngIf="activeTab === 'personal'">
            <div class="info-grid-modern">
              <div class="info-group-modern">
                <label>First Name</label>
                <div class="value-box">{{ student.firstName }}</div>
              </div>
              <div class="info-group-modern">
                <label>Last Name</label>
                <div class="value-box">{{ student.lastName }}</div>
              </div>
              <div class="info-group-modern">
                <label>Email Address</label>
                <div class="value-box">{{ student.email }}</div>
              </div>
              <div class="info-group-modern">
                <label>Phone Number</label>
                <div class="value-box">{{ student.phone }}</div>
              </div>
              <div class="info-group-modern">
                <label>Target Country</label>
                <div class="value-box">{{ student.country?.name || student.destinationCountry || 'N/A' }}</div>
              </div>
              <div class="info-group-modern">
                <label>Target University</label>
                <div class="value-box">{{ student.university?.name || student.targetUniversity || 'N/A' }}</div>
              </div>
              <div class="info-group-modern">
                <label>Preferred Course</label>
                <div class="value-box">{{ student.courseName || 'N/A' }}</div>
              </div>
              <div class="info-group-modern">
                <label>Intake Period</label>
                <div class="value-box">{{ student.intakePeriod || 'N/A' }}</div>
              </div>
            </div>
          </div>

          <div class="tab-fade-in" *ngIf="activeTab === 'academic'">
            <div class="academic-stack">
              <div class="qual-card" *ngFor="let record of student.academicHistory">
                <div class="qual-icon-box">
                  <span class="material-icons">school</span>
                </div>
                <div class="qual-details">
                  <div class="qual-top">
                    <h4>{{ record.level }}</h4>
                    <span class="qual-year">{{ record.passingYear }}</span>
                  </div>
                  <p class="qual-inst">{{ record.institutionName }}</p>
                  <div class="qual-bottom">
                    <span class="qual-score">Score: <strong>{{ record.scoreCgpa }}</strong></span>
                  </div>
                </div>
              </div>
              <div class="empty-state-view" *ngIf="!student.academicHistory?.length">
                <span class="material-icons">history_edu</span>
                <p>No academic records found.</p>
              </div>
            </div>
          </div>

          <div class="tab-fade-in" *ngIf="activeTab === 'documents'">
            <div class="docs-list-stack">
              <div class="doc-item-row" *ngFor="let docKey of getFileKeys()">
                <div class="doc-icon-circle" [ngClass]="getFileIcon(student.fileMetadata?.[docKey]?.type || '')">
                  <span class="material-icons">{{ getFileMaterialIcon(student.fileMetadata?.[docKey]?.type || '') }}</span>
                </div>
                <div class="doc-info-main">
                  <span class="doc-name-text">{{ student.fileMetadata?.[docKey]?.name || formatDocLabel(docKey) }}</span>
                  <span class="doc-size-text">{{ formatFileSize(student.fileMetadata?.[docKey]?.size || 0) }}</span>
                </div>
                <div class="doc-action-btns">
                  <button class="btn-action-view" (click)="viewFile(docKey)" title="View">
                    <span class="material-icons">visibility</span>
                  </button>
                  <button class="btn-action-download" (click)="downloadFile(docKey)" title="Download">
                    <span class="material-icons">download</span>
                  </button>
                </div>
              </div>
              <div class="empty-state-view" *ngIf="getFileKeys().length === 0">
                <span class="material-icons">folder_off</span>
                <p>No documents uploaded yet.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="form-footer">
          <div class="footer-left">
            <button class="btn-danger-ghost" (click)="deleteStudent()">
              <span class="material-icons">delete</span>
              <span>Delete Student</span>
            </button>
          </div>
          <div class="footer-right" style="display: flex; gap: 1rem;">
            <button class="btn-ghost" (click)="close.emit()">Close</button>
            <button class="btn-primary" (click)="openEdit()">
              <span class="material-icons">edit</span>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showConfirmModal" (click)="closeConfirmModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 400px; padding: 2rem; text-align: center;">
        <div style="background: #fee4e2; color: #d92d20; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          <span class="material-icons">delete_forever</span>
        </div>
        <h2 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Delete Student</h2>
        <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-bottom: 2rem;">Are you sure you want to delete this student? This action cannot be undone and all associated data will be removed.</p>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" style="flex: 1; border: 1px solid var(--color-gray-300); background: white; color: var(--color-gray-700); border-radius: 8px; font-weight: 600;" (click)="closeConfirmModal()">Cancel</button>
          <button class="btn" style="flex: 1; background: #d92d20; color: white; border: none; border-radius: 8px; font-weight: 600;" (click)="executeDelete()" [disabled]="deleting">
            {{ deleting ? 'Deleting...' : 'Delete Student' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Status Comment Modal -->
    <div class="modal-overlay" *ngIf="showStatusCommentModal" (click)="closeStatusCommentModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 450px; padding: 2rem;">
        <div style="background: var(--color-primary-light); color: var(--color-primary); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          <span class="material-icons">comment</span>
        </div>
        <h2 style="margin: 0 0 0.5rem; font-size: 1.125rem; text-align: center;">Update Status to {{ pendingStatus }}</h2>
        <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-bottom: 1.5rem; text-align: center;">Please provide a reason for changing the status.</p>
        
        <div class="form-group" style="margin-bottom: 1.5rem;">
          <textarea 
            [(ngModel)]="statusComment" 
            class="form-control" 
            placeholder="Enter reason for status change..."
            style="min-height: 100px; padding: 12px; border-radius: 8px; width: 100%; border: 1px solid var(--color-gray-300);"
          ></textarea>
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" style="flex: 1; border: 1px solid var(--color-gray-300); background: white; color: var(--color-gray-700); border-radius: 8px; font-weight: 600; padding: 10px;" (click)="closeStatusCommentModal()">Cancel</button>
          <button class="btn" style="flex: 1; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-weight: 600; padding: 10px;" (click)="confirmStatusChange()" [disabled]="!statusComment || updatingStatus">
            {{ updatingStatus ? 'Updating...' : 'Confirm Change' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --color-primary: #1a73e8;
      --color-primary-light: #e8f0fe;
      --color-gray-50: #f8fafc;
      --color-gray-100: #f1f5f9;
      --color-gray-200: #e2e8f0;
      --color-gray-300: #cbd5e1;
      --color-gray-400: #94a3b8;
      --color-gray-500: #64748b;
      --color-gray-600: #475569;
      --color-gray-700: #334155;
      --color-gray-800: #1e293b;
      --color-gray-900: #0f172a;
      --color-success: #10b981;
      --color-warning: #f59e0b;
      --color-error: #ef4444;
    }

    .form-modal-container {
      display: flex;
      width: 100%;
      height: 100%;
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }

    /* Sidebar Stepper Styling (Matches Form) */
    .stepper-sidebar {
      width: 280px;
      background: #fcfcfd;
      border-right: 1px solid var(--color-gray-200);
      display: flex;
      flex-direction: column;
      padding: 2rem;
      flex-shrink: 0;
    }

    .stepper-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .stepper-icon-box {
      width: 40px;
      height: 40px;
      background: var(--color-primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stepper-title-box h3 {
      font-size: 1rem;
      margin: 0;
      color: var(--color-gray-900);
      font-weight: 700;
    }

    .stepper-title-box p {
      font-size: 0.75rem;
      margin: 0;
      color: var(--color-gray-500);
    }

    .vertical-stepper {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .v-step {
      display: flex;
      gap: 1rem;
      position: relative;
      padding-bottom: 2.5rem;
      cursor: pointer;
    }

    .v-step:last-child { padding-bottom: 0; }

    .v-step-indicator {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: white;
      border: 2px solid var(--color-gray-200);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
      color: var(--color-gray-400);
      z-index: 2;
      transition: all 0.2s;
    }

    .v-step-line {
      position: absolute;
      top: 28px;
      left: 13px;
      width: 2px;
      height: calc(100% - 28px);
      background: var(--color-gray-200);
      z-index: 1;
    }

    .v-step.active .v-step-indicator {
      background: var(--color-primary-light);
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    .v-step.active .v-step-label { color: var(--color-primary); }

    .v-step-content { display: flex; flex-direction: column; }
    .v-step-label { font-size: 0.875rem; font-weight: 700; color: var(--color-gray-500); }
    .v-step-sublabel { font-size: 0.7rem; color: var(--color-gray-400); }

    .stepper-footer .help-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: white;
      border-radius: 10px;
      border: 1px solid var(--color-gray-200);
    }

    .help-box .material-icons { color: var(--color-success); font-size: 1.25rem; }
    .help-box p { font-size: 0.7rem; margin: 0; color: var(--color-gray-600); font-weight: 600; }

    /* Main Area Styling */
    .form-main-area { flex: 1; display: flex; flex-direction: column; background: white; min-width: 0; }
    .form-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--color-gray-200); display: flex; justify-content: space-between; align-items: center; }
    .form-title { font-size: 1.25rem; font-weight: 800; color: var(--color-gray-900); margin: 0; }
    .form-subtitle { font-size: 0.85rem; color: var(--color-gray-500); margin: 0.25rem 0 0; }
    
    .btn-close { background: none; border: none; color: var(--color-gray-400); cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.2s; }
    .btn-close:hover { background: var(--color-gray-100); color: var(--color-gray-900); }

    .form-body { flex: 1; padding: 2.5rem 2rem; overflow-y: auto; max-height: calc(100vh - 160px); }

    /* Profile Header Section (New Style) */
    .profile-masthead { margin-bottom: 2.5rem; background: var(--color-gray-50); padding: 2rem; border-radius: 20px; border: 1px solid var(--color-gray-100); }
    .profile-header-content { display: flex; flex-direction: column; gap: 1.25rem; }
    .profile-title-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    
    .name-display { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .name-display .first-name { font-size: 2.25rem; font-weight: 800; color: var(--color-gray-900); letter-spacing: -0.02em; }
    .name-display .last-name { font-size: 2.25rem; font-weight: 400; color: var(--color-gray-500); letter-spacing: -0.02em; }
    
    .status-pill-modern { padding: 0.5rem 1.25rem; border-radius: 99px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .status-pill-modern.lead { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }
    .status-pill-modern.registered { background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5; }
    .status-pill-modern.lost { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

    .meta-row-modern { display: flex; gap: 2rem; flex-wrap: wrap; }
    .meta-item-modern { display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; color: var(--color-gray-600); font-weight: 600; }
    .meta-item-modern .material-icons { font-size: 1.25rem; color: var(--color-primary); }

    .content-separator { height: 1px; background: var(--color-gray-100); margin: 2.5rem 0; }

    /* Responsive Design */
    @media (max-width: 992px) {
      .form-modal-container { flex-direction: column; height: 95vh; }
      .stepper-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--color-gray-200); padding: 1.5rem; height: auto; }
      .vertical-stepper { flex-direction: row; gap: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
      .v-step { padding-bottom: 0; min-width: 160px; }
      .v-step-line { display: none; }
      .profile-title-row { flex-direction: column; align-items: flex-start; }
      .info-grid-modern { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .name-display .first-name, .name-display .last-name { font-size: 1.75rem; }
      .meta-row-modern { gap: 1rem; }
    }

    /* Info Grid Styling */
    .info-grid-modern { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .info-group-modern label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--color-gray-400); text-transform: uppercase; margin-bottom: 0.5rem; }
    .value-box { background: var(--color-gray-50); border: 1px solid var(--color-gray-200); padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.95rem; font-weight: 600; color: var(--color-gray-800); }

    /* Academic Stack Styling */
    .academic-stack { display: flex; flex-direction: column; gap: 1rem; }
    .qual-card { display: flex; gap: 1.25rem; padding: 1.25rem; border-radius: 16px; border: 1px solid var(--color-gray-200); background: white; transition: all 0.2s; }
    .qual-card:hover { border-color: var(--color-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .qual-icon-box { width: 44px; height: 44px; border-radius: 12px; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; }
    .qual-details { flex: 1; }
    .qual-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
    .qual-top h4 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--color-gray-900); }
    .qual-year { font-size: 0.75rem; font-weight: 800; color: var(--color-primary); background: var(--color-primary-light); padding: 0.2rem 0.5rem; border-radius: 6px; }
    .qual-inst { margin: 0 0 0.5rem; font-size: 0.9rem; color: var(--color-gray-600); }
    .qual-score { font-size: 0.85rem; color: var(--color-gray-400); }
    .qual-score strong { color: var(--color-gray-900); }

    /* Documents Stack Styling */
    .docs-list-stack { display: flex; flex-direction: column; gap: 0.75rem; }
    .doc-item-row { display: flex; align-items: center; gap: 1.25rem; padding: 1rem 1.25rem; border-radius: 16px; border: 1px solid var(--color-gray-200); background: white; transition: all 0.2s; }
    .doc-item-row:hover { border-color: var(--color-primary); background: var(--color-gray-50); }
    .doc-icon-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; }
    .doc-icon-circle.pdf { background: #f87171; }
    .doc-icon-circle.image { background: #60a5fa; }
    .doc-icon-circle.excel { background: #34d399; }
    .doc-icon-circle.other { background: #94a3b8; }
    
    .doc-info-main { flex: 1; display: flex; flex-direction: column; }
    .doc-name-text { font-size: 0.95rem; font-weight: 700; color: var(--color-gray-900); }
    .doc-size-text { font-size: 0.75rem; color: var(--color-gray-400); font-weight: 600; }

    .doc-action-btns { display: flex; gap: 0.5rem; }
    .doc-action-btns button { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--color-gray-200); background: white; color: var(--color-gray-500); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .doc-action-btns button:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-light); }

    /* Footer Styling */
    .form-footer { padding: 1.25rem 2rem; border-top: 1px solid var(--color-gray-200); background: white; display: flex; justify-content: space-between; align-items: center; }
    .btn-ghost { padding: 0.75rem 1.5rem; border: 1px solid var(--color-gray-200); background: white; color: var(--color-gray-600); font-weight: 700; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .btn-ghost:hover { background: var(--color-gray-50); color: var(--color-gray-900); }
    .btn-primary { padding: 0.75rem 1.5rem; border: none; background: var(--color-primary); color: white; font-weight: 700; border-radius: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 6px -1px rgba(26, 115, 232, 0.2); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(26, 115, 232, 0.3); }

    .btn-danger-ghost {
      padding: 0.75rem 1.5rem;
      border: 1px solid #fecaca;
      background: #fef2f2;
      color: #dc2626;
      font-weight: 700;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-danger-ghost:hover {
      background: #fee2e2;
      color: #b91c1c;
      border-color: #fca5a5;
    }

    .btn-action-view { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--color-gray-200); background: white; color: var(--color-gray-500); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .btn-action-view:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-light); }

    /* Utility */
    .tab-fade-in { animation: fadeIn 0.25s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .empty-state-view { padding: 3rem; text-align: center; color: var(--color-gray-400); }
    .empty-state-view .material-icons { font-size: 3rem; opacity: 0.3; margin-bottom: 1rem; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: var(--color-gray-50); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-gray-300); border-radius: 10px; }

    /* Status Dropdown */
    .status-dropdown-container { position: relative; }
    .status-pill-modern.clickable { cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .status-pill-modern.clickable:hover { filter: brightness(0.95); }
    
    .status-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: white;
      border: 1px solid var(--color-gray-200);
      border-radius: 12px;
      padding: 8px;
      z-index: 100;
      min-width: 160px;
    }
    
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-gray-700);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .dropdown-item:hover { background: var(--color-gray-50); color: var(--color-primary); }
    .dropdown-item .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.lead { background: #3b82f6; }
    .dot.registered { background: #10b981; }
    .dot.lost { background: #ef4444; }
    .dot.enrolled { background: #8b5cf6; }
    .dot.prospective { background: #f59e0b; }
    
    .status-pill-modern.prospective { background: #fffbeb; color: #f59e0b; }
  `]
})
export class StudentDetailComponent implements OnInit {
  @Input() studentId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<string>();

  activeTab = 'personal';
  studentService = inject(StudentService);
  notificationService = inject(NotificationService);
  roleConfig = inject(RoleConfigService);

  student: any = null;
  
  // Confirm Modal State
  showConfirmModal = false;
  deleting = false;

  // Status Change State
  showStatusDropdown = false;
  showStatusCommentModal = false;
  pendingStatus = '';
  statusComment = '';
  updatingStatus = false;
  statusOptions = ['LEAD', 'PROSPECTIVE', 'REGISTERED', 'LOST'];

  @HostListener('document:click')
  onGlobalClick() {
    this.showStatusDropdown = false;
  }

  ngOnInit() {
    if (this.studentId) {
      this.loadStudentDetail();
    }
  }

  loadStudentDetail() {
    this.studentService.getStudentById(this.studentId!).subscribe({
      next: (res) => {
        // Handle both { user: {...} } and direct {...} structures
        const studentData = res.user || res;
        this.student = {
          ...studentData,
          academicHistory: this.mapAcademicHistory(studentData.academicHistories || studentData.academicHistory),
          documents: this.mapDocuments(studentData.documents),
          fileMetadata: this.mapFileMetadata(studentData.documents)
        };
      },
      error: (err) => {
        console.error('Error fetching student detail:', err);
        this.notificationService.showModal('Error', 'Could not load details', 'Please try again later.');
        this.close.emit();
      }
    });
  }

  private mapAcademicHistory(histories: any[]): any[] {
    if (!histories) return [];
    return histories.map(h => ({
      level: h.qualification || h.level || 'N/A',
      institutionName: h.institutionName || h.institution_name || 'N/A',
      passingYear: h.passingYear || h.passing_year || 'N/A',
      scoreCgpa: h.score || h.scoreCgpa || 'N/A'
    }));
  }

  private mapDocuments(docs: any): any {
    const documents: any = {};
    if (Array.isArray(docs)) {
      docs.forEach(doc => {
        const key = doc.documentType || doc.type || 'other';
        documents[key] = doc.fileContent || doc.content || '';
      });
    } else if (docs && typeof docs === 'object') {
      return docs;
    }
    return documents;
  }

  private mapFileMetadata(docs: any): any {
    const metadata: any = {};
    if (Array.isArray(docs)) {
      docs.forEach(doc => {
        const key = doc.documentType || doc.type || 'other';
        metadata[key] = {
          name: doc.fileName || doc.name || key,
          size: doc.fileSize || doc.size || 0,
          type: doc.fileType || doc.mimeType || 'application/octet-stream'
        };
      });
    }
    return metadata;
  }

  getFileKeys(): string[] {
    return this.student ? Object.keys(this.student.documents || {}) : [];
  }

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('image')) return 'image';
    if (type.includes('sheet') || type.includes('excel')) return 'excel';
    return 'other';
  }

  getFileMaterialIcon(type: string): string {
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('image')) return 'image';
    if (type.includes('sheet') || type.includes('excel')) return 'table_view';
    return 'description';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDocLabel(key: string): string {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  viewFile(docKey: string) {
    const base64 = this.student.documents[docKey];
    const metadata = this.student.fileMetadata?.[docKey];
    if (!base64 || base64.length < 10) {
      this.notificationService.showModal('Error', 'File unavailable', 'This document has no valid content.');
      return;
    }

    const raw = base64.includes(',') ? base64.split(',')[1] : base64;
    const mimeType = metadata?.type || this.detectMimeType(raw);
    
    try {
      const blob = this.base64ToBlob(raw, mimeType);
      if (blob.size === 0) throw new Error('Empty blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error('viewFile failed:', e);
      this.notificationService.showModal('Error', 'View Failed', 'Could not open this file.');
    }
  }

  downloadFile(docKey: string) {
    const base64 = this.student.documents[docKey];
    const metadata = this.student.fileMetadata?.[docKey];
    if (!base64 || base64.length < 10) {
      this.notificationService.showModal('Error', 'File unavailable', 'This document has no valid content.');
      return;
    }

    const raw = base64.includes(',') ? base64.split(',')[1] : base64;
    const mimeType = metadata?.type || this.detectMimeType(raw);
    
    try {
      const blob = this.base64ToBlob(raw, mimeType);
      if (blob.size === 0) throw new Error('Empty blob');
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = metadata?.name || `${this.formatDocLabel(docKey)}.file`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error('downloadFile failed:', e);
      this.notificationService.showModal('Error', 'Download Failed', 'Could not download this file.');
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    try {
      const byteCharacters = atob(base64);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      return new Blob(byteArrays, { type: mimeType });
    } catch (e) {
      console.error('base64ToBlob conversion failed:', e);
      return new Blob([], { type: mimeType });
    }
  }

  private detectMimeType(base64: string): string {
    if (typeof base64 !== 'string' || base64.length === 0) return 'application/octet-stream';
    try {
      const bytes = atob(base64.substring(0, 32));
      const b = (i: number) => bytes.charCodeAt(i);
      if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4E && b(3) === 0x47) return 'image/png';
      if (b(0) === 0xFF && b(1) === 0xD8 && b(2) === 0xFF) return 'image/jpeg';
      if (b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46) return 'application/pdf';
      if (b(0) === 0x50 && b(1) === 0x4B && b(2) === 0x03 && b(3) === 0x04) return 'application/zip';
    } catch (e) {}
    return 'application/octet-stream';
  }

  getInitials(name?: string): string {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getAvatarColor(name?: string): string {
    if (!name) return '#1e293b';
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa', '#e879f9', '#f43f5e'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  openEdit() {
    this.edit.emit(this.studentId!);
  }

  deleteStudent() {
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    if (this.deleting) return;
    this.showConfirmModal = false;
  }

  toggleStatusDropdown(event: Event) {
    event.stopPropagation();
    this.showStatusDropdown = !this.showStatusDropdown;
  }

  selectNewStatus(status: string) {
    if (status === this.student.status) {
      this.showStatusDropdown = false;
      return;
    }
    this.pendingStatus = status;
    this.showStatusDropdown = false;
    this.statusComment = '';
    this.showStatusCommentModal = true;
  }

  closeStatusCommentModal() {
    if (this.updatingStatus) return;
    this.showStatusCommentModal = false;
  }

  confirmStatusChange() {
    if (!this.statusComment || this.updatingStatus) return;
    this.updatingStatus = true;

    this.studentService.updateStudentStatus(this.studentId!, this.pendingStatus, this.statusComment).subscribe({
      next: () => {
        this.updatingStatus = false;
        this.showStatusCommentModal = false;
        this.student.status = this.pendingStatus;
        this.notificationService.success(`Status updated to ${this.pendingStatus}`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.updatingStatus = false;
        this.notificationService.error('Failed to update status');
      }
    });
  }

  executeDelete() {
    if (this.deleting) return;
    this.deleting = true;

    this.studentService.deleteStudent(this.studentId!).subscribe({
      next: () => {
        this.deleting = false;
        this.showConfirmModal = false;
        this.notificationService.success('Student record deleted successfully.');
        this.close.emit();
      },
      error: (err) => {
        this.deleting = false;
        console.error('Error deleting student:', err);
        this.notificationService.error('Failed to delete student record.');
      }
    });
  }
}
