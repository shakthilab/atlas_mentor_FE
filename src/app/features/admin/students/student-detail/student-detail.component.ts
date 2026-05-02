import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../../core/services/student.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="module-container" *ngIf="student">
      <!-- Header with Profile Info -->
      <div class="detail-header">
        <div class="header-main">
          <button class="btn-back" [routerLink]="['/admin/students']">
            <span class="material-icons">arrow_back</span>
          </button>
          <div class="profile-summary">
            <div class="avatar-large">MS</div>
            <div class="info">
              <div class="name-row">
                <h1 class="student-name">Mukul Sharma</h1>
                <span class="status-badge registered">Registered</span>
              </div>
              <div class="meta-row">
                <span>#ST1001</span>
                <span class="dot"></span>
                <span>Germany</span>
                <span class="dot"></span>
                <span>Masters in Computer Science</span>
              </div>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary">
            <span class="material-icons">mail</span>
            Email
          </button>
          <button class="btn btn-primary" [routerLink]="['../../edit', 'ST1001']">
            <span class="material-icons">edit</span>
            Edit Profile
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-container">
        <div class="tabs">
          <button class="tab-btn" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">Overview</button>
          <button class="tab-btn" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'">Documents</button>
          <button class="tab-btn" [class.active]="activeTab === 'payments'" (click)="activeTab = 'payments'">Payments</button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="content-wrapper">
        <!-- Overview Tab -->
        <div *ngIf="activeTab === 'overview'" class="tab-panel grid-2-1">
          <div class="panel-column main">
            <div class="panel-card">
              <h3 class="panel-title">Education & Experience</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Course</span>
                  <span class="value">Masters in Computer Science</span>
                </div>
                <div class="info-item">
                  <span class="label">University</span>
                  <span class="value">Technical University of Munich</span>
                </div>
                <div class="info-item">
                  <span class="label">Intake</span>
                  <span class="value">Winter 2024</span>
                </div>
              <div class="academic-timeline">
                <div class="academic-entry" *ngFor="let record of student.academicHistory">
                  <div class="entry-icon">
                    <span class="material-icons">school</span>
                  </div>
                  <div class="entry-details">
                    <span class="qualification">{{ record.qualification }} - {{ record.stream }}</span>
                    <span class="institution">{{ record.institution_name }} ({{ record.board_university }})</span>
                    <span class="score">Passed in {{ record.passing_year }} • {{ record.score }}</span>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <div class="panel-card mt-1-5">
              <h3 class="panel-title">Contact Details</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Email</span>
                  <span class="value">mukul&#64;example.com</span>
                </div>
                <div class="info-item">
                  <span class="label">Phone</span>
                  <span class="value">+91 9876543210</span>
                </div>
                <div class="info-item">
                  <span class="label">Address</span>
                  <span class="value">G-12, Green Park, New Delhi, India</span>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-column sidebar">
            <div class="panel-card">
              <h3 class="panel-title">Quick Actions</h3>
              <div class="action-list">
                <button class="action-btn">
                  <span class="material-icons">upload_file</span>
                  Upload Document
                </button>
                <button class="action-btn">
                  <span class="material-icons">receipt</span>
                  Add Payment Record
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents Tab -->
        <div *ngIf="activeTab === 'documents'" class="tab-panel">
          <div class="panel-card">
            <div class="header-with-action">
              <h3 class="panel-title">Student Documents</h3>
              <button class="btn btn-primary btn-sm">Upload New</button>
            </div>
            <div class="doc-grid">
              <div class="doc-item" *ngFor="let doc of documentList">
                <div class="doc-icon" [class.uploaded]="student.documents[doc.key]">
                  <span class="material-icons">description</span>
                </div>
                <div class="doc-info">
                  <span class="doc-name">{{ doc.label }}</span>
                  <span class="doc-status" [class.uploaded]="student.documents[doc.key]">
                    {{ student.documents[doc.key] ? 'Verified • ' + student.documents[doc.key] : 'Pending Upload' }}
                  </span>
                </div>
                <div class="doc-actions" *ngIf="student.documents[doc.key]">
                  <button class="btn-icon circle" title="Download"><span class="material-icons">download</span></button>
                  <button class="btn-icon circle" title="View"><span class="material-icons">visibility</span></button>
                </div>
                <button class="btn btn-primary btn-sm" *ngIf="!student.documents[doc.key]">Upload</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .module-container { padding-bottom: 2rem; }
    
    /* Header */
    .detail-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .header-main { display: flex; gap: 1rem; }
    .btn-back { background: white; border: 1px solid var(--color-gray-300); width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-gray-500); transition: all var(--transition-fast); box-shadow: var(--shadow-xs); }
    .btn-back:hover { color: var(--color-gray-700); background: var(--color-gray-50); border-color: var(--color-gray-400); }
    .profile-summary { display: flex; gap: 1.25rem; align-items: center; }
    .avatar-large { width: 72px; height: 72px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 600; border: 1px solid var(--color-primary-border); }
    .student-name { font-size: 1.75rem; font-weight: 600; margin: 0; color: var(--color-gray-900); }
    .name-row { display: flex; align-items: center; gap: 1rem; }
    .status-badge { padding: 0.125rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; display: inline-flex; border: 1px solid transparent; }
    .status-badge.registered { background: #ecfdf3; color: #027a48; border-color: #abefc6; }
    .meta-row { display: flex; align-items: center; gap: 0.75rem; color: var(--color-gray-600); font-size: 0.875rem; margin-top: 0.25rem; }
    .dot { width: 4px; height: 4px; background: var(--color-gray-300); border-radius: 50%; }
    
    .header-actions { display: flex; gap: 0.75rem; }


    /* Tabs */
    .tabs-container { border-bottom: 1px solid var(--color-gray-200); margin-bottom: 2rem; overflow-x: auto; }
    .tabs { display: flex; gap: 1rem; min-width: max-content; }
    .tab-btn { background: none; border: none; padding: 0.75rem 0.5rem; font-size: 0.875rem; font-weight: 600; color: var(--color-gray-500); cursor: pointer; position: relative; transition: all var(--transition-fast); }
    .tab-btn:hover { color: var(--color-gray-700); }
    .tab-btn.active { color: var(--color-primary); }
    .tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--color-primary); }

    /* Content Area */
    .panel-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); padding: 1.5rem; box-shadow: var(--shadow-sm); }
    .panel-title { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-900); margin: 0 0 1.5rem; }
    .grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    .mt-1-5 { margin-top: 1.5rem; }
    .mt-1 { margin-top: 1rem; }

    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .label { font-size: 0.8125rem; color: var(--color-gray-500); font-weight: 500; }
    .value { font-size: 0.9375rem; color: var(--color-gray-900); font-weight: 500; }

    .user-pill { display: flex; align-items: center; gap: 0.75rem; background: var(--color-gray-50); padding: 0.5rem 0.75rem; border-radius: 8px; margin-top: 0.5rem; border: 1px solid var(--color-gray-200); }
    .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; border: 1px solid var(--color-primary-border); }
    
    .action-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .action-btn { display: flex; align-items: center; gap: 0.75rem; background: white; border: 1px solid var(--color-gray-300); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-weight: 600; font-size: 0.875rem; color: var(--color-gray-700); cursor: pointer; transition: all var(--transition-fast); box-shadow: var(--shadow-xs); }
    .action-btn:hover { background: var(--color-gray-50); color: var(--color-gray-900); border-color: var(--color-gray-400); }
    .action-btn .material-icons { font-size: 20px; color: var(--color-gray-400); }

    /* Academic History in Detail View */
    .academic-timeline { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 0.5rem; }
    .academic-entry { display: flex; gap: 1rem; position: relative; }
    .academic-entry::before { content: ''; position: absolute; left: 15px; top: 32px; bottom: -1rem; width: 2px; background: var(--color-gray-100); }
    .academic-entry:last-child::before { content: none; }
    
    .entry-icon { width: 32px; height: 32px; background: white; border: 2px solid var(--color-gray-200); border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 1; }
    .entry-icon .material-icons { font-size: 1rem; color: var(--color-gray-400); }
    .entry-details { display: flex; flex-direction: column; gap: 0.125rem; }
    .qualification { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); }
    .institution { font-size: 0.8125rem; color: var(--color-gray-600); }
    .score { font-size: 0.75rem; color: var(--color-gray-500); }

    /* Documents */
    .header-with-action { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }

    .doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .doc-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); transition: all var(--transition-fast); background: white; }
    .doc-item:hover { border-color: var(--color-primary-border); box-shadow: var(--shadow-sm); }
    .doc-icon { width: 44px; height: 44px; background: var(--color-gray-50); border: 1px solid var(--color-gray-200); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--color-gray-400); }
    .doc-icon.uploaded { background: var(--color-primary-light); border-color: var(--color-primary-border); color: var(--color-primary); }
    .doc-info { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
    .doc-name { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); }
    .doc-status { font-size: 0.75rem; color: var(--color-gray-400); }
    .doc-status.uploaded { color: var(--color-success); font-weight: 600; }
    .doc-actions { display: flex; gap: 0.5rem; }
    .btn-icon.circle { width: 32px; height: 32px; border-radius: 50%; background: white; border: 1px solid var(--color-gray-300); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: var(--color-gray-500); transition: all var(--transition-fast); cursor: pointer; }
    .btn-icon.circle:hover { color: var(--color-primary); border-color: var(--color-primary); background: var(--color-primary-light); }

    /* Timeline */
    .timeline { position: relative; padding-left: 2rem; margin-top: 1rem; }
    .timeline::before { content: ''; position: absolute; left: 4px; top: 0; bottom: 0; width: 2px; background: var(--color-gray-200); }
    .timeline-item { position: relative; margin-bottom: 2rem; display: flex; gap: 2rem; }
    .timeline-meta { display: flex; flex-direction: column; min-width: 100px; padding-top: 2px; }
    .timeline-meta .time { font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-900); }
    .timeline-meta .date { font-size: 0.75rem; color: var(--color-gray-500); }
    .timeline-dot { position: absolute; left: -1.75rem; top: 8px; width: 10px; height: 10px; background: white; border: 2px solid var(--color-primary); border-radius: 50%; z-index: 2; }
    .timeline-content { flex: 1; background: var(--color-gray-50); padding: 1rem 1.25rem; border-radius: 8px; border: 1px solid var(--color-gray-200); }
    .activity-header { font-size: 0.875rem; color: var(--color-gray-900); margin-bottom: 0.25rem; }
    .activity-header strong { font-weight: 600; }
    .activity-desc { font-size: 0.8125rem; color: var(--color-gray-600); margin: 0; }

    @media (max-width: 1024px) {
      .grid-2-1 { grid-template-columns: 1fr; }
      .detail-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .header-actions { width: 100%; }
      .header-actions button { flex: 1; }
      .timeline-item { flex-direction: column; gap: 0.5rem; }
      .timeline-meta { flex-direction: row; gap: 1rem; }
    }
  `]
})
export class StudentDetailComponent implements OnInit {
  activeTab = 'overview';
  route = inject(ActivatedRoute);
  router = inject(Router);
  studentService = inject(StudentService);

  documentList = [
    { key: 'passport', label: 'Passport (Full Copy)' },
    { key: 'marksheet10', label: '10th Marksheet' },
    { key: 'marksheet12', label: '12th Marksheet' },
    { key: 'birthCertificate', label: 'Birth Certificate' },
    { key: 'policeClearance', label: 'Police Clearance (PCC)' },
    { key: 'bankStatement', label: 'Bank Statement (6 Months)' },
    { key: 'insurance', label: 'Insurance Document' },
    { key: 'neetScorecard', label: 'NEET Scorecard' }
  ];

  student: any = null;

  activities = [
    { time: '10:30 AM', date: '12 Apr 2024', user: 'Siddharth Patel', action: 'uploaded documents', details: 'Added Passport and 10th Marksheet' },
    { time: '04:15 PM', date: '11 Apr 2024', user: 'Siddharth Patel', action: 'updated status', details: 'Status changed from Lead to Registered' },
    { time: '09:00 AM', date: '10 Apr 2024', user: 'Admin', action: 'assigned counsellor', details: 'Assigned Siddharth Patel to Mukul' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentService.getStudentById(id).subscribe({
        next: (data) => {
          this.student = {
            ...data,
            country: data.country?.name || data.country,
            university: data.university?.name || data.university,
            academicHistory: data.academicHistories || [],
            documents: data.documents || {}
          };
        },
        error: (err) => {
          console.error('Error fetching student detail:', err);
          this.router.navigate(['/admin/students']);
        }
      });
    }
  }
}
