import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RoleConfigService } from '../../../../core/services/role-config.service';

@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">{{ roleConfig.getRoleSpecificTitle('Media & Documents') }}</h1>
          <p class="page-subtitle">{{ getRoleSpecificSubtitle() }}</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher">
            <button class="switcher-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="List View">
              <span class="material-icons">list</span>
              <span>List</span>
            </button>
            <button class="switcher-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Grid View">
              <span class="material-icons">grid_view</span>
              <span>Grid</span>
            </button>
          </div>
          <button class="btn btn-primary" (click)="uploadMedia()">
            <span class="material-icons">cloud_upload</span>
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      <!-- Stats row for media -->
      <div class="stats-grid">
        <div class="stat-mini-card">
          <span class="label">Total Files</span>
          <span class="value">{{ mediaFiles.length }}</span>
        </div>
        <div class="stat-mini-card">
          <span class="label">Storage Used</span>
          <span class="value orange">{{ totalStorageUsed }}</span>
        </div>
        <div class="stat-mini-card">
          <span class="label">This Month</span>
          <span class="value">{{ thisMonthUploads }}</span>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search by filename or type..." [(ngModel)]="searchQuery">
        </div>
        <div class="filter-actions">
          <select class="filter-select" [(ngModel)]="filterType">
            <option value="">All Types</option>
            <option value="Image">Images</option>
            <option value="Document">Documents</option>
            <option value="Video">Videos</option>
            <option value="Audio">Audio</option>
            <option value="Other">Other</option>
          </select>
          <select class="filter-select" [(ngModel)]="filterCategory">
            <option value="">All Categories</option>
            <option value="Student Docs">Student Documents</option>
            <option value="Marketing">Marketing</option>
            <option value="Training">Training</option>
            <option value="Legal">Legal</option>
          </select>
          <button class="btn-icon-secondary" [class.active]="showAdvancedFilters" (click)="showAdvancedFilters = !showAdvancedFilters" title="Advanced Filters">
            <span class="material-icons">tune</span>
          </button>
        </div>
      </div>

      <!-- Advanced Filters Panel -->
      <div class="advanced-filters-panel" [class.show]="showAdvancedFilters">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Upload Date From</label>
            <input type="date" [(ngModel)]="filterDateFrom">
          </div>
          <div class="filter-group">
            <label>Upload Date To</label>
            <input type="date" [(ngModel)]="filterDateTo">
          </div>
          <div class="filter-group">
            <label>File Size</label>
            <select [(ngModel)]="filterSize">
              <option value="">All Sizes</option>
              <option value="small">&lt; 1MB</option>
              <option value="medium">1MB - 10MB</option>
              <option value="large">&gt; 10MB</option>
            </select>
          </div>
          <div class="filter-group">
            <button class="btn-ghost-sm" (click)="resetFilters()">Reset All Filters</button>
          </div>
        </div>
      </div>

      <app-empty-state 
        *ngIf="filteredMedia.length === 0"
        title="No Media Files Found"
        message="There are currently no media files matching your criteria. Upload your first media file to get started."
        [showAction]="true"
        actionText="Upload Media"
        (actionClick)="uploadMedia()">
      </app-empty-state>

      <!-- List View -->
      <div class="table-card" *ngIf="filteredMedia.length > 0 && viewMode === 'list'">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th style="width: 40px;"><input type="checkbox"></th>
                <th>File</th>
                <th>Type</th>
                <th>Category</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Upload Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let media of filteredMedia" class="clickable-row">
                <td><input type="checkbox"></td>
                <td>
                  <div class="entity-meta">
                    <div class="file-icon" [ngClass]="getFileIconClass(media.type)">
                      <span class="material-icons">{{ getFileIcon(media.type) }}</span>
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ media.name }}</span>
                      <span class="entity-subtext">{{ media.description }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-status" [ngClass]="getTypeBadgeClass(media.type)">
                    {{ media.type }}
                  </span>
                </td>
                <td>
                  <span class="badge-status gray">{{ media.category }}</span>
                </td>
                <td>{{ media.size }}</td>
                <td>{{ media.uploadedBy }}</td>
                <td>{{ media.uploadDate }}</td>
                <td style="text-align: right;">
                  <div class="action-btns" (click)="$event.stopPropagation()">
                    <button class="btn-icon" (click)="downloadMedia(media.id)" title="Download">
                      <span class="material-icons">download</span>
                    </button>
                    <button class="btn-icon" (click)="previewMedia(media.id)" title="Preview">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button class="btn-icon" (click)="shareMedia(media.id)" title="Share">
                      <span class="material-icons">share</span>
                    </button>
                    <button class="btn-icon" style="color: var(--color-error);" (click)="deleteMedia(media.id)" title="Delete">
                      <span class="material-icons">delete_outline</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Grid View -->
      <div class="grid-container" *ngIf="filteredMedia.length > 0 && viewMode === 'grid'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        <div class="table-card" *ngFor="let media of filteredMedia | slice:0:displayedCardsCount" style="cursor: pointer; padding: 1.25rem; transition: all 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div class="file-icon" [ngClass]="getFileIconClass(media.type)" style="width: 48px; height: 48px;">
              <span class="material-icons">{{ getFileIcon(media.type) }}</span>
            </div>
            <span class="badge-status" [ngClass]="getTypeBadgeClass(media.type)">{{ media.type }}</span>
          </div>
          
          <div style="margin-bottom: 1rem;">
            <div class="entity-name" style="font-weight: 600; margin-bottom: 0.25rem;">{{ media.name }}</div>
            <div class="entity-subtext" style="font-size: 0.8125rem; line-height: 1.4;">{{ media.description }}</div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; padding: 1rem; background: var(--color-gray-50); border-radius: 8px;">
            <div class="entity-info">
              <span class="entity-subtext">Size</span>
              <span class="entity-name" style="font-size: 0.8125rem;">{{ media.size }}</span>
            </div>
            <div class="entity-info">
              <span class="entity-subtext">Category</span>
              <span class="badge-status gray" style="align-self: flex-start; margin-top: 2px; font-size: 0.75rem;">{{ media.category }}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
            <span class="entity-subtext" style="font-size: 0.75rem;">{{ media.uploadDate }}</span>
            <div class="action-btns" (click)="$event.stopPropagation()">
              <button class="btn-icon" (click)="downloadMedia(media.id)" title="Download">
                <span class="material-icons">download</span>
              </button>
              <button class="btn-icon" (click)="previewMedia(media.id)" title="Preview">
                <span class="material-icons">visibility</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div *ngIf="filteredMedia.length > displayedCardsCount" style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 1rem;">
          <button class="btn btn-secondary" (click)="loadMoreCards()">
            <span>Load More Files</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-mini-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--color-gray-200); display: flex; flex-direction: column; gap: 0.5rem; box-shadow: var(--shadow-sm); }
    .stat-mini-card .label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-gray-500); letter-spacing: 0.05em; }
    .stat-mini-card .value { font-size: 1.75rem; font-weight: 700; color: var(--color-gray-900); }
    .stat-mini-card .value.orange { color: #f79009; }
    .file-icon { 
      width: 40px; 
      height: 40px; 
      border-radius: 8px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 20px;
    }
    .file-icon.image { background: #fef3c7; color: #f59e0b; }
    .file-icon.document { background: #dbeafe; color: #3b82f6; }
    .file-icon.video { background: #fce7f3; color: #ec4899; }
    .file-icon.audio { background: #d1fae5; color: #10b981; }
    .file-icon.other { background: #f3f4f6; color: #6b7280; }
  `]
})
export class MediaListComponent {
  router = inject(Router);
  roleConfig = inject(RoleConfigService);
  searchQuery = '';
  filterType = '';
  filterCategory = '';
  filterSize = '';
  filterDateFrom = '';
  filterDateTo = '';
  showAdvancedFilters = false;
  viewMode: 'list' | 'grid' = 'grid';
  displayedCardsCount = 12;

  loadMoreCards() {
    this.displayedCardsCount += 12;
  }

  getRoleSpecificSubtitle(): string {
    const role = this.roleConfig.getCurrentUserRole();
    switch (role) {
      case 'ADMIN':
        return 'Manage documents, images, videos, and other media files.';
      case 'MANAGER':
        return 'Manage media files for your branch.';
      case 'COMPANY':
        return 'Manage media files for your company.';
      case 'REFERRAL':
        return 'Manage your referral-related media files.';
      default:
        return 'Manage media and documents.';
    }
  }

  mediaFiles = [
    { id: 'MD1001', name: 'Student Application Form.pdf', type: 'Document', category: 'Student Docs', size: '2.4 MB', uploadedBy: 'Admin', uploadDate: '15 Apr 2024', description: 'Standard student application template' },
    { id: 'MD1002', name: 'University Campus Tour.mp4', type: 'Video', category: 'Marketing', size: '156 MB', uploadedBy: 'Rohan Gupta', uploadDate: '14 Apr 2024', description: 'Virtual campus tour video' },
    { id: 'MD1003', name: 'Company Logo.png', type: 'Image', category: 'Marketing', size: '45 KB', uploadedBy: 'Siddharth Patel', uploadDate: '13 Apr 2024', description: 'Official company logo' },
    { id: 'MD1004', name: 'Training Manual.pdf', type: 'Document', category: 'Training', size: '8.7 MB', uploadedBy: 'Admin', uploadDate: '12 Apr 2024', description: 'Employee training manual' },
    { id: 'MD1005', name: 'Podcast Episode 1.mp3', type: 'Audio', category: 'Marketing', size: '23 MB', uploadedBy: 'Rohan Gupta', uploadDate: '11 Apr 2024', description: 'Educational podcast episode' },
    { id: 'MD1006', name: 'Legal Agreement.docx', type: 'Document', category: 'Legal', size: '124 KB', uploadedBy: 'Admin', uploadDate: '10 Apr 2024', description: 'Standard legal agreement template' },
    { id: 'MD1007', name: 'Student Photo.jpg', type: 'Image', category: 'Student Docs', size: '2.1 MB', uploadedBy: 'Siddharth Patel', uploadDate: '09 Apr 2024', description: 'Student passport photo' },
    { id: 'MD1008', name: 'Promotional Video.mov', type: 'Video', category: 'Marketing', size: '89 MB', uploadedBy: 'Rohan Gupta', uploadDate: '08 Apr 2024', description: 'Marketing promotional video' }
  ];

  get totalStorageUsed(): string {
    const totalMB = this.mediaFiles.reduce((total, file) => {
      const size = parseFloat(file.size);
      return total + size;
    }, 0);
    
    if (totalMB < 1024) {
      return `${totalMB.toFixed(1)} MB`;
    } else {
      return `${(totalMB / 1024).toFixed(1)} GB`;
    }
  }

  get thisMonthUploads(): number {
    // This is a simplified calculation - in real app, would check actual dates
    return this.mediaFiles.filter(file => file.uploadDate.includes('Apr')).length;
  }

  get filteredMedia() {
    return this.mediaFiles.filter(media => {
      const matchesSearch = !this.searchQuery || 
        media.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        media.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesType = !this.filterType || media.type === this.filterType;
      const matchesCategory = !this.filterCategory || media.category === this.filterCategory;
      
      let matchesSize = true;
      if (this.filterSize) {
        const size = parseFloat(media.size);
        switch (this.filterSize) {
          case 'small':
            matchesSize = size < 1;
            break;
          case 'medium':
            matchesSize = size >= 1 && size <= 10;
            break;
          case 'large':
            matchesSize = size > 10;
            break;
        }
      }
      
      return matchesSearch && matchesType && matchesCategory && matchesSize;
    });
  }

  uploadMedia() {
    console.log('Upload new media file');
  }

  downloadMedia(id: string) {
    console.log('Download media:', id);
  }

  previewMedia(id: string) {
    console.log('Preview media:', id);
  }

  shareMedia(id: string) {
    console.log('Share media:', id);
  }

  deleteMedia(id: string) {
    console.log('Delete media:', id);
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterType = '';
    this.filterCategory = '';
    this.filterSize = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
  }

  getFileIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'image': return 'image';
      case 'document': return 'description';
      case 'video': return 'videocam';
      case 'audio': return 'audio_file';
      default: return 'insert_drive_file';
    }
  }

  getFileIconClass(type: string): string {
    return type.toLowerCase();
  }

  getTypeBadgeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'image': return 'warning';
      case 'document': return 'primary';
      case 'video': return 'error';
      case 'audio': return 'success';
      default: return 'gray';
    }
  }
}
