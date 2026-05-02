import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { StudentService } from '../../../../core/services/student.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-content">
          <button class="btn-back" [routerLink]="['/admin/students']">
            <span class="material-icons">arrow_back</span>
          </button>
          <div>
            <h1 class="page-title">{{ isEdit ? 'Edit Student' : 'Add New Student' }}</h1>
            <p class="page-subtitle">{{ isEdit ? 'Update student records and progress.' : 'Create a new student lead or registration.' }}</p>
          </div>
        </div>
      </div>

      <div class="form-card">
        <!-- Stepper -->
        <div class="stepper-wrapper">
          <div class="stepper-item" [class.active]="currentStep === 1" [class.completed]="currentStep > 1" (click)="setStep(1)">
            <div class="step-counter">1</div>
            <div class="step-name">Personal</div>
          </div>
          <div class="stepper-item" [class.active]="currentStep === 2" [class.completed]="currentStep > 2" (click)="setStep(2)">
            <div class="step-counter">2</div>
            <div class="step-name">Destination</div>
          </div>
          <div class="stepper-item" [class.active]="currentStep === 3" [class.completed]="currentStep > 3" (click)="setStep(3)">
            <div class="step-counter">3</div>
            <div class="step-name">Academic</div>
          </div>
          <div class="stepper-item" [class.active]="currentStep === 4" [class.completed]="currentStep > 4" (click)="setStep(4)">
            <div class="step-counter">4</div>
            <div class="step-name">Documents</div>
          </div>
        </div>

        <form #studentForm="ngForm" (ngSubmit)="onSubmit()">
          <!-- Personal Information -->
          <div class="form-section" *ngIf="currentStep === 1">
            <h3 class="section-title">Personal Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name <span class="required-star">*</span></label>
                <input type="text" name="name" [(ngModel)]="student.name" required placeholder="Enter student's full name">
              </div>
              <div class="form-group">
                <label>Email Address <span class="required-star">*</span></label>
                <input type="email" name="email" [(ngModel)]="student.email" required placeholder="example@mail.com">
              </div>
              <div class="form-group">
                <label>Phone Number <span class="required-star">*</span></label>
                <input type="tel" name="phone" [(ngModel)]="student.phone" required placeholder="+91 00000 00000">
              </div>
              <div class="form-group">
                <label>Status <span class="required-star">*</span></label>
                <select name="status" [(ngModel)]="student.status" required>
                  <option value="Lead">Lead</option>
                  <option value="Registered">Registered</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Academic & Destination Details -->
          <div class="form-section" *ngIf="currentStep === 2">
            <h3 class="section-title">Academic & Destination</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Destination Country <span class="required-star">*</span></label>
                <select name="country" [(ngModel)]="student.country" required>
                  <option value="Germany">Germany</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Poland">Poland</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              <div class="form-group">
                <label>Target University <span class="required-star">*</span></label>
                <input type="text" name="university" [(ngModel)]="student.university" required placeholder="Search or enter university">
              </div>
              <div class="form-group">
                <label>Course Name <span class="required-star">*</span></label>
                <input type="text" name="course" [(ngModel)]="student.course" required placeholder="e.g. Masters in Computer Science">
              </div>
              <div class="form-group">
                <label>Intake <span class="required-star">*</span></label>
                <select name="intake" [(ngModel)]="student.intake" required>
                  <option value="Winter 2024">Winter 2024</option>
                  <option value="Summer 2025">Summer 2025</option>
                  <option value="Winter 2025">Winter 2025</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Academic History -->
          <div class="form-section" *ngIf="currentStep === 3">
            <div class="section-header">
              <h3 class="section-title">Academic History</h3>
              <button type="button" class="btn-add" (click)="addAcademicRecord()" *ngIf="student.academicHistory.length < 3">
                <span class="material-icons">add</span>
                <span>Add College Details</span>
              </button>
            </div>
            
            <div class="academic-records">
              <div *ngFor="let record of student.academicHistory; let i = index" class="academic-record-card">
                <div class="record-header" *ngIf="student.academicHistory.length > 1">
                  <span class="record-number">Record #{{ i + 1 }}</span>
                  <button type="button" class="btn-remove" (click)="removeAcademicRecord(i)" [disabled]="isMandatory(record)" [title]="isMandatory(record) ? 'Mandatory record cannot be removed' : 'Remove record'">
                    <span class="material-icons">delete_outline</span>
                  </button>
                </div>
                
                <div class="form-grid">
                  <div class="form-group">
                    <label>Qualification <span class="required-star" *ngIf="isMandatory(record)">*</span></label>
                    <input type="text" [name]="'qualification_' + i" [(ngModel)]="record.qualification" [required]="isMandatory(record)" placeholder="e.g. B.Tech, 12th Standard">
                  </div>
                  <div class="form-group">
                    <label>Stream / Specialization</label>
                    <input type="text" [name]="'stream_' + i" [(ngModel)]="record.stream" placeholder="e.g. Computer Science, Science">
                  </div>
                  <div class="form-group">
                    <label>Institution Name <span class="required-star" *ngIf="isMandatory(record)">*</span></label>
                    <input type="text" [name]="'institution_name_' + i" [(ngModel)]="record.institution_name" [required]="isMandatory(record)" placeholder="Name of school/college">
                  </div>
                  <div class="form-group">
                    <label>Board / University <span class="required-star" *ngIf="isMandatory(record)">*</span></label>
                    <input type="text" [name]="'board_university_' + i" [(ngModel)]="record.board_university" [required]="isMandatory(record)" placeholder="e.g. CBSE, Delhi University">
                  </div>
                  <div class="form-group">
                    <label>Passing Year <span class="required-star" *ngIf="isMandatory(record)">*</span></label>
                    <input type="number" [name]="'passing_year_' + i" [(ngModel)]="record.passing_year" [required]="isMandatory(record)" placeholder="YYYY">
                  </div>
                  <div class="form-group">
                    <label>Score / CGPA <span class="required-star" *ngIf="isMandatory(record)">*</span></label>
                    <input type="text" [name]="'score_' + i" [(ngModel)]="record.score" [required]="isMandatory(record)" placeholder="e.g. 85% or 8.5 CGPA">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents Upload -->
          <div class="form-section" *ngIf="currentStep === 4">
            <h3 class="section-title">Document Uploads</h3>
            <div class="upload-grid">
              <div class="upload-item" *ngFor="let doc of documentList">
                <div class="doc-info">
                  <span class="material-icons">description</span>
                  <div class="doc-meta">
                    <span class="doc-name">{{ doc.label }} <span class="required-star" *ngIf="doc.key === 'marksheet10'">*</span></span>
                    <span class="doc-status" [class.uploaded]="student.documents[doc.key]">
                      {{ student.documents[doc.key] ? 'File Ready' : 'No file chosen' }}
                    </span>
                  </div>
                </div>
                <label [for]="doc.key" class="btn-upload">
                  <span class="material-icons">cloud_upload</span>
                  <span>{{ student.documents[doc.key] ? 'Change' : 'Upload' }}</span>
                </label>
                <input type="file" [id]="doc.key" (change)="onFileChange($event, doc.key)" hidden>
              </div>
            </div>
          </div>

          <div class="form-footer">
            <button type="button" class="btn btn-secondary" *ngIf="currentStep === 1" [routerLink]="['/admin/students']">Cancel</button>
            <button type="button" class="btn btn-secondary" *ngIf="currentStep > 1" (click)="prevStep()">Back</button>
            
            <button type="button" class="btn btn-primary" *ngIf="currentStep === 1" (click)="nextStep()" [disabled]="!isPersonalValid()">Continue</button>
            <button type="button" class="btn btn-primary" *ngIf="currentStep === 2" (click)="nextStep()" [disabled]="!isDestinationValid()">Continue</button>
            <button type="button" class="btn btn-primary" *ngIf="currentStep === 3" (click)="nextStep()" [disabled]="!isAcademicValid()">Continue</button>
            
            <button type="submit" class="btn btn-primary" *ngIf="currentStep === 4" [disabled]="!isDocumentsValid()">
              {{ isEdit ? 'Update Student' : 'Save Student' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .module-container { padding-bottom: 2rem; }
    .module-header { margin-bottom: 2rem; }
    .header-content { display: flex; align-items: center; gap: 1rem; }
    .btn-back { background: white; border: 1px solid var(--color-gray-300); width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--color-gray-500); transition: all var(--transition-fast); box-shadow: var(--shadow-xs); }
    .btn-back:hover { color: var(--color-gray-700); background: var(--color-gray-50); border-color: var(--color-gray-400); }
    .page-title { font-size: 1.875rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .page-subtitle { color: var(--color-gray-600); margin: 0.25rem 0 0; font-size: 1rem; }

    .form-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); padding: 2rem; box-shadow: var(--shadow-sm); }
    .form-section { margin-bottom: 3rem; }
    .form-section:last-child { margin-bottom: 0; }
    .section-title { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-900); margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--color-gray-200); }
    
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .form-grid.full { grid-template-columns: 1fr; }
    
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--color-gray-700); }
    
    .form-group input, .form-group select, .form-group textarea {
      background: white;
      border: 1px solid var(--color-gray-300);
      padding: 0.625rem 0.875rem;
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      color: var(--color-gray-900);
      outline: none;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-xs);
    }
    .form-group input::placeholder, .form-group textarea::placeholder { color: var(--color-gray-400); }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-primary-light);
    }

    .form-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--color-gray-200); }

    /* Academic History Styles */
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--color-gray-200); }
    .section-header .section-title { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    
    .btn-add { display: flex; align-items: center; gap: 0.5rem; background: var(--color-primary-light); color: var(--color-primary); border: 1px solid var(--color-primary-border); padding: 0.5rem 1rem; border-radius: var(--radius-md); font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all var(--transition-fast); }
    .btn-add:hover { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .btn-add .material-icons { font-size: 1.25rem; }

    .academic-record-card { background: var(--color-gray-50); border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem; transition: all var(--transition-normal); }
    .academic-record-card:hover { border-color: var(--color-primary-border); box-shadow: var(--shadow-sm); }
    
    .record-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .record-number { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.025em; }
    
    .btn-remove { background: white; border: 1px solid var(--color-gray-200); color: var(--color-error); width: 32px; height: 32px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition-fast); }
    .btn-remove:hover:not(:disabled) { background: #fef2f2; border-color: #fee2e2; }
    .btn-remove:disabled { opacity: 0.3; cursor: not-allowed; }
    .btn-remove .material-icons { font-size: 1.25rem; }

    .required-star { color: var(--color-error); margin-left: 2px; }

    /* Stepper Styles */
    .stepper-wrapper { display: flex; justify-content: space-between; margin-bottom: 3rem; position: relative; padding: 0 1rem; }
    .stepper-wrapper::before { content: ''; position: absolute; top: 18px; left: 1rem; right: 1rem; height: 2px; background: var(--color-gray-200); z-index: 0; }
    
    .stepper-item { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; }
    .step-counter { width: 36px; height: 36px; background: white; border: 2px solid var(--color-gray-300); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--color-gray-500); transition: all 0.3s ease; }
    .step-name { font-size: 0.75rem; font-weight: 600; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.05em; }
    
    .stepper-item.active .step-counter { border-color: var(--color-primary); background: var(--color-primary); color: white; box-shadow: 0 0 0 4px var(--color-primary-light); }
    .stepper-item.active .step-name { color: var(--color-primary); }
    
    .stepper-item.completed .step-counter { border-color: var(--color-primary); background: var(--color-primary); color: white; }

    /* Upload Styles */
    .upload-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .upload-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: white; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); transition: all 0.2s; }
    .upload-item:hover { border-color: var(--color-primary-border); background: var(--color-gray-50); }
    
    .doc-info { display: flex; align-items: center; gap: 1rem; }
    .doc-info .material-icons { color: var(--color-gray-400); font-size: 2rem; }
    .doc-meta { display: flex; flex-direction: column; gap: 0.125rem; }
    .doc-name { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-700); }
    .doc-status { font-size: 0.75rem; color: var(--color-gray-500); }
    .doc-status.uploaded { color: var(--color-success); font-weight: 600; }
    
    .btn-upload { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid var(--color-gray-300); padding: 0.5rem 0.875rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700); cursor: pointer; transition: all 0.2s; }
    .btn-upload:hover { background: var(--color-gray-50); border-color: var(--color-gray-400); }
    .btn-upload .material-icons { font-size: 1rem; }


    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-card { padding: 1.25rem; }
      .page-title { font-size: 1.5rem; }
    }
  `]
})
export class StudentFormComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  notificationService = inject(NotificationService);
  studentService = inject(StudentService);
  
  isEdit = false;
  currentStep = 1;
  
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

  student: any = {
    status: 'Lead',
    country: 'Germany',
    intake: 'Winter 2024',
    academicHistory: [
      {
        qualification: '10th Standard',
        stream: '',
        institution_name: '',
        board_university: '',
        passing_year: null,
        score: ''
      },
      {
        qualification: '12th Standard',
        stream: '',
        institution_name: '',
        board_university: '',
        passing_year: null,
        score: ''
      }
    ],
    documents: {}
  };

  setStep(step: number) {
    this.currentStep = step;
  }

  nextStep() {
    if (this.currentStep < 4) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  onFileChange(event: any, docKey: string) {
    const file = event.target.files[0];
    if (file) {
      this.student.documents[docKey] = file.name;
    }
  }

  isPersonalValid(): boolean {
    return !!(this.student.name && this.student.email && this.student.phone && this.student.status);
  }

  isDestinationValid(): boolean {
    return !!(this.student.country && this.student.university && this.student.course && this.student.intake);
  }

  isAcademicValid(): boolean {
    const records = this.student.academicHistory;
    // Check if 10th and 12th records exist and have mandatory fields
    const tenth = records.find((r: any) => r.qualification === '10th Standard');
    const twelfth = records.find((r: any) => r.qualification === '12th Standard');

    if (!tenth || !twelfth) return false;

    const isRecordFilled = (r: any) => !!(r.institution_name && r.board_university && r.passing_year && r.score);
    
    return isRecordFilled(tenth) && isRecordFilled(twelfth);
  }

  isDocumentsValid(): boolean {
    return !!this.student.documents['marksheet10'];
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.studentService.getStudentById(id).subscribe({
        next: (data) => {
          this.student = {
            ...data,
            country: data.country?.name || data.country,
            university: data.university?.name || data.university,
            academicHistory: data.academicHistories || []
          };
          
          // Ensure we have at least 10th and 12th if they are missing
          if (this.student.academicHistory.length === 0) {
            this.student.academicHistory = [
              { qualification: '10th Standard', stream: '', institution_name: '', board_university: '', passing_year: null, score: '' },
              { qualification: '12th Standard', stream: '', institution_name: '', board_university: '', passing_year: null, score: '' }
            ];
          }
        },
        error: (err) => {
          this.notificationService.showModal('Error', 'Could not fetch student details', 'Please try again later.');
          this.router.navigate(['/admin/students']);
        }
      });
    }
  }

  isMandatory(record: any): boolean {
    return record.qualification === '12th Standard' || record.qualification === '10th Standard';
  }

  addAcademicRecord() {
    const recordCount = this.student.academicHistory.length;
    if (recordCount >= 3) return;

    let nextQualification = '';
    
    // We already have 12th and 10th by default (index 0 and 1)
    if (recordCount === 2) {
      nextQualification = 'Graduation / College';
    }

    this.student.academicHistory.push({
      qualification: nextQualification,
      stream: '',
      institution_name: '',
      board_university: '',
      passing_year: null,
      score: ''
    });
  }

  removeAcademicRecord(index: number) {
    const record = this.student.academicHistory[index];
    if (!this.isMandatory(record) && this.student.academicHistory.length > 1) {
      this.student.academicHistory.splice(index, 1);
    }
  }

  onSubmit() {
    const saveObservable = this.isEdit 
      ? this.studentService.updateStudent(this.student.id, this.student)
      : this.studentService.createStudent(this.student);

    saveObservable.subscribe({
      next: () => {
        this.notificationService.showModal(
          this.isEdit ? 'Student Updated!' : 'Student Created!',
          this.isEdit ? 'The student record has been successfully updated.' : 'A new student lead has been successfully registered.',
          this.isEdit 
            ? 'All changes have been saved to the database.'
            : 'The student account is now active.'
        );
        this.router.navigate(['/admin/students']);
      },
      error: (err) => {
        console.error('Error saving student:', err);
        this.notificationService.showModal('Error', 'Failed to save student', 'An unexpected error occurred. Please check the form and try again.');
      }
    });
  }
}
