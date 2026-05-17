import { Component, inject, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../core/services/notification.service';
import { StudentService } from '../../../../core/services/student.service';
import { CountryService, CountryMobileCode, Country, University } from '../../../../core/services/country.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BranchService } from '../../../../core/services/branch.service';
import { Observable, forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="form-modal-container">
      <!-- Left Sidebar: Stepper -->
      <div class="stepper-sidebar">
        <div class="stepper-header">
          <div class="stepper-icon-box">
            <span class="material-icons">school</span>
          </div>
          <div class="stepper-title-box">
            <h3>Student Portal</h3>
            <p>{{ isEdit ? 'Edit Record' : 'Onboarding' }}</p>
          </div>
        </div>

        <div class="vertical-stepper">
          <div class="v-step" [class.active]="currentStep === 1" [class.completed]="currentStep > 1" (click)="setStep(1)">
            <div class="v-step-indicator">
              <span class="material-icons" *ngIf="currentStep > 1">check</span>
              <span *ngIf="currentStep <= 1">1</span>
            </div>
            <div class="v-step-content">
              <span class="v-step-label">Personal Information</span>
              <span class="v-step-sublabel">Basic details & contact</span>
            </div>
            <div class="v-step-line"></div>
          </div>

          <div class="v-step" [class.active]="currentStep === 2" [class.completed]="currentStep > 2" (click)="setStep(2)">
            <div class="v-step-indicator">
              <span class="material-icons" *ngIf="currentStep > 2">check</span>
              <span *ngIf="currentStep <= 2">2</span>
            </div>
            <div class="v-step-content">
              <span class="v-step-label">Destination Details</span>
              <span class="v-step-sublabel">Country & University</span>
            </div>
            <div class="v-step-line"></div>
          </div>

          <div class="v-step" [class.active]="currentStep === 3" [class.completed]="currentStep > 3" (click)="setStep(3)">
            <div class="v-step-indicator">
              <span class="material-icons" *ngIf="currentStep > 3">check</span>
              <span *ngIf="currentStep <= 3">3</span>
            </div>
            <div class="v-step-content">
              <span class="v-step-label">Academic History</span>
              <span class="v-step-sublabel">Previous education</span>
            </div>
            <div class="v-step-line"></div>
          </div>

          <div class="v-step" [class.active]="currentStep === 4" [class.completed]="currentStep > 4" (click)="setStep(4)">
            <div class="v-step-indicator">
              <span class="material-icons" *ngIf="currentStep > 4">check</span>
              <span *ngIf="currentStep <= 4">4</span>
            </div>
            <div class="v-step-content">
              <span class="v-step-label">Documents</span>
              <span class="v-step-sublabel">Upload certificates</span>
            </div>
          </div>
        </div>

        <div class="stepper-footer">
          <div class="help-box">
            <span class="material-icons">info</span>
            <p>Need help? Contact support team.</p>
          </div>
        </div>
      </div>

      <!-- Right Content: Form -->
      <div class="form-main-area">
        <div class="form-header">
          <div class="header-left">
            <h2 class="form-title">{{ isEdit ? 'Edit Student' : 'Add New Student' }}</h2>
            <p class="form-subtitle">Step {{ currentStep }} of 4: {{ getStepTitle() }}</p>
          </div>
          <button class="btn-close" (click)="close.emit()">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="form-body">
          <form #studentForm="ngForm">
            <!-- Step 1: Personal -->
            <div class="step-animation" *ngIf="currentStep === 1" style="min-height: 400px; padding-bottom: 50px;">
              <div class="form-grid">
                <div class="form-group">
                  <label>First Name <span class="required">*</span></label>
                  <div class="input-with-icon">
                    <span class="material-icons">person</span>
                    <input type="text" name="firstName" [(ngModel)]="student.firstName" #firstNameModel="ngModel" required maxlength="50" placeholder="First name">
                  </div>
                  <div class="error-message" *ngIf="firstNameModel.invalid && (firstNameModel.touched || submitted)" style="color: #d92d20; font-size: 0.75rem; margin-top: 4px;">
                    First name is required.
                  </div>
                </div>
                <div class="form-group">
                  <label>Last Name <span class="required">*</span></label>
                  <div class="input-with-icon">
                    <span class="material-icons">person_outline</span>
                    <input type="text" name="lastName" [(ngModel)]="student.lastName" #lastNameModel="ngModel" required maxlength="50" placeholder="Last name">
                  </div>
                  <div class="error-message" *ngIf="lastNameModel.invalid && (lastNameModel.touched || submitted)" style="color: #d92d20; font-size: 0.75rem; margin-top: 4px;">
                    Last name is required.
                  </div>
                </div>
                <div class="form-group full-width phone-group">
                  <label>Phone Number <span class="required">*</span></label>
                  <div class="phone-input-wrapper">
                    <!-- MCC Dropdown -->
                    <div class="mcc-dropdown" (click)="isEdit ? null : toggleCountryDropdown($event)" [class.disabled]="isEdit">
                      <div class="mcc-selected">
                        <img *ngIf="selectedCountry?.flagUrl" [src]="selectedCountry?.flagUrl" alt="flag">
                        <span>{{ student.dialCode }}</span>
                        <span class="material-icons">expand_more</span>
                      </div>
                      <div class="mcc-list shadow-premium" *ngIf="isCountryDropdownOpen">
                        <div class="mcc-item" *ngFor="let c of countryCodes" (click)="selectCountry(c, $event)">
                          <img *ngIf="c.flagUrl" [src]="c.flagUrl" alt="flag">
                          <span class="code">{{ c.mobileCode }}</span>
                          <span class="name">{{ c.countryName }}</span>
                        </div>
                      </div>
                    </div>
                    <input type="tel" name="phone" [(ngModel)]="student.phone" #phoneModel="ngModel" required [maxlength]="selectedCountry?.mobileNumberLength || 20" [minlength]="selectedCountry?.mobileNumberLength || 10" pattern="[0-9]*" placeholder="00000 00000" class="form-control" [disabled]="isEdit">
                  </div>
                  <div class="error-message" *ngIf="phoneModel.invalid && (phoneModel.touched || submitted)" style="color: #d92d20; font-size: 0.75rem; margin-top: 4px;">
                    <span *ngIf="phoneModel.errors?.['required']">Phone number is required.</span>
                    <span *ngIf="phoneModel.errors?.['minlength'] || phoneModel.errors?.['maxlength']">Phone number must be {{ selectedCountry?.mobileNumberLength }} digits.</span>
                  </div>
                </div>

                <div class="form-group full-width">
                  <label>Email Address</label>
                  <div class="input-with-icon">
                    <span class="material-icons">email</span>
                    <input type="email" name="email" [(ngModel)]="student.email" #emailModel="ngModel" maxlength="150" placeholder="example@mail.com" (blur)="checkEmail()">
                  </div>
                  <div class="error-message" *ngIf="emailModel.invalid && student.email && (emailModel.touched || submitted)" style="color: #d92d20; font-size: 0.75rem; margin-top: 4px;">
                    Please enter a valid email address.
                  </div>
                </div>

                <!-- Branch Dropdown -->
                <div class="form-group full-width">
                  <label>Assign to Branch <span class="required" *ngIf="isBranchMandatory">*</span></label>
                  <select name="branchId" [(ngModel)]="student.branchId" #branchIdModel="ngModel" [required]="isBranchMandatory" (change)="onBranchChange()" class="form-control">
                    <option value="" disabled selected>Select Branch</option>
                    <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
                  </select>
                  <div class="error-message" *ngIf="isBranchMandatory && branchIdModel.invalid && (branchIdModel.touched || submitted)" style="color: #d92d20; font-size: 0.75rem; margin-top: 4px;">
                    Branch assignment is required.
                  </div>
                </div>

                <!-- Assign To (Counsellor) - Staff Only -->
                <div class="form-group full-width" *ngIf="showAssignTo">
                  <label>Assign To (Counsellor)</label>
                  <select name="assignedToId" [(ngModel)]="student.assignedToId" class="form-control" [disabled]="!student.branchId">
                    <option value="" selected>{{ !student.branchId ? 'First select a branch' : 'Select Counsellor (Optional)' }}</option>
                    <option *ngFor="let counsellor of counsellors" [value]="counsellor.id">{{ counsellor.fullName }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 2: Destination -->
            <div class="step-animation" *ngIf="currentStep === 2">
              <div class="form-grid">
                <div class="form-group">
                  <label>Destination Country</label>
                  <select name="countryId" [(ngModel)]="student.countryId" #countryIdModel="ngModel" (change)="onCountryChange()" class="form-control">
                    <option value="" disabled selected>Select a country</option>
                    <option *ngFor="let country of countries" [value]="country.id">{{ country.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Target University</label>
                  <select name="universityId" [(ngModel)]="student.universityId" #universityIdModel="ngModel" class="form-control" [disabled]="!student.countryId">
                    <option value="" disabled selected>{{ student.countryId ? 'Select a university' : 'First select a country' }}</option>
                    <option *ngFor="let uni of universities" [value]="uni.id">{{ uni.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Course Name</label>
                  <select name="course" [(ngModel)]="student.course" class="form-control">
                    <option value="" disabled selected>Select course</option>
                    <option value="MBBS">MBBS</option>
                    <option value="MD">MD</option>
                    <option value="BDS">BDS</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Intake Period</label>
                  <div class="input-with-icon">
                    <span class="material-icons">event</span>
                    <input type="text" name="intake" [(ngModel)]="student.intake" placeholder="e.g. Fall 2026">
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Academic History -->
            <div class="step-animation" *ngIf="currentStep === 3">
              <div class="academic-header">
                <p>Provide details of previous educational qualifications.</p>
                <button type="button" class="btn-add-sm" (click)="addAcademicRecord()" *ngIf="student.academicHistory.length < 3">
                  <span class="material-icons">add</span> Add Graduation
                </button>
              </div>
              
                <div class="academic-list">
                  <div *ngFor="let record of student.academicHistory; let i = index" class="academic-item-card">
                    <div class="item-header">
                      <span class="item-tag">{{ record.level }}{{ record.level.includes('th') ? ' Standard' : '' }}</span>
                      <button type="button" class="btn-delete-sm" (click)="removeAcademicRecord(i)" *ngIf="!isMandatory(record)">
                        <span class="material-icons">delete</span>
                      </button>
                    </div>
                    <div class="academic-fields">
                      <div class="form-group flex-2">
                        <label>Institution Name</label>
                        <div class="input-with-icon">
                          <span class="material-icons">school</span>
                          <input type="text" [name]="'inst_' + i" [(ngModel)]="record.institutionName" placeholder="School/College Name" class="form-control">
                        </div>
                      </div>
                      <div class="form-group flex-1">
                        <label>Passing Year</label>
                        <select [name]="'year_' + i" [(ngModel)]="record.passingYear" class="form-control">
                          <option value="">Select Year</option>
                          <option *ngFor="let year of passingYears" [value]="year.toString()">{{ year }}</option>
                        </select>
                      </div>
                      <div class="form-group flex-1">
                        <label>Score/CGPA</label>
                        <div class="input-with-icon">
                          <span class="material-icons">grade</span>
                          <input type="text" [name]="'score_' + i" [(ngModel)]="record.scoreCgpa" placeholder="e.g. 85%" class="form-control">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            <!-- Step 4: Documents -->
            <div class="step-animation" *ngIf="currentStep === 4">
              <div class="upload-container">
                <div class="upload-cta">
                  <div class="cta-icon">
                    <span class="material-icons">cloud_upload</span>
                  </div>
                  <div class="cta-text">
                    <h4>Upload Documents</h4>
                    <p>Select required files to proceed with the application.</p>
                  </div>
                  <label for="multi-upload" class="btn-attach">
                    <span class="material-icons">add</span> Attach file or media
                  </label>
                  <input type="file" id="multi-upload" (change)="onGenericFileUpload($event)" hidden multiple>
                </div>

                <div class="file-list" *ngIf="getFileKeys().length > 0">
                  <div class="file-item" *ngFor="let key of getFileKeys()">
                    <div class="file-icon">
                      <span class="material-icons">{{ getFileIcon(student.fileMetadata?.[key]?.type || '') }}</span>
                    </div>
                    <div class="file-info">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                        <span class="file-name">{{ student.fileMetadata?.[key]?.name || key }}</span>
                        <span class="badge-status gray" style="font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; background: #f3f4f6; color: #4b5563; font-weight: 600;">{{ formatDocLabel(key) }}</span>
                      </div>
                      <span class="file-meta">{{ formatFileSize(student.fileMetadata?.[key]?.size || 0) }} • {{ student.fileMetadata?.[key]?.type?.split('/')[1]?.toUpperCase() || 'FILE' }}</span>
                    </div>
                    <div class="file-actions" style="display: flex; gap: 8px;">
                      <button type="button" class="btn-icon-sm" (click)="viewFile(key)" title="View">
                        <span class="material-icons">visibility</span>
                      </button>
                      <button type="button" class="btn-icon-sm" (click)="downloadFile(key)" title="Download">
                        <span class="material-icons">download</span>
                      </button>
                      <button class="btn-icon-sm delete" (click)="removeFile(key)" title="Delete">
                        <span class="material-icons">delete_outline</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="doc-slots-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 2rem;">
                  <div *ngFor="let doc of documentList" class="doc-slot-card" [class.uploaded]="!!student.documents[doc.key]">
                    <div class="slot-info">
                      <span class="material-icons">{{ !!student.documents[doc.key] ? 'check_circle' : 'description' }}</span>
                      <div class="slot-text">
                        <span class="slot-label">{{ doc.label }}</span>
                      </div>
                    </div>
                    
                    <div class="slot-actions">
                      <!-- Case: File Exists -->
                      <ng-container *ngIf="student.documents[doc.key]">
                        <button type="button" class="btn-icon-sm" (click)="viewFile(doc.key)" title="View">
                          <span class="material-icons">visibility</span>
                        </button>
                        <button type="button" class="btn-icon-sm" (click)="downloadFile(doc.key)" title="Download">
                          <span class="material-icons">download</span>
                        </button>
                        <button type="button" class="btn-icon-sm delete" (click)="removeFile(doc.key)" title="Delete">
                          <span class="material-icons">delete</span>
                        </button>
                      </ng-container>

                      <!-- Case: No File, but was deleted -->
                      <ng-container *ngIf="!student.documents[doc.key] && deletedSlots.has(doc.key)">
                        <label [for]="'file-' + doc.key" class="btn-upload-slot">
                          <span class="material-icons" style="font-size: 1rem;">upload</span> Upload
                        </label>
                        <input type="file" [id]="'file-' + doc.key" (change)="onFileChange($event, doc.key)" hidden>
                      </ng-container>

                      <!-- Case: No File, and not deleted (Clean state) -->
                      <ng-container *ngIf="!student.documents[doc.key] && !deletedSlots.has(doc.key)">
                        <span style="font-size: 0.7rem; color: var(--color-gray-400); italic;">Pending upload</span>
                      </ng-container>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </form>
        </div>

        <div class="form-footer">
          <button type="button" class="btn-prev" (click)="prevStep()" [disabled]="currentStep === 1">
            <span class="material-icons">arrow_back</span> Previous
          </button>
          
          <div class="footer-right">
            <button type="button" class="btn-next" *ngIf="currentStep < 4" (click)="nextStep()">
              Next <span class="material-icons">arrow_forward</span>
            </button>
            <button type="button" class="btn-submit" *ngIf="currentStep === 4" (click)="onSubmit()" [disabled]="submitting">
              <span *ngIf="!submitting">{{ isEdit ? 'Update Student' : 'Create Student' }}</span>
              <span *ngIf="submitting">{{ isEdit ? 'Updating...' : 'Creating...' }}</span>
              <span class="material-icons" *ngIf="!submitting">done</span>
              <span class="material-icons spinner" *ngIf="submitting">sync</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }

    .form-modal-container {
      display: flex;
      width: 100%;
      height: 100%;
      background: white;
      overflow: hidden;
    }

    /* Stepper Sidebar */
    .stepper-sidebar {
      width: 300px;
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
      padding-bottom: 2rem;
      cursor: pointer;
    }

    .v-step:last-child {
      padding-bottom: 0;
    }

    .v-step-indicator {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: white;
      border: 2px solid var(--color-gray-200);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
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

    .v-step-content {
      display: flex;
      flex-direction: column;
    }

    .v-step-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-gray-500);
    }

    .v-step-sublabel {
      font-size: 0.75rem;
      color: var(--color-gray-400);
    }

    .v-step.active .v-step-indicator {
      background: var(--color-primary-light);
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    .v-step.active .v-step-label {
      color: var(--color-primary);
    }

    .v-step.completed .v-step-indicator {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
    }

    .v-step.completed .v-step-line {
      background: var(--color-primary);
    }

    .stepper-footer .help-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: white;
      border-radius: 10px;
      border: 1px solid var(--color-gray-200);
    }

    .help-box p {
      font-size: 0.7rem;
      margin: 0;
      color: var(--color-gray-600);
    }

    /* Form Content */
    .form-main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .form-header {
      padding: 1.25rem 2rem;
      border-bottom: 1px solid var(--color-gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-title { font-size: 1.125rem; margin: 0; }
    .form-subtitle { font-size: 0.8125rem; color: var(--color-gray-500); margin: 0.25rem 0 0; }

    .btn-close {
      background: none;
      border: none;
      color: var(--color-gray-400);
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
    }

    .btn-close:hover { background: var(--color-gray-100); color: var(--color-gray-900); }

    .form-body {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .full-width { grid-column: span 2; }

    .form-group label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--color-gray-700);
      margin-bottom: 0.375rem;
    }

    .required { color: var(--color-error); }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-icon .material-icons {
      position: absolute;
      left: 10px;
      font-size: 1.125rem;
      color: var(--color-gray-400);
    }

    .form-control, .input-with-icon input {
      width: 100%;
      height: 40px;
      border: 1px solid var(--color-gray-300);
      border-radius: 8px;
      padding: 0 10px;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .input-with-icon input { padding-left: 36px; }

    .form-control:focus, .input-with-icon input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    /* Phone Input & MCC */
    .form-group.phone-group {
      position: relative;
      z-index: 10;
    }

    .phone-input-wrapper {
      display: flex;
      gap: 8px;
      position: relative;
    }

    .mcc-dropdown {
      position: relative;
      width: 90px;
      flex-shrink: 0;
      cursor: pointer;
    }

    .mcc-dropdown.disabled {
      cursor: not-allowed;
      opacity: 0.7;
      pointer-events: none;
      background: #f2f4f7;
    }

    .mcc-selected {
      height: 40px;
      border: 1px solid var(--color-gray-300);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      cursor: pointer;
      font-size: 0.8125rem;
      background: white;
    }

    .mcc-selected img { width: 18px; height: 12px; border-radius: 2px; }

    .mcc-list {
      position: absolute;
      top: 100%;
      left: 0;
      width: 260px;
      max-height: 200px;
      overflow-y: auto;
      background: white;
      border: 1px solid var(--color-gray-200);
      border-radius: 8px;
      z-index: 1000;
      margin-top: 4px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .mcc-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .mcc-item:hover { background: var(--color-gray-50); }

    .mcc-item img { width: 18px; height: 12px; border-radius: 2px; }
    .mcc-item .code { font-weight: 600; font-size: 0.8125rem; min-width: 36px; }
    .mcc-item .name { font-size: 0.75rem; color: var(--color-gray-500); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Academic History */
    .academic-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      background: #f8f9fc;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      border: 1px solid #e4e7ec;
    }

    .btn-add-sm {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .btn-add-sm:hover {
      background: var(--color-primary-light);
    }

    .academic-list { display: flex; flex-direction: column; gap: 1rem; }
    .academic-item-card {
      background: #f9fafb;
      border: 1px solid var(--color-gray-200);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.25rem;
    }

    .btn-delete-sm {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #b42318;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-delete-sm:hover {
      background: #fee2e2;
      color: #912018;
    }

    .academic-fields {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }

    .item-header { display: flex; justify-content: space-between; align-items: center; }
    .item-tag { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: var(--color-gray-500); background: white; border: 1px solid var(--color-gray-200); padding: 2px 8px; border-radius: 4px; }

    /* Documents */
    .upload-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .upload-cta {
      border: 2px dashed var(--color-primary-border);
      background: #fcfaff;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .cta-icon { color: var(--color-primary); font-size: 1.5rem; }
    .cta-text h4 { margin: 0; font-size: 0.9375rem; }
    .cta-text p { margin: 0.25rem 0 0; font-size: 0.75rem; color: var(--color-gray-500); }

    .btn-attach {
      background: var(--color-primary);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: white;
      border: 1px solid var(--color-gray-200);
      border-radius: 10px;
    }

    .file-info { flex: 1; }
    .file-name { display: block; font-size: 0.8125rem; font-weight: 600; }
    .file-meta { font-size: 0.7rem; color: var(--color-gray-500); }

    .btn-remove-file {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #b42318;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-remove-file:hover {
      background: #fee2e2;
    }

    .document-req-grid {
      display: grid;
      gap: 0.5rem;
    }

    .doc-req-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 8px;
      gap: 10px;
    }

    .doc-req-item.uploaded { background: #ecfdf3; }
    .uploaded .req-status { color: var(--color-success); }
    .req-label { flex: 1; font-size: 0.75rem; font-weight: 500; }

    .doc-slots-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .doc-slot-card {
      background: white;
      border: 1px solid var(--color-gray-200);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }

    .doc-slot-card.uploaded {
      border-color: var(--color-success);
      background: #f6fef9;
    }

    .slot-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--color-gray-700);
    }

    .uploaded .slot-info { color: var(--color-success); }
    .slot-label { font-size: 0.8125rem; font-weight: 600; }

    .btn-upload-slot {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-primary);
      cursor: pointer;
      padding: 4px 10px;
      border: 1px solid var(--color-primary-border);
      border-radius: 6px;
      background: white;
    }

    .btn-upload-slot:hover {
      background: var(--color-primary-light);
    }

    .slot-actions {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .btn-icon-sm {
      width: 30px;
      height: 30px;
      border-radius: 6px;
      border: 1px solid var(--color-gray-200);
      background: white;
      color: var(--color-gray-600);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-icon-sm:hover {
      background: var(--color-gray-50);
      color: var(--color-primary);
      border-color: var(--color-primary-border);
    }

    .btn-icon-sm.delete:hover {
      background: #fef2f2;
      color: #b42318;
      border-color: #fecaca;
    }

    /* Footer */
    .form-footer {
      padding: 1.25rem 2rem;
      border-top: 1px solid var(--color-gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-right { display: flex; gap: 0.75rem; }

    .btn-prev, .btn-next, .btn-submit {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border: none;
    }

    .btn-prev { background: white; border: 1px solid var(--color-gray-300); color: var(--color-gray-700); }
    .btn-next { background: var(--color-primary); color: white; }
    .btn-submit { background: var(--color-success); color: white; }

    .btn-prev:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Responsive */
    @media (max-width: 900px) {
      .stepper-sidebar { display: none; }
    }

    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
      .academic-fields { flex-direction: column; }
      .form-header, .form-body, .form-footer { padding: 1rem; }
    }

    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .spinner {
      animation: rotate 2s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .validation-error {
      color: var(--color-error);
      font-size: 0.75rem;
      margin-top: 4px;
      font-weight: 500;
    }
  `]


})
export class StudentFormComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  notificationService = inject(NotificationService);
  studentService = inject(StudentService);
  countryService = inject(CountryService);
  authService = inject(AuthService);
  branchService = inject(BranchService);

  @Input() studentId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  isEdit = false;
  currentStep = 1;

  // New State
  countryCodes: CountryMobileCode[] = [];
  selectedCountry: CountryMobileCode | null = null;
  isCountryDropdownOpen = false;
  countries: Country[] = [];
  universities: University[] = [];
  passingYears: number[] = [];
  submitting = false;
  submitted = false;
  deletedSlots = new Set<string>();

  currentUser: any;
  isAdmin = false;
  branches: any[] = [];
  counsellors: any[] = [];

  get isStaff(): boolean {
    const role = this.currentUser?.role?.toUpperCase();
    return ['ADMIN', 'MANAGER', 'EMPLOYEE', 'BRANCH_PARTNER'].includes(role);
  }

  get isPartner(): boolean {
    const role = this.currentUser?.role?.toUpperCase();
    return ['REFERRAL', 'COMPANY'].includes(role);
  }

  get isBranchMandatory(): boolean {
    return this.isStaff;
  }

  get showAssignTo(): boolean {
    return this.isStaff;
  }

  documentList = [
    { key: 'passport', label: 'Passport (Full Copy)' },
    { key: '10th_marksheet', label: '10th Marksheet' },
    { key: '12th_marksheet', label: '12th Marksheet' },
    { key: 'birth_certificate', label: 'Birth Certificate' },
    { key: 'police_clearance', label: 'Police Clearance (PCC)' },
    { key: 'bank_statement', label: 'Bank Statement (6 Months)' },
    { key: 'insurance_document', label: 'Insurance Document' },
    { key: 'neet_scorecard', label: 'NEET Scorecard' }
  ];

  student: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dialCode: '+91',
    status: 'Lead',
    branchId: '',
    assignedToId: '',
    countryId: '',
    universityId: '',
    course: '',
    intake: '',
    academicHistory: [
      {
        level: '10th',
        institutionName: '',
        passingYear: '',
        scoreCgpa: ''
      },
      {
        level: '12th',
        institutionName: '',
        passingYear: '',
        scoreCgpa: ''
      }
    ],
    documents: {}
  };

  setStep(step: number) {
    if (this.isStepValid(this.currentStep) || step < this.currentStep) {
      this.currentStep = step;
    }
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'Personal Information';
      case 2: return 'Destination Details';
      case 3: return 'Academic History';
      case 4: return 'Documents & Uploads';
      default: return '';
    }
  }

  isStepValid(step: number = this.currentStep): boolean {
    switch (step) {
      case 1: return this.isPersonalValid();
      case 2: return this.isDestinationValid();
      case 3: return this.isAcademicValid();
      case 4: return this.isDocumentsValid();
      default: return true;
    }
  }

  onGenericFileUpload(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const emptySlot = this.documentList.find(doc => !this.student.documents[doc.key]);
        const key = emptySlot ? emptySlot.key : `other_${Date.now()}_${i}`;

        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const base64Content = base64.split(',')[1];
          this.student.documents[key] = base64Content;

          if (!this.student.fileMetadata) this.student.fileMetadata = {};
          this.student.fileMetadata[key] = {
            name: file.name,
            size: file.size,
            type: file.type
          };
        };
        reader.readAsDataURL(file);
      }
    }
  }

  nextStep() {
    this.submitted = true;
    if (!this.isStepValid()) {
      this.notificationService.error('Please fill all required fields correctly.');
      return;
    }
    this.submitted = false;
    if (this.currentStep < 4) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  onFileChange(event: any, docKey: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // The API expects the raw base64 content, usually removing the data:image/png;base64, prefix
        const base64Content = base64.split(',')[1];
        this.student.documents[docKey] = base64Content;

        // Also keep track of metadata for UI
        if (!this.student.fileMetadata) this.student.fileMetadata = {};
        this.student.fileMetadata[docKey] = {
          name: file.name,
          size: file.size,
          type: file.type
        };
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(docKey: string) {
    delete this.student.documents[docKey];
    this.deletedSlots.add(docKey);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileKeys(): string[] {
    return Object.keys(this.student.documents);
  }

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('image')) return 'image';
    if (type.includes('sheet') || type.includes('excel')) return 'table_view';
    return 'description';
  }

  downloadFile(docKey: string) {
    const base64 = this.student.documents[docKey];
    const metadata = this.student.fileMetadata?.[docKey];

    if (!base64 || base64.length < 10) {
      this.notificationService.showModal('Error', 'File unavailable', 'This document has no valid content. Please re-upload.');
      return;
    }

    const raw = base64.includes(',') ? base64.split(',')[1] : base64;

    // ✅ Validate base64 before attempting decode
    const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(raw.replace(/\s/g, ''));
    if (!isValidBase64) {
      this.notificationService.showModal('Error', 'Corrupted file', 'This document could not be decoded. Please re-upload.');
      return;
    }

    const mimeType = metadata?.type || this.detectMimeType(raw);
    const ext = this.getExtensionByMimeType(mimeType);
    const fileName = metadata?.name || `${this.formatDocLabel(docKey)}.${ext}`;

    try {
      const blob = this.base64ToBlob(raw, mimeType);

      // ✅ Check blob actually has content
      if (blob.size === 0) {
        this.notificationService.showModal('Error', 'Empty file', 'This document appears to be empty. Please re-upload.');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error(`[downloadFile] Failed for ${docKey}:`, error);
      this.notificationService.showModal('Error', 'Download failed', 'Could not download this file. Please re-upload.');
    }
  }

  private getExtensionByMimeType(mime: string): string {
    const map: { [key: string]: string } = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'application/pdf': 'pdf',
      'application/zip': 'zip',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/msword': 'doc',
      'application/vnd.ms-excel': 'xls',
      'text/plain': 'txt',
      'text/csv': 'csv',
      'application/json': 'json',
    };
    return map[mime] ?? 'bin';
  }

  viewFile(docKey: string) {
    console.log(`[viewFile] docKey: ${docKey}`);
    const base64 = this.student.documents[docKey];
    const metadata = this.student.fileMetadata?.[docKey];

    if (!base64) {
      console.warn(`[viewFile] No base64 data found for key: ${docKey}`);
      return;
    }

    const mimeType = metadata?.type || this.detectMimeType(base64);
    console.log(`[viewFile] mimeType: ${mimeType}, base64Length: ${base64.length}`);

    try {
      const blob = this.base64ToBlob(base64, mimeType);
      const url = URL.createObjectURL(blob);
      console.log(`[viewFile] Blob URL created: ${url}`);
      window.open(url, '_blank');
    } catch (error) {
      console.error(`[viewFile] Failed for ${docKey}:`, error);
    }
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    // Always strip data URL prefix before passing to atob
    const raw = base64.includes(',') ? base64.split(',')[1] : base64;
    try {
      const byteCharacters = atob(raw);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      return new Blob([byteArray], { type: mimeType });
    } catch (e) {
      console.error('base64ToBlob failed:', e);
      return new Blob([], { type: mimeType });
    }
  }

  isPersonalValid(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isEmailValid = !this.student.email || emailRegex.test(this.student.email);
    return !!(
      this.student.firstName &&
      this.student.lastName &&
      isEmailValid &&
      this.student.phone &&
      this.student.phone.length === this.selectedCountry?.mobileNumberLength &&
      (!this.isBranchMandatory || !!this.student.branchId)
    );
  }

  isDestinationValid(): boolean {
    return true;
  }

  isAcademicValid(): boolean {
    return true;
  }

  isDocumentsValid(): boolean {
    return true;
  }

  private mapAcademicHistory(histories: any[]): any[] {
    if (!histories || histories.length === 0) {
      return [
        { level: '10th', institutionName: '', passingYear: '', scoreCgpa: '' },
        { level: '12th', institutionName: '', passingYear: '', scoreCgpa: '' }
      ];
    }
    return histories.map(h => ({
      level: h.qualification?.replace(' Standard', '') || h.level || '',
      institutionName: h.institutionName || h.institution_name || '',
      passingYear: h.passingYear?.toString() || h.passing_year?.toString() || '',
      scoreCgpa: h.score || h.scoreCgpa || ''
    }));
  }

  private normalizeDocKey(key: string): string {
    const mapping: { [key: string]: string } = {
      '10th': '10th_marksheet',
      '12th': '12th_marksheet',
      'birthCertificate': 'birth_certificate',
      'policeClearance': 'police_clearance',
      'bankStatement': 'bank_statement',
      'insurance': 'insurance_document',
      'neet': 'neet_scorecard'
    };
    return mapping[key] || key;
  }

  private mapDocuments(docs: any) {
    if (!docs) return;

    const documents: any = {};
    const fileMetadata: any = {};

    if (Array.isArray(docs)) {
      docs.forEach(doc => {
        const rawKey = doc.documentType || doc.type || 'other';
        const key = this.normalizeDocKey(rawKey);

        const base64 = doc.base64Content || doc.fileContent || doc.content || '';
        documents[key] = base64;

        const detectedMime = this.detectMimeType(base64);
        const ext = this.getExtensionByMimeType(detectedMime);

        // ✅ Always build a proper filename with extension
        const fallbackName = `${this.formatDocLabel(key)}.${ext}`;
        const apiName = doc.documentName || doc.fileName || doc.name;
        // If API gives a name but no extension, append one
        const resolvedName = apiName
          ? (apiName.includes('.') ? apiName : `${apiName}.${ext}`)
          : fallbackName;

        fileMetadata[key] = {
          name: resolvedName,
          size: doc.fileSize || doc.size || 0,
          type: doc.fileType || doc.mimeType || detectedMime
        };
      });
      this.student.documents = documents;
      this.student.fileMetadata = fileMetadata;
    } else if (docs && typeof docs === 'object') {
      const normalizedDocs: any = {};
      Object.keys(docs).forEach(k => {
        normalizedDocs[this.normalizeDocKey(k)] = docs[k];
      });
      this.student.documents = normalizedDocs;
    }
  }

  private detectMimeType(base64: string): string {
    if (typeof base64 !== 'string' || base64.length === 0) return 'application/octet-stream';

    const raw = base64.includes(',') ? base64.split(',')[1] : base64;

    try {
      const bytes = atob(raw.substring(0, 16));
      const b = (i: number) => bytes.charCodeAt(i);

      if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4E && b(3) === 0x47) return 'image/png';
      if (b(0) === 0xFF && b(1) === 0xD8 && b(2) === 0xFF) return 'image/jpeg';
      if (b(0) === 0x25 && b(1) === 0x50 && b(2) === 0x44 && b(3) === 0x46) return 'application/pdf';
      if (b(0) === 0x47 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x38) return 'image/gif';
      if (b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46) return 'image/webp';
      if (b(0) === 0x50 && b(1) === 0x4B && b(2) === 0x03 && b(3) === 0x04) return 'application/zip';
      if (b(0) === 0x42 && b(1) === 0x4D) return 'image/bmp';

      // ✅ Detect plain text / markdown / CSV (printable ASCII)
      const sample = bytes.substring(0, 8);
      const isPrintable = [...sample].every(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127);
      if (isPrintable) {
        if (sample.startsWith('#')) return 'text/markdown';
        if (sample.includes(',')) return 'text/csv';
        return 'text/plain';
      }

    } catch (e) { /* fall through */ }

    return 'application/octet-stream';
  }
  checkEmail() {
    if (!this.student.email || this.isEdit) return;

    this.studentService.getStudentByEmail(this.student.email).subscribe({
      next: (data) => {
        if (data && data.email) {
          this.notificationService.success('Existing student found! Data has been auto-populated.');

          const res = data;
          const user = res.user || res;
          
          this.student = {
            ...this.student,
            firstName: user.firstName || res.firstName || res.name?.split(' ')[0] || '',
            lastName: user.lastName || res.lastName || res.name?.split(' ').slice(1).join(' ') || '',
            phone: user.phone || res.phone || '',
            email: user.email || res.email || '',
            countryId: res.destinationCountryId || res.countryId || res.country?.id || user.destinationCountryId || user.countryId || user.country?.id || '',
            universityId: res.targetUniversityId || res.universityId || res.university?.id || user.targetUniversityId || user.universityId || user.university?.id || '',
            branchId: res.branchId || res.branch?.id || user.branchId || user.branch?.id || '',
            assignedToId: res.assignedToId || res.assignedTo?.id || res.assignedBy?.id || user.assignedToId || user.assignedTo?.id || user.assignedBy?.id || '',
            course: res.courseName || res.course || user.courseName || user.course || '',
            intake: res.intakePeriod || res.intake || user.intakePeriod || user.intake || '',
            academicHistory: this.mapAcademicHistory(res.academicHistories || res.academicHistory || user.academicHistories || user.academicHistory)
          };

          this.mapDocuments(res.documents || user.documents);

          if (this.student.countryId) {
            this.loadUniversities(this.student.countryId);
          }

          // Extract dial code
          if (res.mobileCountryCodeId) {
            const matched = this.countryCodes.find(c => c.id === res.mobileCountryCodeId);
            if (matched) {
              this.selectedCountry = matched;
              this.student.dialCode = matched.mobileCode;
              if (this.student.phone?.startsWith(matched.mobileCode)) {
                this.student.phone = this.student.phone.substring(matched.mobileCode.length);
              }
            }
          } else if (this.student.phone?.startsWith('+')) {
            const matched = this.countryCodes.find(c => this.student.phone.startsWith(c.mobileCode));
            if (matched) {
              this.selectedCountry = matched;
              this.student.dialCode = matched.mobileCode;
              this.student.phone = this.student.phone.substring(matched.mobileCode.length);
            }
          }
        }
      },
      error: (err) => console.error('Error checking email:', err)
    });
  }

  ngOnInit() {
    this.loadInitialData().subscribe(() => {
      if (this.studentId) {
        this.isEdit = true;
        this.studentService.getStudentById(this.studentId).subscribe({
          next: (res) => {
            const resData = res;
            const userData = res.user || res;
            
            console.log('[StudentForm] API Data:', resData);
            
            this.student = {
              ...this.student, // Keep defaults
              ...resData,
              ...userData,
              firstName: userData.firstName || resData.firstName || resData.name?.split(' ')[0] || '',
              lastName: userData.lastName || resData.lastName || resData.name?.split(' ').slice(1).join(' ') || '',
              countryId: resData.destinationCountryId || resData.countryId || resData.country?.id || userData.destinationCountryId || userData.countryId || userData.country?.id || '',
              universityId: resData.targetUniversityId || resData.universityId || resData.university?.id || userData.targetUniversityId || userData.universityId || userData.university?.id || '',
              branchId: resData.branchId || resData.branch?.id || userData.branchId || userData.branch?.id || '',
              assignedToId: resData.assignedToId || resData.assignedTo?.id || resData.assignedBy?.id || userData.assignedToId || userData.assignedTo?.id || userData.assignedBy?.id || '',
              course: resData.courseName || resData.course || userData.courseName || userData.course || '',
              intake: resData.intakePeriod || resData.intake || userData.intakePeriod || userData.intake || '',
              academicHistory: this.mapAcademicHistory(resData.academicHistories || resData.academicHistory || userData.academicHistories || userData.academicHistory)
            };

            this.mapDocuments(resData.documents || userData.documents);

            if (this.student.countryId) {
              this.loadUniversities(this.student.countryId);
            }

            if (this.student.branchId) {
              this.loadCounsellors(this.student.branchId);
            }

            // Handle dial code extraction
            if (resData.mobileCountryCodeId || userData.mobileCountryCodeId) {
              const mId = resData.mobileCountryCodeId || userData.mobileCountryCodeId;
              const matched = this.countryCodes.find(c => c.id === mId);
              if (matched) {
                this.selectedCountry = matched;
                this.student.dialCode = matched.mobileCode;
                if (this.student.phone?.startsWith(matched.mobileCode)) {
                  this.student.phone = this.student.phone.substring(matched.mobileCode.length);
                }
              }
            } else if (this.student.phone?.startsWith('+')) {
              const matched = this.countryCodes.find(c => this.student.phone.startsWith(c.mobileCode));
              if (matched) {
                this.selectedCountry = matched;
                this.student.dialCode = matched.mobileCode;
                this.student.phone = this.student.phone.substring(matched.mobileCode.length);
              }
            }
          },
          error: (err) => {
            this.notificationService.showModal('Error', 'Could not fetch student details', 'Please try again later.');
            this.close.emit();
          }
        });
      }
    });
  }

  loadInitialData(): Observable<any> {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1990; i--) {
      this.passingYears.push(i);
    }

    this.currentUser = this.authService.currentUserValue;
    this.isAdmin = this.currentUser?.role?.toUpperCase() === 'ADMIN';

    const requests: Observable<any>[] = [
      this.countryService.getMobileCountryCodes().pipe(
        map(data => {
          this.countryCodes = data;
          const india = this.countryCodes.find(c => c.mobileCode === '+91');
          if (india && !this.selectedCountry) {
            this.selectedCountry = india;
            this.student.dialCode = india.mobileCode;
          }
          return data;
        })
      ),
      this.countryService.getCountries().pipe(
        map(data => {
          this.countries = data;
          return data;
        })
      )
    ];

    // Load branches for everyone as they might need to select it
    requests.push(
      this.branchService.getAllBranches().pipe(
        map(data => {
          this.branches = data;
          return data;
        })
      )
    );

    if (!this.isAdmin) {
      // For non-admin staff, load counsellors for their branch initially
      const branchId = this.currentUser?.branchId || this.currentUser?.branch;
      if (branchId && this.isStaff) {
        this.loadCounsellors(branchId);
      }
    }

    // Load required documents too
    requests.push(
      this.studentService.getRequiredDocuments().pipe(
        map(data => {
          if (data && (data.required || data.additional)) {
            const allDocs = [...(data.required || []), ...(data.additional || [])];
            this.documentList = allDocs.map(docKey => ({
              key: docKey,
              label: this.formatDocLabel(docKey)
            }));
          }
          return data;
        })
      )
    );

    return forkJoin(requests);
  }

  loadRequiredDocuments() {
    this.studentService.getRequiredDocuments().subscribe({
      next: (data) => {
        if (data && (data.required || data.additional)) {
          // Update document list dynamically based on API
          const allDocs = [...(data.required || []), ...(data.additional || [])];
          this.documentList = allDocs.map(docKey => ({
            key: docKey,
            label: this.formatDocLabel(docKey)
          }));
        }
      }
    });
  }

  formatDocLabel(key: string): string {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  onCountryChange() {
    this.student.universityId = '';
    this.universities = [];
    if (this.student.countryId) {
      this.loadUniversities(this.student.countryId);
    }
  }

  loadUniversities(countryId: number | string) {
    this.countryService.getUniversitiesByCountryId(countryId).subscribe({
      next: (data) => this.universities = data
    });
  }

  onBranchChange() {
    this.student.assignedToId = '';
    this.counsellors = [];
    if (this.student.branchId) {
      this.loadCounsellors(this.student.branchId);
    }
  }

  loadCounsellors(branchId: string | number) {
    this.studentService.getActiveCounsellors(branchId).subscribe({
      next: (data) => this.counsellors = data,
      error: (err) => console.error('Error loading counsellors:', err)
    });
  }

  toggleCountryDropdown(event: Event) {
    event.stopPropagation();
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }

  selectCountry(country: CountryMobileCode, event: Event) {
    event.stopPropagation();
    this.selectedCountry = country;
    this.student.dialCode = country.mobileCode;
    this.isCountryDropdownOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isCountryDropdownOpen = false;
  }

  isMandatory(record: any): boolean {
    return record.level === '12th' || record.level === '10th';
  }

  addAcademicRecord() {
    const recordCount = this.student.academicHistory.length;
    if (recordCount >= 3) return;

    let nextQualification = '';

    // We already have 12th and 10th by default (index 0 and 1)
    if (recordCount === 2) {
      nextQualification = 'Graduation';
    }

    this.student.academicHistory.push({
      level: nextQualification,
      institutionName: '',
      passingYear: '',
      scoreCgpa: ''
    });
  }

  removeAcademicRecord(index: number) {
    const record = this.student.academicHistory[index];
    if (!this.isMandatory(record) && this.student.academicHistory.length > 1) {
      this.student.academicHistory.splice(index, 1);
    }
  }

  onSubmit() {
    this.submitted = true;
    if (!this.isStepValid()) {
      this.notificationService.error('Please fill all required fields correctly.');
      return;
    }
    if (this.submitting) return;
    this.submitting = true;

    const payload = {
      ...this.student,
      email: this.student.email || null,
      destinationCountryId: this.student.countryId ? Number(this.student.countryId) : null,
      targetUniversityId: this.student.universityId ? Number(this.student.universityId) : null,
      courseName: this.student.course,
      phone: this.student.phone,
      mobileCountryCodeId: this.selectedCountry?.id,
      branchId: this.student.branchId ? Number(this.student.branchId) : (this.currentUser?.branchId || this.currentUser?.branch),
      assignedToId: this.student.assignedToId ? Number(this.student.assignedToId) : null,
    };

    // Remove UI-only fields
    delete (payload as any).dialCode;
    delete (payload as any).countryId;
    delete (payload as any).universityId;
    delete (payload as any).course;
    delete (payload as any).fileMetadata;

    this.studentService.onboardStudent(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.notificationService.showModal(
          this.isEdit ? 'Student Updated!' : 'Onboarding Successful!',
          this.isEdit ? 'The student record has been successfully updated.' : 'Student onboarded successfully. Credentials have been sent to email.',
          'Database has been synchronized.'
        );
        this.success.emit();
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error in onboarding:', err);
        this.notificationService.showModal('Error', 'Onboarding Failed', err.error?.message || 'Please check all fields and try again.');
      }
    });
  }
}
