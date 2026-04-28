import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
        <form #studentForm="ngForm" (ngSubmit)="onSubmit()">
          <!-- Personal Information -->
          <div class="form-section">
            <h3 class="section-title">Personal Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="name" [(ngModel)]="student.name" required placeholder="Enter student's full name">
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" name="email" [(ngModel)]="student.email" required placeholder="example@mail.com">
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" [(ngModel)]="student.phone" required placeholder="+91 00000 00000">
              </div>
              <div class="form-group">
                <label>Status</label>
                <select name="status" [(ngModel)]="student.status">
                  <option value="Lead">Lead</option>
                  <option value="Registered">Registered</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Academic & Destination Details -->
          <div class="form-section">
            <h3 class="section-title">Academic & Destination</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Destination Country</label>
                <select name="country" [(ngModel)]="student.country">
                  <option value="Germany">Germany</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Poland">Poland</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              <div class="form-group">
                <label>Target University</label>
                <input type="text" name="university" [(ngModel)]="student.university" placeholder="Search or enter university">
              </div>
              <div class="form-group">
                <label>Course Name</label>
                <input type="text" name="course" [(ngModel)]="student.course" placeholder="e.g. Masters in Computer Science">
              </div>
              <div class="form-group">
                <label>Intake</label>
                <select name="intake" [(ngModel)]="student.intake">
                  <option value="Winter 2024">Winter 2024</option>
                  <option value="Summer 2025">Summer 2025</option>
                  <option value="Winter 2025">Winter 2025</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Assign Mentors -->
          <div class="form-section">
            <h3 class="section-title">Assignment & Referrals</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Assign Counsellor</label>
                <select name="counsellor" [(ngModel)]="student.counsellor">
                  <option value="Siddharth Patel">Siddharth Patel</option>
                  <option value="Rohan Gupta">Rohan Gupta</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div class="form-group">
                <label>Referral / Company</label>
                <select name="referral" [(ngModel)]="student.referral">
                  <option value="">None / Direct</option>
                  <option value="Agent 001">Agent 001</option>
                  <option value="Global Consultancy">Global Consultancy</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Academic History -->
          <div class="form-section">
            <h3 class="section-title">Academic History</h3>
            <div class="form-grid full">
              <div class="form-group">
                <label>Last Qualification</label>
                <textarea name="academicDetails" [(ngModel)]="student.academicDetails" rows="3" placeholder="Enter previous education details..."></textarea>
              </div>
            </div>
          </div>

          <div class="form-footer">
            <button type="button" class="btn btn-secondary" [routerLink]="['/admin/students']">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="!studentForm.valid">
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
  
  isEdit = false;
  student: any = {
    status: 'Lead',
    country: 'Germany',
    intake: 'Winter 2024',
    counsellor: 'Siddharth Patel'
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      // Mock pre-fill
      this.student = {
        id,
        name: 'Mukul Sharma',
        email: 'mukul@example.com',
        phone: '+91 9876543210',
        status: 'Registered',
        country: 'Germany',
        university: 'Technical University of Munich',
        course: 'MSc Computer Science',
        intake: 'Winter 2024',
        counsellor: 'Siddharth Patel',
        referral: '',
        academicDetails: 'B.Tech in CS from IIT Delhi - 8.5 CGPA'
      };
    }
  }

  onSubmit() {
    console.log('Student Data:', this.student);
    // Success toast and redirection
    this.router.navigate(['/admin/students']);
  }
}
