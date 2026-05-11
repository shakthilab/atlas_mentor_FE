import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-document-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">Document Repository</h1>
          <p class="page-subtitle">Centralized access to all student and institutional documents.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary">
            <span class="material-icons">cloud_upload</span>
            Bulk Upload
          </button>
        </div>
      </div>

      <div class="main-layout">
        <!-- Sidebar Folders -->
        <div class="doc-sidebar shadow-smooth">
          <div class="sidebar-section">
            <h4 class="section-title">Files</h4>
            <div class="nav-item active">
              <span class="material-icons">folder</span>
              <span>All Documents</span>
            </div>
            <div class="nav-item">
              <span class="material-icons">verified_user</span>
              <span>Verified Fies</span>
            </div>
            <div class="nav-item">
              <span class="material-icons">pending_actions</span>
              <span>Pending Review</span>
            </div>
          </div>
          
          <div class="sidebar-section mt-1">
            <h4 class="section-title">Categories</h4>
             <div class="nav-item">
              <span class="material-icons">description</span>
              <span>Academic Records</span>
            </div>
            <div class="nav-item">
              <span class="material-icons">badge</span>
              <span>Identity Docs</span>
            </div>
            <div class="nav-item">
              <span class="material-icons">receipt</span>
              <span>Financial Docs</span>
            </div>
          </div>
        </div>

        <!-- Document List -->
        <div class="doc-content">
          <div class="content-header">
             <div class="search-bar">
                <span class="material-icons">search</span>
                <input type="text" placeholder="Search files, student names..." [(ngModel)]="searchQuery">
             </div>
             <div class="view-actions">
                <button class="btn-icon circle active"><span class="material-icons">grid_view</span></button>
                <button class="btn-icon circle"><span class="material-icons">list</span></button>
             </div>
          </div>

          <app-empty-state 
            *ngIf="files.length === 0"
            title="No Documents Found"
            message="There are currently no documents uploaded. Upload your first document to get started."
            [showAction]="true"
            actionText="Upload Document"
            actionIcon="cloud_upload">
          </app-empty-state>

          <div class="file-grid" *ngIf="files.length > 0">
            <div class="file-card" *ngFor="let file of files">
              <div class="file-preview">
                <span class="material-icons file-icon" [ngClass]="file.type">{{ getIcon(file.type) }}</span>
                <div class="file-actions-overlay">
                   <button class="btn-action"><span class="material-icons">visibility</span></button>
                   <button class="btn-action"><span class="material-icons">download</span></button>
                </div>
              </div>
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <div class="file-meta">
                  <span class="student-link">{{ file.student }}</span>
                  <span class="dot"></span>
                  <span class="size">{{ file.size }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
   
   
   
   




    .main-layout { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; }
    
    .doc-sidebar { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); padding: 0.75rem; align-self: start; box-shadow: var(--shadow-sm); }
    .sidebar-section { display: flex; flex-direction: column; gap: 0.25rem; }
    .section-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-gray-500); padding: 0.5rem 0.875rem; letter-spacing: 0.05em; }
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.875rem; border-radius: var(--radius-md); cursor: pointer; color: var(--color-gray-700); font-size: 0.875rem; font-weight: 600; transition: all var(--transition-fast); }
    .nav-item .material-icons { font-size: 20px; color: var(--color-gray-400); }
    .nav-item:hover { background: var(--color-gray-50); color: var(--color-gray-900); }
    .nav-item.active { background: var(--color-primary-light); color: var(--color-primary); }
    .nav-item.active .material-icons { color: var(--color-primary); }

    .doc-content { display: flex; flex-direction: column; gap: 1.5rem; }
    .content-header { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; }
   
   
   
    .search-bar .material-icons { color: var(--color-gray-400); font-size: 20px; }
    
    .view-actions { display: flex; background: var(--color-gray-100); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-200); }
    .btn-icon.circle { width: 36px; height: 36px; border-radius: var(--radius-sm); border: none; background: transparent; color: var(--color-gray-500); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); }
    .btn-icon.circle.active { background: white; color: var(--color-gray-700); box-shadow: var(--shadow-sm); }

    .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
    .file-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); overflow: hidden; box-shadow: var(--shadow-sm); transition: all var(--transition-fast); }
    .file-card:hover { border-color: var(--color-primary); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    
    .file-preview { height: 140px; background: var(--color-gray-50); display: flex; align-items: center; justify-content: center; position: relative; border-bottom: 1px solid var(--color-gray-100); }
    .file-icon { font-size: 48px; }
    .file-icon.pdf { color: #d92d20; }
    .file-icon.doc { color: #1570ef; }
    .file-icon.img { color: #f79009; }
    
    .file-actions-overlay { position: absolute; inset: 0; background: rgba(16, 24, 40, 0.4); display: flex; align-items: center; justify-content: center; gap: 0.75rem; opacity: 0; transition: all var(--transition-normal); backdrop-filter: blur(2px); }
    .file-card:hover .file-actions-overlay { opacity: 1; }
    .btn-action { width: 36px; height: 36px; border-radius: 50%; border: none; background: white; color: var(--color-gray-700); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); }
    .btn-action:hover { background: var(--color-primary); color: white; }

    .file-info { padding: 1rem; }
    .file-name { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-meta { display: flex; align-items: center; gap: 6px; margin-top: 4px; font-size: 0.75rem; color: var(--color-gray-500); }
    .student-link { color: var(--color-primary); font-weight: 600; cursor: pointer; }
    .dot { width: 3px; height: 3px; background: var(--color-gray-300); border-radius: 50%; }

    @media (max-width: 768px) {
      .main-layout { grid-template-columns: 1fr; }
      .doc-sidebar { display: none; }
      .content-header { flex-direction: column; align-items: stretch; }
     
    }
  `]
})
export class DocumentManagerComponent {
  searchQuery = '';
  files = [
    { name: 'Passport_Copy.pdf', type: 'pdf', student: 'Mukul Sharma', size: '2.4 MB' },
    { name: 'Academic_Transcripts.pdf', type: 'pdf', student: 'Priya Rai', size: '4.8 MB' },
    { name: 'IELTS_Report.doc', type: 'doc', student: 'Amit Kumar', size: '1.2 MB' },
    { name: 'Photo_ID.img', type: 'img', student: 'Sonal Singh', size: '0.8 MB' },
    { name: 'Financial_Proof.pdf', type: 'pdf', student: 'Mukul Sharma', size: '3.1 MB' },
    { name: 'Recommendation_Letter.pdf', type: 'pdf', student: 'Rahul Roy', size: '0.5 MB' }
  ];

  getIcon(type: string) {
    switch(type) {
      case 'pdf': return 'picture_as_pdf';
      case 'img': return 'image';
      default: return 'description';
    }
  }
}
