import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RoleConfigService } from '../../../../core/services/role-config.service';
import { ReferralResourceService } from '../../../../core/services/referral-resource.service';
import { ReferralResource } from '../../../../core/models/referral-resource.model';

@Component({
  selector: 'app-media-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">{{ roleConfig.getRoleSpecificTitle('Media & Resources') }}</h1>
          <p class="page-subtitle">{{ getRoleSpecificSubtitle() }}</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher">
            <button class="switcher-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Grid View">
              <span class="material-icons">grid_view</span>
              <span>Grid</span>
            </button>
            <button class="switcher-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="List View">
              <span class="material-icons">list</span>
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-mini-card">
          <div class="stat-icon-wrap" style="background: #eff6ff; color: #2563eb;">
            <span class="material-icons">folder</span>
          </div>
          <div class="stat-content">
            <span class="label">Total Resources</span>
            <span class="value">{{ resources.length }}</span>
          </div>
        </div>
        <div class="stat-mini-card">
          <div class="stat-icon-wrap" style="background: #ecfdf3; color: #16a34a;">
            <span class="material-icons">check_circle</span>
          </div>
          <div class="stat-content">
            <span class="label">Active Resources</span>
            <span class="value">{{ activeCount }}</span>
          </div>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search resources..." [(ngModel)]="searchQuery">
        </div>
        <div class="filter-actions">
          <select class="filter-select" [(ngModel)]="filterResourceType">
            <option value="">All Types</option>
            <option value="DOCUMENT">Documents</option>
            <option value="IMAGE">Images</option>
            <option value="VIDEO">Videos</option>
            <option value="LINK">Links</option>
          </select>
        </div>
      </div>

      <app-empty-state 
        *ngIf="filteredResources.length === 0 && !isLoading"
        title="No Resources Available"
        message="There are currently no media or resource files shared with you."
        [showAction]="false">
      </app-empty-state>

      <div class="loading-container shadow-premium" *ngIf="isLoading" style="padding: 3rem; text-align: center; background: white; border-radius: 12px; border: 1px solid var(--color-gray-200); margin-bottom: 2rem;">
        <div class="spinner-container" style="display: flex; justify-content: center; margin-bottom: 1rem;">
          <div class="loading-spinner"></div>
        </div>
        <p style="color: var(--color-gray-500);">Fetching your resources...</p>
      </div>

      <!-- Grid View -->
      <div class="grid-container" *ngIf="viewMode === 'grid' && filteredResources.length > 0 && !isLoading">
        <div class="table-card" *ngFor="let res of filteredResources" style="padding: 0; overflow: hidden;" (click)="viewResource(res)">
          <div class="card-preview" [ngClass]="res.resourceType.toLowerCase()" style="height: 140px; display: flex; align-items: center; justify-content: center; position: relative; background: #f8fafc;">
            <span class="material-icons" style="font-size: 48px;">{{ getResourceIcon(res.resourceType) }}</span>
            <div class="card-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center;">
              <span class="material-icons" style="color: white; font-size: 32px; opacity: 0;">visibility</span>
            </div>
          </div>
          
          <div class="card-details" style="padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <h3 style="font-size: 0.9375rem; font-weight: 600; color: var(--color-gray-900); margin: 0; line-height: 1.4;">{{ res.fileName }}</h3>
              <span class="badge-status info" style="font-size: 0.625rem; padding: 2px 6px;">{{ res.resourceType }}</span>
            </div>
            <p style="font-size: 0.8125rem; color: var(--color-gray-500); margin: 0 0 1rem; line-height: 1.5; height: 2.4rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{{ res.description }}</p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="material-icons" style="font-size: 16px; color: var(--color-gray-400);">history</span>
                <span style="font-size: 0.75rem; color: var(--color-gray-500);">{{ res.createdAt | date:'MMM d, y' }}</span>
              </div>
              <button class="btn-icon" style="color: var(--color-primary);">
                <span class="material-icons">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div class="table-card" *ngIf="viewMode === 'list' && filteredResources.length > 0 && !isLoading">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Type</th>
                <th>Shared Date</th>
                <th>Description</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let res of filteredResources" class="clickable-row" (click)="viewResource(res)">
                <td>
                  <div class="entity-meta">
                    <div class="avatar-circle" [style.background]="getAvatarColor(res.resourceType)" style="border-radius: 8px;">
                      <span class="material-icons" style="font-size: 18px;">{{ getResourceIcon(res.resourceType) }}</span>
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ res.fileName }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-status info">{{ res.resourceType }}</span>
                </td>
                <td>{{ res.createdAt | date:'MMM d, y' }}</td>
                <td>
                  <span style="font-size: 0.8125rem; color: var(--color-gray-500); max-width: 300px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ res.description }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-btns">
                    <button class="btn-icon" title="View Resource">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button class="btn-icon" style="color: var(--color-primary);" title="Open External">
                      <span class="material-icons">open_in_new</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; padding: 2.5rem; background: var(--dash-bg-main); min-height: 100vh; }
    


   
   
   

    .table-card:hover .card-preview .card-overlay { opacity: 1 !important; }
    .table-card:hover .card-preview .material-icons { transform: scale(1.1); }

    .card-preview.document { color: #3b82f6; }
    .card-preview.image { color: #f59e0b; }
    .card-preview.video { color: #ef4444; }
    .card-preview.link { color: #10b981; }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--color-gray-200);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class MediaListComponent implements OnInit {
  router = inject(Router);
  roleConfig = inject(RoleConfigService);
  resourceService = inject(ReferralResourceService);

  resources: ReferralResource[] = [];
  isLoading = true;
  searchQuery = '';
  filterResourceType = '';
  viewMode: 'list' | 'grid' = 'grid';

  ngOnInit() {
    this.loadMyResources();
  }

  loadMyResources() {
    this.isLoading = true;
    this.resourceService.getMyResources().subscribe({
      next: (res) => {
        this.resources = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading resources:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredResources() {
    return this.resources.filter(res => {
      const matchesSearch = !this.searchQuery || 
        res.fileName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        res.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesType = !this.filterResourceType || res.resourceType === this.filterResourceType;
      
      return matchesSearch && matchesType;
    });
  }

  get activeCount() {
    return this.resources.filter(r => r.isActive).length;
  }

  getResourceIcon(type: string): string {
    switch (type) {
      case 'DOCUMENT': return 'description';
      case 'IMAGE': return 'image';
      case 'VIDEO': return 'videocam';
      case 'LINK': return 'link';
      default: return 'insert_drive_file';
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'DOCUMENT': return 'info';
      case 'IMAGE': return 'warning';
      case 'VIDEO': return 'error';
      case 'LINK': return 'success';
      default: return 'info';
    }
  }

  getAvatarColor(type: string): string {
    switch (type) {
      case 'DOCUMENT': return '#38bdf8';
      case 'IMAGE': return '#fbbf24';
      case 'VIDEO': return '#f87171';
      case 'LINK': return '#34d399';
      default: return '#94a3b8';
    }
  }

  viewResource(resource: ReferralResource) {
    if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank');
    } else {
      console.log('Downloading file:', resource.fileName);
    }
  }

  getRoleSpecificSubtitle(): string {
    const role = this.roleConfig.getCurrentUserRole();
    switch (role) {
      case 'COMPANY':
        return 'Access resources and documents shared with your company.';
      case 'REFERRAL':
        return 'Access resources and documents shared with you as a referral partner.';
      default:
        return 'Access your shared resources and documents.';
    }
  }
}
