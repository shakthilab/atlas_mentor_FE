import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService, Company } from '../../../../core/services/company.service';
import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../core/models/branch.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">Corporate Partners</h1>
          <p class="page-subtitle">Manage university tie-ups and recruitment companies.</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher mr-3">
            <button class="switcher-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="List View">
              <span class="material-icons">list</span>
            </button>
            <button class="switcher-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Card View">
              <span class="material-icons">grid_view</span>
            </button>
          </div>
          <button class="btn btn-primary" (click)="openAddModal()">
            <span class="material-icons">domain_add</span>
            Add Company
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search companies by name..." [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()">
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container shadow-premium" *ngIf="isLoading">
        <div class="spinner-container">
          <div class="loading-spinner"></div>
        </div>
        <p>Loading companies...</p>
      </div>

      <div class="empty-state-container" *ngIf="!isLoading && companies.length === 0">
        <div class="empty-state-content">
          <span class="material-icons empty-icon">domain</span>
          <h3>No Companies Found</h3>
          <p>There are currently no corporate partners found. Add your first company to get started.</p>
        </div>
      </div>

      <!-- Table View -->
      <div class="table-card" *ngIf="!isLoading && companies.length > 0 && viewMode === 'list'">
        <div class="table-card-header">
          <div class="table-header-title">
            <h2>Partners & Agencies</h2>
            <span class="count-badge">{{ totalElements }} total</span>
          </div>
          <button class="btn-icon">
            <span class="material-icons">more_vert</span>
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Website</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let company of companies" class="clickable-row">
                <td>
                  <div class="user-info">
                    <div class="avatar logo-box-small">{{ company.name.charAt(0) }}</div>
                    <div class="details">
                      <span class="name">{{ company.name }}</span>
                      <span class="email">{{ company.email }}</span>
                    </div>
                  </div>
                </td>
                <td><span class="type-badge">{{ company.companyDetails?.industry || company.industry }}</span></td>
                <td>
                  <div class="location-td">
                    <span class="material-icons">location_on</span>
                    {{ company.companyDetails?.address || company.address || company.branch?.name || 'No address available' }}
                  </div>
                </td>
                <td><a [href]="company.companyDetails?.website || company.website" target="_blank" class="website-link">{{ company.companyDetails?.website || company.website }}</a></td>
                <td>
                  <span class="status-dot-wrap" [ngClass]="(company.status || 'ACTIVE').toLowerCase()">
                    <span class="status-dot"></span>
                    {{ company.status || 'ACTIVE' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-btns" style="position: relative;">
                    <button class="btn-icon view" (click)="viewDetails(company)" title="View Details"><span class="material-icons">visibility</span></button>
                    <button class="btn-icon" (click)="openEditModal(company)" title="Edit"><span class="material-icons">edit</span></button>
                    <button class="btn-icon" (click)="toggleDropdown($event, 'row-' + company.id)"><span class="material-icons">more_vert</span></button>
                    
                    <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === 'row-' + company.id" (click)="$event.stopPropagation()">
                      <button class="dropdown-item warning" (click)="confirmDeactivate(company); openDropdownId = null" *ngIf="(company.status || 'ACTIVE').toUpperCase() !== 'INACTIVE'">
                        <span class="material-icons" style="font-size: 18px;">block</span>
                        Deactivate
                      </button>
                      <button class="dropdown-item success" (click)="confirmReactivate(company); openDropdownId = null" *ngIf="(company.status || '').toUpperCase() === 'INACTIVE'">
                        <span class="material-icons" style="font-size: 18px;">check_circle</span>
                        Reactivate
                      </button>
                      <div class="dropdown-divider"></div>
                      <button class="dropdown-item danger" (click)="confirmDelete(company); openDropdownId = null">
                        <span class="material-icons" style="font-size: 18px;">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="table-card-footer">
          <button class="pagination-btn" [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)">
            <span class="material-icons">arrow_back</span>
            Previous
          </button>
          
          <div class="pagination-pages">
            <button class="page-num" [class.active]="currentPage === 0" (click)="changePage(0)">1</button>
            <button *ngIf="totalPages > 1" class="page-num" [class.active]="currentPage === 1" (click)="changePage(1)">2</button>
            <button *ngIf="totalPages > 2" class="page-num" [class.active]="currentPage === 2" (click)="changePage(2)">3</button>
            <span *ngIf="totalPages > 5" class="page-dots">...</span>
            <button *ngIf="totalPages > 4" class="page-num" [class.active]="currentPage === totalPages - 1" (click)="changePage(totalPages - 1)">{{ totalPages }}</button>
          </div>

          <button class="pagination-btn" [disabled]="currentPage >= totalPages - 1" (click)="changePage(currentPage + 1)">
            Next
            <span class="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- Company Grid View -->
      <div class="grid-container-wrapper" *ngIf="!isLoading && companies.length > 0 && viewMode === 'grid'">
        <div class="grid-container">
          <div class="referral-card shadow-premium" *ngFor="let company of companies | slice:0:displayedCardsCount">
            <div class="card-header">
              <div class="user-info-grid">
                <div class="avatar">{{ company.name.charAt(0) }}</div>
                <div class="details">
                  <span class="name">{{ company.name }}</span>
                  <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 4px;">
                    <span class="type-badge">{{ company.companyDetails?.industry || company.industry }}</span>
                    <span class="status-dot-wrap" [ngClass]="(company.status || 'ACTIVE').toLowerCase()">
                      <span class="status-dot"></span>
                      {{ company.status || 'ACTIVE' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="action-btns" style="position: relative;">
                <button class="btn-icon" (click)="openEditModal(company)"><span class="material-icons">edit</span></button>
                <button class="btn-icon" (click)="toggleDropdown($event, 'card-' + company.id)">
                  <span class="material-icons">more_vert</span>
                </button>
                
                <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === 'card-' + company.id" (click)="$event.stopPropagation()">
                  <button class="dropdown-item warning" (click)="confirmDeactivate(company); openDropdownId = null" *ngIf="(company.status || 'ACTIVE').toUpperCase() !== 'INACTIVE'">
                    <span class="material-icons" style="font-size: 18px;">block</span>
                    Deactivate
                  </button>
                  <button class="dropdown-item success" (click)="confirmReactivate(company); openDropdownId = null" *ngIf="(company.status || '').toUpperCase() === 'INACTIVE'">
                    <span class="material-icons" style="font-size: 18px;">check_circle</span>
                    Reactivate
                  </button>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item danger" (click)="confirmDelete(company); openDropdownId = null">
                    <span class="material-icons" style="font-size: 18px;">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            </div>
            
            <div class="card-body">
              <div class="metrics-grid">
                <div class="metric-box">
                  <span class="label">Contact Person</span>
                  <span class="value">{{ company.contactPerson || 'Not specified' }}</span>
                </div>
                <div class="metric-box">
                  <span class="label">Phone</span>
                  <span class="value">{{ company.phone }}</span>
                </div>
                <div class="metric-box full">
                  <span class="label">Address</span>
                  <span class="value" style="font-size: 0.85rem; font-weight: 500;">{{ company.companyDetails?.address || company.address || company.branch?.name || 'No address available' }}</span>
                </div>
              </div>
              <div class="contact-item">
                <span class="material-icons">email</span>
                <span>{{ company.email }}</span>
              </div>
              <div class="contact-item" style="margin-top: 0.5rem;" *ngIf="company.website">
                <span class="material-icons">language</span>
                <a [href]="company.website" target="_blank" class="website-link" style="color: var(--color-primary);">{{ company.website }}</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="load-more-container" *ngIf="companies.length > displayedCardsCount">
          <button class="btn btn-secondary load-more-btn" (click)="loadMoreCards()">
            <span>Load More Companies</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>

    <!-- Add/Edit Company Modal -->
    <div class="modal-overlay" *ngIf="showAddModal" (click)="closeAddModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 650px;">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditMode ? 'Edit Company' : 'Add New Company' }}</h2>
          <button class="close-btn" (click)="closeAddModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-subtitle">{{ isEditMode ? 'Update details for the corporate partner.' : 'Enter details for the new corporate partner.' }}</p>
          
          <form #companyForm="ngForm" (ngSubmit)="onSubmitCompany()">
            <div class="form-grid">
              <div class="form-group">
                <label for="compName">Company Name *</label>
                <input type="text" id="compName" name="name" class="form-control" [(ngModel)]="newCompany.name" placeholder="Tech Company Inc" required>
              </div>

              <div class="form-group">
                <label for="compIndustry">Industry *</label>
                <input type="text" id="compIndustry" name="industry" class="form-control" [(ngModel)]="newCompany.industry" placeholder="Technology" required>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="compEmail">Email Address *</label>
                <input type="email" id="compEmail" name="email" class="form-control" [(ngModel)]="newCompany.email" placeholder="contact@company.com" required>
              </div>

              <div class="form-group">
                <label for="compPhone">Phone Number *</label>
                <input type="text" id="compPhone" name="phone" class="form-control" [(ngModel)]="newCompany.phone" placeholder="+1234567890" required>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="compContact">Contact Person *</label>
                <input type="text" id="compContact" name="contactPerson" class="form-control" [(ngModel)]="newCompany.contactPerson" placeholder="John Doe" required>
              </div>

              <div class="form-group">
                <label for="compWebsite">Website *</label>
                <input type="text" id="compWebsite" name="website" class="form-control" [(ngModel)]="newCompany.website" placeholder="https://example.com" required>
              </div>
            </div>

            <div class="form-group">
              <label for="compAddress">Address *</label>
              <textarea id="compAddress" name="address" class="form-control" [(ngModel)]="newCompany.address" placeholder="123 Business St, City, State" required rows="2"></textarea>
            </div>

            <div class="form-group">
              <label for="compBranch">Branch *</label>
              <select id="compBranch" name="branchId" class="form-control" [(ngModel)]="newCompany.branchId" required>
                <option [ngValue]="undefined" disabled selected>Select Branch</option>
                <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
              </select>
            </div>

            <div class="modal-footer" style="padding: 1.5rem 0 0; border-top: 1px solid var(--color-gray-100); margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary" [disabled]="companyForm.invalid || submitting" style="width: 100%; height: 48px; font-size: 1rem;">
                <span *ngIf="!submitting">{{ isEditMode ? 'Save Changes' : 'Create Company' }}</span>
                <span *ngIf="submitting">Processing...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Company Detail Modal -->
    <div class="modal-overlay" *ngIf="showDetailModal" (click)="closeDetailModal()">
      <div class="modal-content detail-modal" (click)="$event.stopPropagation()">
        <div class="modal-header premium-bg">
          <div class="header-content">
            <div class="company-brand">
              <div class="avatar logo-box">{{ selectedCompany?.name?.charAt(0) }}</div>
              <div class="title-wrap">
                <h2 class="modal-title">{{ selectedCompany?.name }}</h2>
                <div class="badges-row">
                  <span class="type-badge">{{ selectedCompany?.companyDetails?.industry }}</span>
                  <span class="status-dot-wrap" [ngClass]="(selectedCompany?.status || 'ACTIVE').toLowerCase()">
                    <span class="status-dot"></span>
                    {{ selectedCompany?.status || 'ACTIVE' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button class="close-btn white" (click)="closeDetailModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-body detail-body">
          <div class="detail-section">
            <h3 class="section-title">General Information</h3>
            <div class="info-grid-modern">
              <div class="info-item">
                <span class="label">Contact Person</span>
                <span class="value">{{ selectedCompany?.companyDetails?.contactPerson }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email Address</span>
                <span class="value">{{ selectedCompany?.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">Phone Number</span>
                <span class="value">{{ selectedCompany?.phone }}</span>
              </div>
              <div class="info-item">
                <span class="label">Website</span>
                <a [href]="selectedCompany?.companyDetails?.website" target="_blank" class="value link">{{ selectedCompany?.companyDetails?.website }}</a>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">Address & Branch</h3>
            <div class="info-grid-modern">
              <div class="info-item full">
                <span class="label">Physical Address</span>
                <span class="value">{{ selectedCompany?.companyDetails?.address }}</span>
              </div>
              <div class="info-item">
                <span class="label">Primary Branch</span>
                <span class="value">{{ selectedCompany?.branch?.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">Branch Location</span>
                <span class="value">{{ selectedCompany?.branch?.location }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">System Details</h3>
            <div class="info-grid-modern">
              <div class="info-item">
                <span class="label">Assigned To ID</span>
                <span class="value">#{{ selectedCompany?.companyDetails?.assignedTo }}</span>
              </div>
              <div class="info-item">
                <span class="label">Verification Status</span>
                <span class="value">
                  <span class="verify-badge" [class.verified]="selectedCompany?.isVerified">
                    <span class="material-icons">{{ selectedCompany?.isVerified ? 'verified' : 'pending' }}</span>
                    {{ selectedCompany?.isVerified ? 'Verified' : 'Unverified' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-primary btn-block" (click)="closeDetailModal()">Close Detailed View</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showConfirmModal" (click)="closeConfirmModal()">
      <div class="modal-content confirm-modal" (click)="$event.stopPropagation()">
        <div class="modal-body text-center" style="padding-top: 2.5rem;">
          <div class="confirm-icon-wrap" [ngClass]="confirmModalBtnClass">
            <span class="material-icons">
              {{ confirmActionType === 'delete' ? 'delete_forever' : 
                 (confirmActionType === 'deactivate' ? 'pause_circle' : 'play_circle') }}
            </span>
          </div>
          <h2 class="modal-title mb-2">{{ confirmModalTitle }}</h2>
          <p class="text-muted mb-4">{{ confirmModalMessage }}</p>
          
          <div class="modal-footer" style="padding: 0; margin-top: 2rem;">
            <button type="button" class="btn btn-block" [ngClass]="confirmModalBtnClass" (click)="executeConfirmAction()" [disabled]="processingAction">
              <span *ngIf="!processingAction">{{ confirmModalBtnText }}</span>
              <span *ngIf="processingAction">Processing...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .module-container { padding-bottom: 2rem; }
    .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .page-subtitle { color: var(--color-gray-600); margin: 0.25rem 0 0; font-size: 1rem; }

    .empty-state-container { padding: 4rem 2rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--color-gray-300); text-align: center; display: flex; justify-content: center; align-items: center; margin-bottom: 2rem; }
    .empty-state-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .empty-icon { font-size: 3rem; color: var(--color-gray-300); margin-bottom: 0.5rem; }
    .empty-state-content h3 { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-800); margin: 0; }
    .empty-state-content p { color: var(--color-gray-500); margin: 0; font-size: 0.875rem; max-width: 300px; }
    
    .filters-card { background: white; padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; box-shadow: var(--shadow-sm); }
    .search-bar { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid var(--color-gray-300); padding: 0.625rem 0.875rem; border-radius: var(--radius-md); flex: 1; box-shadow: var(--shadow-xs); transition: all var(--transition-fast); }
    .search-bar input { background: none; border: none; width: 100%; font-size: 0.95rem; color: var(--color-gray-900); outline: none; }
    
    .premium-table { width: 100%; border-collapse: collapse; table-layout: auto; }
    .premium-table th { text-align: center !important; padding: 0.75rem 1.5rem; font-size: 0.725rem; font-weight: 600; color: var(--color-gray-600); background: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-200); white-space: nowrap; }
    .premium-table td { text-align: center !important; padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-gray-200); font-size: 0.875rem; vertical-align: middle; color: var(--color-gray-600); }
    
    .premium-table th:first-child, .premium-table td:first-child { padding-left: 1.5rem; }
    .premium-table th:last-child, .premium-table td:last-child { padding-right: 1.5rem; }

    .user-info { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; text-align: center; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; border: 1px solid var(--color-primary-border); flex-shrink: 0; }
    .logo-box-small { border-radius: var(--radius-sm); }
    .details { display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.3; }
    .name { font-weight: 600; color: var(--color-gray-900); font-size: 0.875rem; margin-bottom: 2px; }
    .email { font-size: 0.75rem; color: var(--color-gray-500); }
    
    .status-dot-wrap { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; font-weight: 500; padding: 0.125rem 0.5rem; border-radius: 6px; width: fit-content; text-transform: capitalize; margin: 0 auto; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; }
    .status-dot-wrap.active { background: #ecfdf3; color: #027a48; border: 1px solid #abefc6; }
    .status-dot-wrap.active .status-dot { background: #12b76a; }
    .status-dot-wrap.inactive { background: var(--color-gray-100); color: var(--color-gray-700); border: 1px solid var(--color-gray-200); }
    .status-dot-wrap.inactive .status-dot { background: var(--color-gray-500); }

    .type-badge { background: var(--color-gray-100); color: var(--color-gray-700); padding: 0.125rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; border: 1px solid var(--color-gray-200); display: inline-block; }
    
    .location-td { display: flex; align-items: center; justify-content: center; gap: 0.25rem; font-size: 0.875rem; color: var(--color-gray-600); }
    .location-td .material-icons { font-size: 16px; color: var(--color-gray-400); }
    .website-link { color: var(--color-primary); text-decoration: none; font-size: 0.875rem; display: block; text-align: center; }
    .website-link:hover { text-decoration: underline; }

    /* Action Buttons */
    .btn-icon.view { color: var(--color-primary); }
    .btn-icon.view:hover { background: var(--color-primary-light); }

    /* Detail Modal Styles */
    .detail-modal { max-width: 750px !important; overflow: hidden; border: none; }
    .premium-bg { background: linear-gradient(135deg, #667cb0 0%, #4a5d8a 100%); padding: 2rem !important; position: relative; }
    .header-content { display: flex; align-items: center; width: 100%; }
    .company-brand { display: flex; align-items: center; gap: 1.5rem; }
    .logo-box { width: 64px; height: 64px; font-size: 1.5rem; background: rgba(255,255,255,0.2); border: 2px solid white; color: white; border-radius: 12px; }
    .title-wrap h2 { color: white; margin: 0 0 0.5rem; font-size: 1.5rem; }
    .badges-row { display: flex; gap: 0.75rem; align-items: center; }
    .badges-row .type-badge { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3); }
    .badges-row .status-dot-wrap { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3); }
    .close-btn.white { color: white; background: rgba(255,255,255,0.1); }
    .close-btn.white:hover { background: rgba(255,255,255,0.2); }

    .detail-body { padding: 2rem !important; background: #fcfcfd; }
    .detail-section { margin-bottom: 2rem; }
    .detail-section:last-child { margin-bottom: 0; }
    .section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--color-gray-500); margin-bottom: 1rem; font-weight: 700; border-bottom: 1px solid var(--color-gray-100); padding-bottom: 0.5rem; }
    
    .info-grid-modern { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .info-item { display: flex; flex-direction: column; gap: 0.375rem; }
    .info-item.full { grid-column: span 2; }
    .info-item .label { font-size: 0.8125rem; color: var(--color-gray-500); font-weight: 500; }
    .info-item .value { font-size: 0.9375rem; color: var(--color-gray-900); font-weight: 600; }
    .info-item .value.link { color: var(--color-primary); text-decoration: underline; }

    .verify-badge { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-500); }
    .verify-badge.verified { color: #027a48; }
    .verify-badge .material-icons { font-size: 18px; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .action-btns { display: flex; gap: 0.25rem; justify-content: flex-end; }
    .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--color-gray-500); cursor: pointer; border-radius: var(--radius-md); transition: all var(--transition-fast); }
    .btn-icon:hover { background: var(--color-gray-50); color: var(--color-gray-700); }
    .btn-icon .material-icons { font-size: 20px; }

    /* Loading State */
    .loading-container { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 350px; padding: 3rem; box-shadow: var(--shadow-sm); margin-bottom: 2rem; }
    .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-100); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* View Switcher */
    .view-switcher { display: flex; background: var(--color-gray-100); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-200); }
    .switcher-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--color-gray-500); cursor: pointer; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
    .switcher-btn .material-icons { font-size: 20px; }
    .switcher-btn:hover { color: var(--color-gray-700); }
    .switcher-btn.active { background: white; color: var(--color-gray-700); box-shadow: var(--shadow-sm); }

    /* Grid Layout */
    .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .referral-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); overflow: hidden; display: flex; flex-direction: column; transition: all var(--transition-fast); box-shadow: var(--shadow-sm); }
    .referral-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--color-primary); }
    .card-header { padding: 1.25rem; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--color-gray-100); }
    .user-info-grid { display: flex; align-items: center; gap: 0.75rem; }
    .card-body { padding: 1.25rem; flex: 1; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
    .metric-box { background: var(--color-gray-50); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--color-gray-100); display: flex; flex-direction: column; }
    .metric-box.full { grid-column: span 2; }
    .metric-box .label { font-size: 0.7rem; text-transform: uppercase; color: var(--color-gray-500); font-weight: 700; margin-bottom: 4px; }
    .metric-box .value { font-size: 1rem; font-weight: 600; color: var(--color-gray-900); }
    .contact-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--color-gray-600); }
    .contact-item .material-icons { font-size: 18px; color: var(--color-gray-400); }

    .load-more-container { display: flex; justify-content: center; margin-top: 2.5rem; padding-bottom: 1rem; }
    .load-more-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-weight: 600; }

    /* Pagination */
    .pagination-container { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; background: white; padding: 1rem 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); box-shadow: var(--shadow-sm); }
    .pagination-info { font-size: 0.875rem; color: var(--color-gray-600); }
    .pagination-controls { display: flex; align-items: center; gap: 1rem; }
    .page-current { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.875rem; border-radius: var(--radius-md); }

    @media (max-width: 1024px) {
      .header-actions { width: 100%; justify-content: space-between; }
      .module-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .premium-table th:nth-child(3), .premium-table td:nth-child(3) { display: none; }
      .form-grid { grid-template-columns: 1fr; }
    }

    /* Action Dropdown */
    .action-dropdown { position: absolute; right: 0; top: 100%; margin-top: 0.5rem; background: white; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: 0.25rem; min-width: 180px; z-index: 100; animation: fadeIn 0.2s ease-out; box-shadow: var(--shadow-lg); }
    .dropdown-item { width: 100%; text-align: left; background: none; border: none; padding: 0.625rem 1rem; font-size: 0.875rem; color: var(--color-gray-700); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
    .dropdown-item:hover { background: var(--color-gray-50); color: var(--color-gray-900); }
    .dropdown-item.warning { color: #b54708; }
    .dropdown-item.warning:hover { background: #fffaeb; color: #93370d; }
    .dropdown-item.success { color: #027a48; }
    .dropdown-item.success:hover { background: #ecfdf3; color: #026aa2; }
    .dropdown-item.danger { color: #b42318; }
    .dropdown-item.danger:hover { background: #fef3f2; color: #912018; }
    .dropdown-divider { height: 1px; background: var(--color-gray-100); margin: 0.25rem 0; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

    /* Confirm Modal Extras */
    .confirm-icon-wrap { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    .confirm-icon-wrap .material-icons { font-size: 24px; }
    .confirm-icon-wrap.btn-danger { background: #fee4e2; color: #d92d20; border: 8px solid #fef3f2; box-sizing: content-box; }
    .confirm-icon-wrap.btn-warning { background: #fef0c7; color: #dc6803; border: 8px solid #fffaeb; box-sizing: content-box; }
    .confirm-icon-wrap.btn-success { background: #d1fadf; color: #039855; border: 8px solid #ecfdf3; box-sizing: content-box; }
  `]
})
export class CompanyListComponent implements OnInit {
  private companyService = inject(CompanyService);
  private branchService = inject(BranchService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  searchQuery = '';

  companies: Company[] = [];
  branches: Branch[] = [];

  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;

  isLoading = false;
  submitting = false;
  showAddModal = false;
  showDetailModal = false;
  isEditMode = false;
  selectedCompany: Company | null = null;
  openDropdownId: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  private searchSubject = new Subject<string>();

  newCompany: Partial<Company> = {
    name: '',
    email: '',
    phone: '',
    contactPerson: '',
    address: '',
    industry: '',
    website: '',
    branchId: undefined,
    assignedTo: 1
  };

  @HostListener('document:click')
  closeDropdown() {
    this.openDropdownId = null;
  }

  toggleDropdown(event: Event, id: string) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  // --- Confirmation Actions API ---

  showConfirmModal = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalBtnText = '';
  confirmModalBtnClass = '';
  confirmTargetCompany: Company | null = null;
  confirmActionType: 'deactivate' | 'reactivate' | 'delete' | null = null;
  processingAction = false;

  confirmDeactivate(company: Company) {
    this.confirmTargetCompany = company;
    this.confirmActionType = 'deactivate';
    this.confirmModalTitle = 'Deactivate Company';
    this.confirmModalMessage = `Are you sure you want to deactivate ${company.name}? This will mark them as inactive.`;
    this.confirmModalBtnText = 'Deactivate';
    this.confirmModalBtnClass = 'btn-warning';
    this.showConfirmModal = true;
  }

  confirmReactivate(company: Company) {
    this.confirmTargetCompany = company;
    this.confirmActionType = 'reactivate';
    this.confirmModalTitle = 'Reactivate Company';
    this.confirmModalMessage = `Are you sure you want to reactivate ${company.name}? They will be marked as active.`;
    this.confirmModalBtnText = 'Reactivate';
    this.confirmModalBtnClass = 'btn-success';
    this.showConfirmModal = true;
  }

  confirmDelete(company: Company) {
    this.confirmTargetCompany = company;
    this.confirmActionType = 'delete';
    this.confirmModalTitle = 'Delete Company';
    this.confirmModalMessage = `Are you sure you want to permanently delete ${company.name}? This action cannot be undone.`;
    this.confirmModalBtnText = 'Delete';
    this.confirmModalBtnClass = 'btn-danger';
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    if (this.processingAction) return;
    this.showConfirmModal = false;
    this.confirmTargetCompany = null;
    this.confirmActionType = null;
  }

  executeConfirmAction() {
    if (!this.confirmTargetCompany || !this.confirmTargetCompany.id) return;

    this.processingAction = true;

    if (this.confirmActionType === 'deactivate' || this.confirmActionType === 'reactivate') {
      this.companyService.updateCompanyStatus(this.confirmTargetCompany.id).subscribe({
        next: () => {
          this.notificationService.success(`${this.confirmTargetCompany!.name} status has been updated.`);
          this.processingAction = false;
          this.closeConfirmModal();
          this.loadCompanies();
        },
        error: (err) => {
          console.error('Failed to update company status', err);
          this.notificationService.error('Failed to update company status.');
          this.processingAction = false;
        }
      });
    } else if (this.confirmActionType === 'delete') {
      this.companyService.deleteCompany(this.confirmTargetCompany.id).subscribe({
        next: () => {
          this.notificationService.success(`${this.confirmTargetCompany!.name} has been deleted.`);
          this.processingAction = false;
          this.closeConfirmModal();
          this.loadCompanies();
        },
        error: (err) => {
          console.error('Failed to delete company', err);
          this.notificationService.error('Failed to delete company.');
          this.processingAction = false;
        }
      });
    }
  }

  loadMoreCards() {
    this.displayedCardsCount += 10;
  }

  ngOnInit() {
    this.loadBranches();
    this.loadCompanies();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((query) => {
      this.searchQuery = query;
      this.currentPage = 0;
      this.loadCompanies();
    });
  }

  loadBranches() {
    this.branchService.getAllBranches().subscribe({
      next: (res) => {
        this.branches = res || [];
      },
      error: (err) => console.error('Failed to load branches', err)
    });
  }

  loadCompanies() {
    this.isLoading = true;
    this.companyService.getCompanies(this.currentPage, this.pageSize, this.searchQuery).subscribe({
      next: (res) => {
        this.companies = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load companies', err);
        this.notificationService.error('Failed to load companies.');
        this.isLoading = false;
        this.companies = [];
      }
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCompanies();
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.newCompany = {
      name: '',
      email: '',
      phone: '',
      contactPerson: '',
      address: '',
      industry: '',
      website: '',
      branchId: undefined,
      assignedTo: Number(this.authService.currentUserValue?.id || 1)
    };
    this.showAddModal = true;
  }

  openEditModal(comp: Company) {
    this.isEditMode = true;
    
    // Map nested data to flat model for form binding
    this.newCompany = { 
      ...comp,
      industry: comp.companyDetails?.industry || comp.industry,
      contactPerson: comp.companyDetails?.contactPerson || comp.contactPerson,
      address: comp.companyDetails?.address || comp.address,
      website: comp.companyDetails?.website || comp.website,
      branchId: comp.branch?.id || comp.branchId,
      assignedTo: comp.companyDetails?.assignedTo || comp.assignedTo || 1
    };
    
    this.showAddModal = true;
    this.openDropdownId = null;
  }

  viewDetails(company: Company) {
    this.selectedCompany = company;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedCompany = null;
  }

  closeAddModal() {
    if (this.submitting) return;
    this.showAddModal = false;
  }

  onSubmitCompany() {
    if (!this.newCompany.name || !this.newCompany.email || !this.newCompany.phone || !this.newCompany.contactPerson || !this.newCompany.address || !this.newCompany.industry || !this.newCompany.website || !this.newCompany.branchId) return;

    // Ensure assignedTo is set (as per API requirement in the curl example)
    if (!this.newCompany.assignedTo) {
      this.newCompany.assignedTo = Number(this.authService.currentUserValue?.id || 1);
    }

    this.submitting = true;

    if (this.isEditMode && this.newCompany.id) {
      this.companyService.updateCompany(this.newCompany.id, this.newCompany).subscribe({
        next: () => {
          this.notificationService.success('Company updated successfully!');
          this.submitting = false;
          this.showAddModal = false;
          this.loadCompanies();
        },
        error: (err) => {
          console.error('Failed to update company', err);
          this.notificationService.error('Failed to update company. Please try again.');
          this.submitting = false;
        }
      });
    } else {
      this.companyService.createCompany(this.newCompany).subscribe({
        next: () => {
          this.notificationService.success('Company created successfully!');
          this.submitting = false;
          this.showAddModal = false;
          this.currentPage = 0;
          this.loadCompanies();
        },
        error: (err) => {
          console.error('Failed to create company', err);
          this.notificationService.error('Failed to create company. Please try again.');
          this.submitting = false;
        }
      });
    }
  }
}
