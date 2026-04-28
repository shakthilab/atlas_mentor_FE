import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReferralService, Referral } from '../../../../core/services/referral.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../core/models/branch.model';

@Component({
  selector: 'app-referral-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">Referral Partners</h1>
          <p class="page-subtitle">Track performance and payouts for external agents and partners.</p>
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
            <span class="material-icons">person_add</span>
            Add Referral
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search by name..." [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()">
        </div>
        <div class="filter-actions">
          <select class="filter-select" [(ngModel)]="filterType" (change)="onFilterChange()">
            <option value="">All Types</option>
            <option *ngFor="let type of referralTypes" [value]="type">{{ type }}</option>
          </select>
          
          <select class="filter-select" [(ngModel)]="filterBranch" (change)="onFilterChange()">
            <option value="">All Branches</option>
            <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container shadow-premium" *ngIf="isLoading">
        <div class="spinner-container">
          <div class="loading-spinner"></div>
        </div>
        <p>Loading referrals...</p>
      </div>

      <div class="empty-state-container" *ngIf="!isLoading && referrals.length === 0">
        <div class="empty-state-content">
          <span class="material-icons empty-icon">group_add</span>
          <h3>No Referrals Found</h3>
          <p>There are currently no referrals found. Add your first referral partner to get started.</p>
        </div>
      </div>

      <!-- Referral Table Card -->
      <div class="table-card" *ngIf="!isLoading && referrals.length > 0 && viewMode === 'list'">
        <div class="table-card-header">
          <div class="table-header-title">
            <h2>Partners</h2>
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
                <th>Referral Name</th>
                <th>Type</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Total Leads</th>
                <th>Registered</th>
                <th>Pending Payout</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ref of referrals" class="clickable-row">
                <td>
                  <div class="user-info">
                    <div class="avatar">{{ ref.name.charAt(0) }}</div>
                    <div class="details">
                      <span class="name">{{ ref.name }}</span>
                      <span class="email">{{ ref.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="type-badge">{{ ref.referralType }}</span>
                </td>
                <td>{{ ref.branch?.name || getBranchName(ref.branchId) }}</td>
                <td>
                  <span class="status-dot-wrap" [ngClass]="(ref.status || 'ACTIVE').toLowerCase()">
                    <span class="status-dot"></span>
                    {{ ref.status || 'ACTIVE' }}
                  </span>
                </td>
                <td class="stat-cell">{{ ref.leads || 0 }}</td>
                <td class="stat-cell">{{ ref.registered || 0 }}</td>
                <td class="payout-cell">{{ (ref.payout || 0) | currency }}</td>
                <td style="text-align: right;">
                  <div class="action-btns" style="position: relative;">
                    <button class="btn-icon" (click)="openEditModal(ref)"><span class="material-icons">edit</span></button>
                    <button class="btn-icon" (click)="toggleDropdown($event, 'row-' + ref.id)"><span class="material-icons">more_vert</span></button>
                    
                    <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === 'row-' + ref.id" (click)="$event.stopPropagation()">
                    <button class="dropdown-item warning" (click)="confirmDeactivate(ref); openDropdownId = null" *ngIf="(ref.status || 'ACTIVE').toUpperCase() !== 'INACTIVE'">
                      <span class="material-icons" style="font-size: 18px;">block</span>
                      Deactivate
                    </button>
                    <button class="dropdown-item success" (click)="confirmReactivate(ref); openDropdownId = null" *ngIf="(ref.status || '').toUpperCase() === 'INACTIVE'">
                      <span class="material-icons" style="font-size: 18px;">check_circle</span>
                      Reactivate
                    </button>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item danger" (click)="confirmDelete(ref); openDropdownId = null">
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
      </div>

      <!-- Referral Grid View -->
      <div class="grid-container-wrapper" *ngIf="!isLoading && referrals.length > 0 && viewMode === 'grid'">
        <div class="grid-container">
          <div class="referral-card shadow-premium" *ngFor="let ref of referrals | slice:0:displayedCardsCount">
            <div class="card-header">
              <div class="user-info-grid">
                <div class="avatar">{{ ref.name.charAt(0) }}</div>
                <div class="details">
                  <span class="name">{{ ref.name }}</span>
                  <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 4px;">
                    <span class="type-badge">{{ ref.referralType }}</span>
                    <span class="status-dot-wrap" [ngClass]="(ref.status || 'ACTIVE').toLowerCase()">
                      <span class="status-dot"></span>
                      {{ ref.status || 'ACTIVE' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="action-btns" style="position: relative;">
                <button class="btn-icon" (click)="openEditModal(ref)"><span class="material-icons">edit</span></button>
                <button class="btn-icon" (click)="toggleDropdown($event, 'card-' + ref.id)">
                  <span class="material-icons">more_vert</span>
                </button>
                
                <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === 'card-' + ref.id" (click)="$event.stopPropagation()">
                  <button class="dropdown-item warning" (click)="confirmDeactivate(ref); openDropdownId = null" *ngIf="(ref.status || 'ACTIVE').toUpperCase() !== 'INACTIVE'">
                    <span class="material-icons" style="font-size: 18px;">block</span>
                    Deactivate
                  </button>
                  <button class="dropdown-item success" (click)="confirmReactivate(ref); openDropdownId = null" *ngIf="(ref.status || '').toUpperCase() === 'INACTIVE'">
                    <span class="material-icons" style="font-size: 18px;">check_circle</span>
                    Reactivate
                  </button>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item danger" (click)="confirmDelete(ref); openDropdownId = null">
                    <span class="material-icons" style="font-size: 18px;">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            </div>
            
            <div class="card-body">
              <div class="metrics-grid">
                <div class="metric-box">
                  <span class="label">Leads</span>
                  <span class="value">{{ ref.leads || 0 }}</span>
                </div>
                <div class="metric-box">
                  <span class="label">Registered</span>
                  <span class="value">{{ ref.registered || 0 }}</span>
                </div>
                <div class="metric-box">
                  <span class="label">Pending Payout</span>
                  <span class="value red">{{ (ref.payout || 0) | currency }}</span>
                </div>
                <div class="metric-box">
                  <span class="label">Branch</span>
                  <span class="value">{{ ref.branch?.name || getBranchName(ref.branchId) }}</span>
                </div>
              </div>
              <div class="contact-item">
                <span class="material-icons">email</span>
                <span>{{ ref.email }}</span>
              </div>
            </div>
            
            <div class="card-footer">
              <button class="btn btn-primary btn-sm btn-block">
                <span class="material-icons">payments</span>
                Process Payout
              </button>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="load-more-container" *ngIf="referrals.length > displayedCardsCount">
          <button class="btn btn-secondary load-more-btn" (click)="loadMoreCards()">
            <span>Load More Partners</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>

    <!-- Add Referral Modal -->
    <div class="modal-overlay" *ngIf="showAddModal" (click)="closeAddModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditMode ? 'Edit Referral' : 'Add New Referral' }}</h2>
          <button class="close-btn" (click)="closeAddModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-body">
          <p class="modal-subtitle">{{ isEditMode ? 'Update details for the referral partner.' : 'Enter details for the new referral partner.' }}</p>
          
          <form #referralForm="ngForm" (ngSubmit)="onSubmitReferral()">
            <div class="form-group">
              <label for="refName">Full Name</label>
              <input type="text" id="refName" name="name" class="form-control" [(ngModel)]="newReferral.name" placeholder="John Doe" required>
            </div>

            <div class="form-group">
              <label for="refEmail">Email Address</label>
              <input type="email" id="refEmail" name="email" class="form-control" [(ngModel)]="newReferral.email" placeholder="john.doe@example.com" required>
            </div>

            <div class="form-group">
              <label for="refPhone">Phone Number</label>
              <input type="text" id="refPhone" name="phone" class="form-control" [(ngModel)]="newReferral.phone" placeholder="1234567890" required>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="refType">Referral Type</label>
                <select id="refType" name="referralType" class="form-control" [(ngModel)]="newReferral.referralType" required>
                  <option value="" disabled selected>Select Type</option>
                  <option *ngFor="let type of referralTypes" [value]="type">{{ type }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="refBranch">Branch</label>
                <select id="refBranch" name="branchId" class="form-control" [(ngModel)]="newReferral.branchId" required>
                  <option [ngValue]="undefined" disabled selected>Select Branch</option>
                  <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="submit" class="btn btn-primary btn-block" [disabled]="referralForm.invalid || submitting">
                <span *ngIf="!submitting">{{ isEditMode ? 'Save Changes' : 'Create Referral' }}</span>
                <span *ngIf="submitting">Processing...</span>
              </button>
            </div>
          </form>
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
    .filter-actions { display: flex; gap: 0.75rem; align-items: center; }
    .filter-select { background: white; border: 1px solid var(--color-gray-300); padding: 0.625rem 0.875rem; border-radius: var(--radius-md); color: var(--color-gray-700); font-weight: 500; font-size: 0.875rem; outline: none; box-shadow: var(--shadow-xs); transition: all var(--transition-fast); }

    .premium-table { width: 100%; border-collapse: collapse; table-layout: auto; }
    .premium-table th { text-align: center !important; padding: 0.75rem 1.5rem; font-size: 0.725rem; font-weight: 600; color: var(--color-gray-600); background: var(--color-gray-50); border-bottom: 1px solid var(--color-gray-200); white-space: nowrap; }
    .premium-table td { text-align: center !important; padding: 1rem 1.5rem; border-bottom: 1px solid var(--color-gray-200); font-size: 0.875rem; vertical-align: middle; color: var(--color-gray-600); }
    
    .premium-table th:first-child, .premium-table td:first-child { padding-left: 1.5rem; }
    .premium-table th:last-child, .premium-table td:last-child { padding-right: 1.5rem; }

    .user-info { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; text-align: center; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; border: 1px solid var(--color-primary-border); flex-shrink: 0; }
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
    .stat-cell { font-weight: 500; color: var(--color-gray-600); }
    
    .payout-cell { font-weight: 600; color: #b42318; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .action-btns { display: flex; gap: 0.25rem; justify-content: flex-end; }
    .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--color-gray-500); cursor: pointer; border-radius: var(--radius-md); transition: all var(--transition-fast); }
    .btn-icon:hover { background: var(--color-gray-50); color: var(--color-gray-700); }
    .btn-icon .material-icons { font-size: 20px; }

    /* No Data Styles */
    .no-data-container { display: flex; align-items: center; justify-content: center; min-height: 350px; padding: 3rem; }
    .no-data-content { text-align: center; max-width: 400px; }
    .no-data-icon { font-size: 4rem; color: var(--color-gray-200); margin-bottom: 1.5rem; display: block; }
    .no-data-content h3 { font-size: 1.25rem; font-weight: 600; color: var(--color-gray-900); margin: 0 0 0.5rem; }
    .no-data-content p { color: var(--color-gray-500); font-size: 0.95rem; margin: 0 0 2rem; line-height: 1.5; }

    /* Loading State */
    .loading-container { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 350px; padding: 3rem; box-shadow: var(--shadow-sm); }
    .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-100); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Pagination */
    .pagination-container { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; background: white; padding: 1rem 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); box-shadow: var(--shadow-sm); }
    .pagination-info { font-size: 0.875rem; color: var(--color-gray-600); }
    .pagination-controls { display: flex; align-items: center; gap: 1rem; }
    .page-current { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.875rem; border-radius: var(--radius-md); }

    @media (max-width: 1024px) {
      .premium-table th:nth-child(3), .premium-table td:nth-child(3) { display: none; }
      .form-grid { grid-template-columns: 1fr; }
    }

    /* No Data Styles */
    .no-data-container { display: flex; align-items: center; justify-content: center; min-height: 350px; padding: 3rem; }
    .no-data-content { text-align: center; max-width: 400px; }
    .no-data-icon { font-size: 4rem; color: var(--color-gray-200); margin-bottom: 1.5rem; display: block; }
    .no-data-content h3 { font-size: 1.25rem; font-weight: 600; color: var(--color-gray-900); margin: 0 0 0.5rem; }
    .no-data-content p { color: var(--color-gray-500); font-size: 0.95rem; margin: 0 0 2rem; line-height: 1.5; }

    /* Loading State */
    .loading-container { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 350px; padding: 3rem; box-shadow: var(--shadow-sm); }
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
    .metric-box .value.red { color: #b42318; }
    .contact-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--color-gray-600); }
    .contact-item .material-icons { font-size: 18px; color: var(--color-gray-400); }
    .card-footer { padding: 1rem 1.25rem; background: var(--color-gray-50); border-top: 1px solid var(--color-gray-100); }

    .load-more-container { display: flex; justify-content: center; margin-top: 2.5rem; padding-bottom: 1rem; }
    .load-more-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-weight: 600; }

    @media (max-width: 1024px) {
      .header-actions { width: 100%; justify-content: space-between; }
      .module-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .premium-table th:nth-child(3), .premium-table td:nth-child(3) { display: none; }
      .form-grid { grid-template-columns: 1fr; }
    }

    /* Pagination */
    .pagination-container { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; background: white; padding: 1rem 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); box-shadow: var(--shadow-sm); }
    .pagination-info { font-size: 0.875rem; color: var(--color-gray-600); }
    .pagination-controls { display: flex; align-items: center; gap: 1rem; }
    .page-current { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-900); }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.875rem; border-radius: var(--radius-md); }

    @media (max-width: 1024px) {
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
  `]
})
export class ReferralListComponent implements OnInit {
  private referralService = inject(ReferralService);
  private branchService = inject(BranchService);
  private notificationService = inject(NotificationService);

  searchQuery = '';
  filterType = '';
  filterBranch = '';

  referrals: Referral[] = [];
  referralTypes: string[] = [];
  branches: Branch[] = [];

  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;

  isLoading = false;
  submitting = false;
  showAddModal = false;
  isEditMode = false;
  openDropdownId: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  private searchSubject = new Subject<string>();

  newReferral: Partial<Referral> = {
    name: '',
    email: '',
    phone: '',
    referralType: '',
    branchId: undefined
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
  confirmTargetReferral: Referral | null = null;
  confirmActionType: 'deactivate' | 'reactivate' | 'delete' | null = null;
  processingAction = false;

  confirmDeactivate(referral: Referral) {
    this.confirmTargetReferral = referral;
    this.confirmActionType = 'deactivate';
    this.confirmModalTitle = 'Deactivate Referral';
    this.confirmModalMessage = `Are you sure you want to deactivate ${referral.name}? This will prevent them from accessing the system.`;
    this.confirmModalBtnText = 'Deactivate';
    this.confirmModalBtnClass = 'btn-warning';
    this.showConfirmModal = true;
  }

  confirmReactivate(referral: Referral) {
    this.confirmTargetReferral = referral;
    this.confirmActionType = 'reactivate';
    this.confirmModalTitle = 'Reactivate Referral';
    this.confirmModalMessage = `Are you sure you want to reactivate ${referral.name}? They will regain access to their account.`;
    this.confirmModalBtnText = 'Reactivate';
    this.confirmModalBtnClass = 'btn-success';
    this.showConfirmModal = true;
  }

  confirmDelete(referral: Referral) {
    this.confirmTargetReferral = referral;
    this.confirmActionType = 'delete';
    this.confirmModalTitle = 'Delete Referral';
    this.confirmModalMessage = `Are you sure you want to permanently delete ${referral.name}? This action cannot be undone.`;
    this.confirmModalBtnText = 'Delete';
    this.confirmModalBtnClass = 'btn-danger';
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    if (this.processingAction) return;
    this.showConfirmModal = false;
    this.confirmTargetReferral = null;
    this.confirmActionType = null;
  }

  executeConfirmAction() {
    if (!this.confirmTargetReferral || !this.confirmTargetReferral.id) return;

    this.processingAction = true;

    if (this.confirmActionType === 'deactivate') {
      this.referralService.updateReferralStatus(this.confirmTargetReferral.id, 'INACTIVE').subscribe({
        next: () => {
          this.notificationService.success(`${this.confirmTargetReferral!.name} has been deactivated.`);
          this.processingAction = false;
          this.closeConfirmModal();
          this.loadReferrals();
        },
        error: (err) => {
          console.error('Failed to deactivate referral', err);
          this.notificationService.error('Failed to deactivate referral.');
          this.processingAction = false;
        }
      });
    } else if (this.confirmActionType === 'reactivate') {
      this.referralService.updateReferralStatus(this.confirmTargetReferral.id, 'ACTIVE').subscribe({
        next: () => {
          this.notificationService.success(`${this.confirmTargetReferral!.name} has been reactivated.`);
          this.processingAction = false;
          this.closeConfirmModal();
          this.loadReferrals();
        },
        error: (err) => {
          console.error('Failed to reactivate referral', err);
          this.notificationService.error('Failed to reactivate referral.');
          this.processingAction = false;
        }
      });
    } else if (this.confirmActionType === 'delete') {
      this.referralService.deleteReferral(this.confirmTargetReferral.id).subscribe({
        next: () => {
          this.notificationService.success(`${this.confirmTargetReferral!.name} has been deleted.`);
          this.processingAction = false;
          this.closeConfirmModal();
          this.loadReferrals();
        },
        error: (err) => {
          console.error('Failed to delete referral', err);
          this.notificationService.error('Failed to delete referral.');
          this.processingAction = false;
        }
      });
    }
  }

  loadMoreCards() {
    this.displayedCardsCount += 10;
  }

  ngOnInit() {
    this.loadReferralTypes();
    this.loadBranches();
    this.loadReferrals();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((query) => {
      this.searchQuery = query;
      this.currentPage = 0;
      this.loadReferrals();
    });
  }

  loadReferralTypes() {
    this.referralService.getReferralTypes().subscribe({
      next: (types) => this.referralTypes = types,
      error: (err) => {
        console.error('Failed to load referral types', err);
        this.referralTypes = ['STUDENT', 'INDIVIDUAL', 'AGENCY'];
      }
    });
  }

  getBranchName(branchId?: number): string {
    if (!branchId) return 'Unknown Branch';
    const branch = this.branches.find(b => b.id === branchId || (b.id && b.id.toString() === branchId.toString()));
    return branch ? branch.name : 'Unknown Branch';
  }

  loadBranches() {
    this.branchService.getAllBranches().subscribe({
      next: (data) => this.branches = data,
      error: (err) => console.error('Failed to load branches', err)
    });
  }

  loadReferrals() {
    this.isLoading = true;
    this.referralService.getReferrals(this.currentPage, this.pageSize, this.searchQuery, this.filterType, this.filterBranch).subscribe({
      next: (res) => {
        this.referrals = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load referrals', err);
        this.notificationService.error('Failed to load referrals.');
        this.isLoading = false;
        this.referrals = [];
      }
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadReferrals();
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadReferrals();
    }
  }

  openAddModal() {
    this.isEditMode = false;
    this.newReferral = {
      name: '',
      email: '',
      phone: '',
      referralType: '',
      branchId: undefined
    };
    this.showAddModal = true;
  }

  openEditModal(ref: Referral) {
    this.isEditMode = true;
    this.newReferral = { ...ref };
    this.showAddModal = true;
    this.openDropdownId = null;
  }

  closeAddModal() {
    if (this.submitting) return;
    this.showAddModal = false;
  }

  onSubmitReferral() {
    if (!this.newReferral.name || !this.newReferral.email || !this.newReferral.referralType || !this.newReferral.branchId) return;

    this.submitting = true;

    if (this.isEditMode && this.newReferral.id) {
      this.referralService.updateReferral(this.newReferral.id, this.newReferral).subscribe({
        next: () => {
          this.notificationService.success('Referral updated successfully!');
          this.submitting = false;
          this.showAddModal = false;
          this.loadReferrals();
        },
        error: (err) => {
          console.error('Failed to update referral', err);
          this.notificationService.error('Failed to update referral. Please try again.');
          this.submitting = false;
        }
      });
    } else {
      this.referralService.createReferral(this.newReferral).subscribe({
        next: () => {
          this.notificationService.success('Referral created successfully!');
          this.submitting = false;
          this.showAddModal = false;
          this.currentPage = 0;
          this.loadReferrals();
        },
        error: (err) => {
          console.error('Failed to create referral', err);
          this.notificationService.error('Failed to create referral. Please try again.');
          this.submitting = false;
        }
      });
    }
  }
}
