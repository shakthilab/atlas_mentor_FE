import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ReferralService, Referral } from '../../../../core/services/referral.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CountryService, CountryMobileCode } from '../../../../core/services/country.service';
import { RoleService, Role } from '../../../../core/services/role.service';
import { EmployeeService, Employee } from '../../../../core/services/employee.service';

import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../core/models/branch.model';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-referral-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EmptyStateComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">Referral Partners</h1>
          <p class="page-subtitle">Track performance and payouts for external agents and partners.</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher">
            <button class="switcher-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'" title="List View">
              <span class="material-icons">list</span>
              <span>List</span>
            </button>
            <button class="switcher-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Card View">
              <span class="material-icons">grid_view</span>
              <span>Grid</span>
            </button>
          </div>
          <button class="btn btn-primary" (click)="openAddModal()">
            <span class="material-icons">add</span>
            <span>Add Referral</span>
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
          <button class="btn-icon-secondary" [class.active]="showAdvancedFilters" (click)="showAdvancedFilters = !showAdvancedFilters" title="Advanced Filters">
            <span class="material-icons">tune</span>
          </button>
        </div>
      </div>

      <!-- Advanced Filters Panel -->
      <div class="advanced-filters-panel" [class.show]="showAdvancedFilters">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Branch</label>
            <select [(ngModel)]="filterBranch" (change)="onFilterChange()">
              <option value="">All Branches</option>
              <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <button class="btn-ghost-sm" (click)="resetFilters()">Reset All Filters</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container shadow-premium" *ngIf="isLoading">
        <div class="spinner-container">
          <div class="loading-spinner"></div>
        </div>
        <p style="color: var(--color-gray-500);">Loading referrals...</p>
      </div>

      <app-empty-state 
        *ngIf="!isLoading && referrals.length === 0"
        title="No Referrals Found"
        message="There are currently no referrals found. Add your first referral partner to get started."
        [showAction]="true"
        actionText="Add Referral"
        (actionClick)="openAddModal()">
      </app-empty-state>

      <!-- Referral Table -->
      <div class="table-card" *ngIf="!isLoading && referrals.length > 0 && viewMode === 'list'">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Referral Name</th>
                <th>Type</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Leads</th>
                <th>Registered</th>
                <th>Payout</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ref of referrals; let i = index" class="clickable-row" (click)="viewDetails(ref)">
                <td>
                  <div class="entity-meta">
                    <div class="avatar-circle" [style.background]="getAvatarColor(ref.name || (ref.firstName ? ref.firstName + ' ' + (ref.lastName || '') : 'Unknown'))">
                      {{ getInitials(ref.name || (ref.firstName ? ref.firstName + ' ' + (ref.lastName || '') : 'Unknown')) }}
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ ref.name || (ref.firstName ? ref.firstName + ' ' + (ref.lastName || '') : 'Unknown') }}</span>
                      <span class="entity-subtext">{{ ref.email }}</span>
                    </div>
                  </div>
                </td>
                <td><span class="badge-status gray">{{ ref.referralType }}</span></td>
                <td>{{ ref.branch?.name || getBranchName(ref.branchId) }}</td>
                <td>
                  <span class="badge-status" [ngClass]="(ref.status || 'ACTIVE').toLowerCase() === 'active' ? 'success' : 'gray'">
                    {{ ref.status || 'ACTIVE' }}
                  </span>
                </td>
                <td style="font-weight: 600;">{{ ref.leads || 0 }}</td>
                <td style="font-weight: 600;">{{ ref.registered || 0 }}</td>
                <td style="font-weight: 600; color: #b42318;">{{ (ref.payout || 0) | currency }}</td>
                <td style="text-align: right;">
                  <div class="action-btns" (click)="$event.stopPropagation()">
                    <button class="btn-icon" (click)="viewDetails(ref)" title="View Details"><span class="material-icons">visibility</span></button>
                    <button class="btn-icon" (click)="openEditModal(ref)"><span class="material-icons">edit</span></button>
                    <button class="btn-icon" (click)="toggleDropdown($event, 'row-' + ref.id)"><span class="material-icons">more_vert</span></button>
                    
                    <div class="action-dropdown shadow-premium" 
                         *ngIf="openDropdownId === 'row-' + ref.id" 
                         (click)="$event.stopPropagation()"
                         [ngClass]="{'open-up': i >= referrals.length - 2 && referrals.length > 3}">
                      <button class="dropdown-item" (click)="confirmDeactivate(ref); openDropdownId = null" *ngIf="(ref.status || 'ACTIVE').toUpperCase() !== 'INACTIVE'" style="color: #b54708;">
                        <span class="material-icons">block</span> Deactivate
                      </button>
                      <button class="dropdown-item" (click)="confirmReactivate(ref); openDropdownId = null" *ngIf="(ref.status || '').toUpperCase() === 'INACTIVE'" style="color: #027a48;">
                        <span class="material-icons">check_circle</span> Reactivate
                      </button>
                      <button class="dropdown-item" (click)="confirmDelete(ref); openDropdownId = null" style="color: #b42318;">
                        <span class="material-icons">delete</span> Delete
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="table-card-footer" style="padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-gray-200);">
          <button class="pagination-btn" [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)">
            <span class="material-icons">arrow_back</span>
            Previous
          </button>
          
          <div class="pagination-pages" style="display: flex; gap: 4px;">
            <button class="page-num" [class.active]="currentPage === 0" (click)="changePage(0)">1</button>
            <button *ngIf="totalPages > 1" class="page-num" [class.active]="currentPage === 1" (click)="changePage(1)">2</button>
            <button *ngIf="totalPages > 2" class="page-num" [class.active]="currentPage === 2" (click)="changePage(2)">3</button>
          </div>

          <button class="pagination-btn" [disabled]="currentPage >= totalPages - 1" (click)="changePage(currentPage + 1)">
            Next
            <span class="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div class="grid-container" *ngIf="!isLoading && referrals.length > 0 && viewMode === 'grid'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        <div class="table-card" *ngFor="let ref of referrals | slice:0:displayedCardsCount" style="padding: 1.25rem; transition: all 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div class="entity-meta">
              <div class="avatar-circle" [style.background]="getAvatarColor(ref.name || (ref.firstName ? ref.firstName + ' ' + (ref.lastName || '') : 'Unknown'))">
                {{ getInitials(ref.name || (ref.firstName ? ref.firstName + ' ' + (ref.lastName || '') : 'Unknown')) }}
              </div>
              <div class="entity-info">
                <span class="entity-name">{{ ref.name || (ref.firstName ? ref.firstName + ' ' + (ref.lastName || '') : 'Unknown') }}</span>
                <span class="badge-status gray" style="margin-top: 4px;">{{ ref.referralType }}</span>
              </div>
            </div>
            <span class="badge-status" [ngClass]="(ref.status || 'ACTIVE').toLowerCase() === 'active' ? 'success' : 'gray'">
              {{ ref.status || 'ACTIVE' }}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; padding: 1rem; background: var(--color-gray-50); border-radius: 8px;">
            <div class="entity-info">
              <span class="entity-subtext">Leads</span>
              <span class="entity-name" style="font-size: 0.875rem;">{{ ref.leads || 0 }}</span>
            </div>
            <div class="entity-info">
              <span class="entity-subtext">Payout</span>
              <span class="entity-name" style="font-size: 0.875rem; color: #b42318;">{{ (ref.payout || 0) | currency }}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
            <span class="entity-subtext" style="font-size: 0.75rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">{{ ref.email }}</span>
            <div class="action-btns" (click)="$event.stopPropagation()">
              <button class="btn-icon" (click)="viewDetails(ref)"><span class="material-icons">visibility</span></button>
              <button class="btn-icon" (click)="toggleDropdown($event, 'card-' + ref.id)"><span class="material-icons">more_vert</span></button>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div *ngIf="referrals.length > displayedCardsCount" style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 1rem;">
          <button class="btn btn-secondary" (click)="loadMoreCards()">
            <span>Load More Partners</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>

      <!-- Add Referral Modal -->
      <div class="modal-overlay" *ngIf="showAddModal" (click)="closeAddModal()">
        <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 540px;">
          <div class="modal-header">
            <div class="modal-header-icon" style="background: var(--color-primary-light); color: var(--color-primary); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span class="material-icons">{{ isEditMode ? 'edit' : 'person_add' }}</span>
            </div>
            <div class="modal-header-text" style="flex: 1; padding-left: 1rem;">
              <h2 class="modal-title" style="margin: 0; font-size: 1.25rem;">{{ isEditMode ? 'Edit Referral' : 'Add New Referral' }}</h2>
              <p class="modal-subtitle" style="margin: 0.25rem 0 0; color: var(--color-gray-500); font-size: 0.875rem;">{{ isEditMode ? 'Update details for the referral partner.' : 'Enter details for the new referral partner.' }}</p>
            </div>
            <button class="btn-icon" (click)="closeAddModal()">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="modal-body" style="padding: 1.5rem;">
            <form [formGroup]="referralForm" (ngSubmit)="onSubmitReferral()">
              <div class="form-row" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group" style="flex: 1;">
                  <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">First Name <span style="color: red;">*</span></label>
                  <input type="text" class="form-control" formControlName="firstName" placeholder="John">
                  <div *ngIf="referralForm.get('firstName')?.touched && referralForm.get('firstName')?.invalid" style="color: var(--color-error); font-size: 0.75rem; margin-top: 4px;">
                    First name is required.
                  </div>
                </div>
                <div class="form-group" style="flex: 1;">
                  <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Last Name <span style="color: red;">*</span></label>
                  <input type="text" class="form-control" formControlName="lastName" placeholder="Doe">
                  <div *ngIf="referralForm.get('lastName')?.touched && referralForm.get('lastName')?.invalid" style="color: var(--color-error); font-size: 0.75rem; margin-top: 4px;">
                    Last name is required.
                  </div>
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Email Address <span style="color: red;">*</span></label>
                <input type="email" class="form-control" formControlName="email" placeholder="john.doe@example.com" [readonly]="isEditMode">
                <div *ngIf="referralForm.get('email')?.touched && referralForm.get('email')?.invalid" class="validation-error" style="color: var(--color-error); font-size: 0.75rem; margin-top: 4px;">
                  Please enter a valid email address.
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Phone Number <span style="color: red;">*</span></label>
                <div style="display: flex; border: 1px solid var(--color-gray-300); border-radius: 8px; overflow: hidden;">
                  <div style="padding: 0 12px; background: var(--color-gray-50); display: flex; align-items: center; border-right: 1px solid var(--color-gray-300); cursor: pointer;" (click)="toggleCountryDropdown($event)">
                    <img *ngIf="selectedCountry?.flagUrl" [src]="selectedCountry?.flagUrl" style="width: 20px; height: 14px; margin-right: 6px;">
                    <span style="font-size: 0.875rem; font-weight: 500;">{{ selectedCountry?.mobileCode || '+91' }}</span>
                  </div>
                  <input type="text" class="form-control" style="border: none;" formControlName="phone" placeholder="Phone number" [maxlength]="selectedCountry?.mobileNumberLength || 20">
                </div>
                <div *ngIf="referralForm.get('phone')?.touched && referralForm.get('phone')?.invalid" class="validation-error" style="color: var(--color-error); font-size: 0.75rem; margin-top: 4px;">
                  <span *ngIf="referralForm.get('phone')?.hasError('required')">Phone number is required.</span>
                  <span *ngIf="referralForm.get('phone')?.hasError('minlength') || referralForm.get('phone')?.hasError('maxlength')">
                    Phone number must be exactly {{ selectedCountry?.mobileNumberLength }} digits.
                  </span>
                  <span *ngIf="referralForm.get('phone')?.hasError('pattern')">Only numeric digits allowed.</span>
                </div>
              </div>

              <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                  <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.4rem;">Referral Type <span style="color: red;">*</span></label>
                  <select class="form-control" formControlName="referralType">
                    <option value="" disabled>Select Type</option>
                    <option *ngFor="let type of referralTypes" [value]="type">{{ type }}</option>
                  </select>
                  <div *ngIf="referralForm.get('referralType')?.touched && referralForm.get('referralType')?.invalid" style="color: var(--color-error); font-size: 0.75rem; margin-top: 4px;">
                    Referral type is required.
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.4rem;">Branch <span style="color: red;">*</span></label>
                  <select class="form-control" formControlName="branchId" (change)="onBranchOrRoleChange()">
                    <option value="" disabled>Select Branch</option>
                    <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
                  </select>
                  <div *ngIf="referralForm.get('branchId')?.touched && referralForm.get('branchId')?.invalid" style="color: var(--color-error); font-size: 0.75rem; margin-top: 4px;">
                    Branch is required.
                  </div>
                </div>
              </div>

              <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group" style="position: relative; grid-column: span 2; margin-bottom: 2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                    <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin: 0;">Assign To <span style="color: red;">*</span></label>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <span style="font-size: 0.8125rem; color: var(--color-gray-500); font-weight: 500;">Filter by Role:</span>
                      <select class="form-control" style="width: 160px; height: 36px; padding: 0 12px; font-size: 0.8125rem; border-radius: 8px;" 
                              [(ngModel)]="filterRoleId" [ngModelOptions]="{standalone: true}">
                        <option value="">All Roles</option>
                        <option *ngFor="let role of roles" [value]="role.id">{{ role.displayName || role.name }}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="custom-multi-select" [class.disabled]="!referralForm.get('branchId')?.value" 
                       (click)="toggleAssigneeDropdown($event)"
                       style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid var(--color-gray-300); border-radius: 8px; cursor: pointer; background: white; min-height: 44px; transition: all 0.2s;">
                    <span style="font-size: 0.875rem; color: var(--color-gray-700); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      {{ getSelectedAssigneesNames() }}
                    </span>
                    <span class="material-icons" style="font-size: 1.25rem; color: var(--color-gray-400);">{{ isAssigneeDropdownOpen ? 'expand_less' : 'expand_more' }}</span>
                  </div>
                  <div *ngIf="referralForm.get('assignedToIds')?.touched && referralForm.get('assignedToIds')?.invalid" style="color: var(--color-error); font-size: 0.75rem; margin-top: 6px;">
                    At least one assignee is required.
                  </div>

                  <!-- Multi-select Dropdown (Opens below) -->
                  <div *ngIf="isAssigneeDropdownOpen" class="multi-select-dropdown shadow-lg" 
                       (click)="$event.stopPropagation()"
                       style="position: absolute; top: 100%; left: 0; right: 0; z-index: 100; background: white; border: 1px solid var(--color-gray-200); border-radius: 8px; margin-top: 6px; max-height: 240px; overflow-y: auto; padding: 6px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                    <div *ngIf="assignees.length === 0" style="padding: 12px; text-align: center; color: var(--color-gray-500); font-size: 0.875rem;">
                      No employees found for this branch.
                    </div>
                    <div *ngFor="let emp of assignees">
                      <div *ngIf="shouldShowAssignee(emp)" 
                           (click)="toggleAssignee(emp.id!)"
                           class="multi-select-item"
                           style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-radius: 6px; transition: background 0.2s;">
                        <div class="checkbox-box" [class.checked]="isAssigneeSelected(emp.id!)" 
                             style="width: 18px; height: 18px; border: 1px solid var(--color-gray-300); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                          <span class="material-icons" *ngIf="isAssigneeSelected(emp.id!)" style="font-size: 14px; color: var(--color-primary);">check</span>
                        </div>
                        <div style="display: flex; flex-direction: column;">
                          <span style="font-size: 0.875rem; font-weight: 500;">{{ emp.name || (emp.firstName + ' ' + emp.lastName) }}</span>
                          <span style="font-size: 0.7rem; color: var(--color-gray-500);">{{ getEmployeeRoleName(emp) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer" style="margin-top: 2rem; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--color-gray-100); padding-top: 1.5rem;">
                <button type="button" class="btn btn-secondary" (click)="closeAddModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="submitting">
                  {{ isEditMode ? 'Save Changes' : 'Create Referral' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Referral Detail Modal -->
      <div class="modal-overlay" *ngIf="showDetailModal" (click)="closeDetailModal()">
        <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 600px;">
          <div class="modal-header" style="background: linear-gradient(135deg, #667cb0 0%, #4a5d8a 100%); color: white; padding: 2.5rem;">
            <div style="display: flex; align-items: center; gap: 1.5rem; width: 100%;">
              <div class="avatar-circle" style="width: 64px; height: 64px; font-size: 1.5rem; background: rgba(255,255,255,0.2); border: 2px solid white;">
                {{ getInitials(selectedReferral?.name) }}
              </div>
              <div>
                <h2 style="margin: 0; color: white; font-size: 1.5rem;">{{ selectedReferral?.name || (selectedReferral?.firstName + ' ' + selectedReferral?.lastName) }}</h2>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <span style="background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem;">{{ selectedReferral?.referralType }}</span>
                  <span style="background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem;">{{ selectedReferral?.status }}</span>
                </div>
              </div>
            </div>
            <button class="btn-icon" (click)="closeDetailModal()" style="color: white; position: absolute; top: 1.5rem; right: 1.5rem;">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="modal-body" style="padding: 2rem; background: #fcfcfd;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
              <div class="entity-info">
                <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Email</span>
                <span class="entity-name" style="margin-top: 4px;">{{ selectedReferral?.email }}</span>
              </div>
              <div class="entity-info">
                <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Phone</span>
                <span class="entity-name" style="margin-top: 4px;">{{ getFormattedPhone(selectedReferral) }}</span>
              </div>
              <div class="entity-info">
                <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Total Leads</span>
                <span class="entity-name" style="margin-top: 4px;">{{ selectedReferral?.leads || 0 }}</span>
              </div>
              <div class="entity-info">
                <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Pending Payout</span>
                <span class="entity-name" style="margin-top: 4px; color: #b42318;">{{ (selectedReferral?.payout || 0) | currency }}</span>
              </div>
            </div>
          </div>
          
          <div class="modal-footer" style="padding: 1.5rem; display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" (click)="closeDetailModal()">Close</button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showConfirmModal" (click)="closeConfirmModal()">
        <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 400px; padding: 2rem; text-align: center;">
          <div [style.background]="confirmModalBtnClass === 'btn-danger' ? '#fee4e2' : (confirmModalBtnClass === 'btn-warning' ? '#fef0c7' : '#d1fadf')" 
               [style.color]="confirmModalBtnClass === 'btn-danger' ? '#d92d20' : (confirmModalBtnClass === 'btn-warning' ? '#dc6803' : '#039855')" 
               style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
            <span class="material-icons">{{ confirmModalBtnClass === 'btn-danger' ? 'delete_forever' : (confirmModalBtnClass === 'btn-warning' ? 'pause_circle' : 'play_circle') }}</span>
          </div>
          <h2 style="margin: 0 0 0.5rem; font-size: 1.125rem;">{{ confirmModalTitle }}</h2>
          <p style="color: var(--color-gray-500); font-size: 0.875rem; margin-bottom: 2rem;">{{ confirmModalMessage }}</p>
          <div style="display: flex; gap: 12px;">
            <button class="btn btn-secondary" style="flex: 1;" (click)="closeConfirmModal()">Cancel</button>
            <button class="btn btn-primary" style="flex: 1;" [ngClass]="confirmModalBtnClass" (click)="executeConfirmAction()" [disabled]="processingAction">{{ confirmModalBtnText }}</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    
    .custom-multi-select {
      transition: all 0.2s ease;
    }
    .custom-multi-select:hover {
      border-color: var(--color-primary) !important;
    }
    .custom-multi-select.disabled {
      background-color: var(--color-gray-50) !important;
      cursor: not-allowed !important;
      opacity: 0.7;
    }
    .multi-select-item:hover {
      background-color: var(--color-gray-50);
    }
    .checkbox-box.checked {
      background-color: var(--color-primary-light);
      border-color: var(--color-primary) !important;
    }
    
    @media (max-width: 640px) {
      .modal-content {
        width: 95% !important;
        margin: 10px !important;
        max-height: 90vh;
        overflow-y: auto;
      }
      .form-row {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class ReferralListComponent implements OnInit {
  private referralService = inject(ReferralService);
  private branchService = inject(BranchService);
  private notificationService = inject(NotificationService);
  private countryService = inject(CountryService);
  private roleService = inject(RoleService);
  private employeeService = inject(EmployeeService);
  private fb = inject(FormBuilder);

  referralForm: FormGroup;
  countryCodes: CountryMobileCode[] = [];
  selectedCountry: CountryMobileCode | null = null;
  isCountryDropdownOpen = false;
  editingReferralId: string | number | null = null;

  searchQuery = '';
  filterType = '';
  filterBranch = '';

  referrals: Referral[] = [];
  referralTypes: string[] = [];
  branches: Branch[] = [];
  roles: any[] = [];
  assignees: Employee[] = [];
  filterRoleId: string = '';

  viewMode: 'list' | 'grid' = 'list';
  showAdvancedFilters = false;

  resetFilters() {
    this.searchQuery = '';
    this.filterType = '';
    this.filterBranch = '';
    this.currentPage = 0;
    this.loadReferrals();
  }

  displayedCardsCount = 10;

  isLoading = false;
  submitting = false;
  showAddModal = false;
  isEditMode = false;
  openDropdownId: string | null = null;
  isAssigneeDropdownOpen = false;
  selectedReferral: Referral | null = null;
  showDetailModal = false;

  getFormattedPhone(ref: any): string {
    if (!ref) return 'N/A';
    const phone = ref.phone || ref.user?.phone;
    if (!phone) return 'N/A';
    
    if (phone.startsWith('+')) return phone;
    
    let dialCode = ref.dialCode || ref.user?.dialCode;
    const mccId = ref.mobileCountryCodeId || ref.user?.mobileCountryCodeId;
    
    if (!dialCode && mccId && this.countryCodes?.length > 0) {
      const country = this.countryCodes.find(c => c.id === mccId);
      if (country) dialCode = country.mobileCode;
    }
    
    return dialCode ? `${dialCode} ${phone}` : phone;
  }

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  private searchSubject = new Subject<string>();

  constructor() {
    this.referralForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dialCode: ['+91', Validators.required],
      phone: ['', Validators.required],
      referralType: ['', Validators.required],
      branchId: ['', Validators.required],
      assignedToIds: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  toggleDropdown(event: Event, id: string) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  viewDetails(ref: Referral) {
    this.selectedReferral = ref;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedReferral = null;
  }


  loadCountryCodes() {
    this.countryService.getMobileCountryCodes().subscribe({
      next: (data) => {
        this.countryCodes = data;
        if (this.countryCodes.length > 0) {
          const india = this.countryCodes.find(c => c.countryCode === 'IN' || c.mobileCode === '+91');
          this.selectCountry(india || this.countryCodes[0], new Event('init'));
        }
      },
      error: (err) => console.error('Failed to load country codes', err)
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Country dropdown closure
    if (this.isCountryDropdownOpen && !target.closest('.custom-dropdown')) {
      this.isCountryDropdownOpen = false;
    }
    
    // Assignee multi-select closure
    if (this.isAssigneeDropdownOpen && 
        !target.closest('.custom-multi-select') && 
        !target.closest('.multi-select-dropdown')) {
      this.isAssigneeDropdownOpen = false;
    }
    
    // Table action dropdown closure
    if (this.openDropdownId && !target.closest('.action-btns')) {
      this.openDropdownId = null;
    }
  }

  toggleCountryDropdown(event: Event) {
    event.stopPropagation();
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }

  getInitials(name?: string): string {
    if (!name || name.trim() === '') return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getAvatarColor(name?: string): string {
    if (!name) return '#94a3b8'; // default gray
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#a78bfa', '#e879f9', '#f43f5e'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  selectCountry(country: CountryMobileCode, event: Event) {
    if (event.type !== 'init') event.stopPropagation();
    this.selectedCountry = country;
    this.referralForm.get('dialCode')?.setValue(country.mobileCode);
    this.isCountryDropdownOpen = false;
    this.updatePhoneValidation();
  }

  updatePhoneValidation() {
    const phoneControl = this.referralForm.get('phone');
    if (!phoneControl || !this.selectedCountry || !this.selectedCountry.mobileNumberLength) return;
    
    const length = this.selectedCountry.mobileNumberLength;
    phoneControl.setValidators([
      Validators.required,
      Validators.minLength(length),
      Validators.maxLength(length),
      Validators.pattern('^[0-9]*$')
    ]);
    phoneControl.updateValueAndValidity();
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
    this.loadRoles();
    this.loadReferrals();
    this.loadCountryCodes();

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

  loadRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        const excludedRoles = ['STUDENT', 'REFERRAL', 'COMPANY'];
        this.roles = data.filter(r => !excludedRoles.includes(r.name.toUpperCase()));
      },
      error: (err) => console.error('Failed to load roles', err)
    });
  }



  onBranchOrRoleChange() {
    const branchId = this.referralForm.get('branchId')?.value;

    if (branchId) {
      const excludedRoles = ['STUDENT', 'REFERRAL', 'COMPANY'];
      const allowedRoleIds = this.roles
        .filter(r => !excludedRoles.includes(r.name.toUpperCase()))
        .map(r => r.id)
        .join(',');

      this.employeeService.getAdminEmployees(allowedRoleIds, branchId).subscribe({
        next: (data) => {
          this.assignees = data;
        },
        error: (err) => {
          console.error('Failed to load assignees', err);
          this.assignees = [];
        }
      });
    } else {
      this.assignees = [];
    }
  }

  toggleAssignee(employeeId: number | string) {
    const id = Number(employeeId);
    const control = this.referralForm.get('assignedToIds');
    const currentValues = control?.value || [];
    
    if (currentValues.includes(id)) {
      control?.setValue(currentValues.filter((v: number) => v !== id));
    } else {
      control?.setValue([...currentValues, id]);
    }
  }

  isAssigneeSelected(employeeId: number | string): boolean {
    const id = Number(employeeId);
    return (this.referralForm.get('assignedToIds')?.value || []).includes(id);
  }

  toggleAssigneeDropdown(event: Event) {
    if (this.referralForm.get('branchId')?.value) {
      event.stopPropagation();
      this.isAssigneeDropdownOpen = !this.isAssigneeDropdownOpen;
    }
  }

  shouldShowAssignee(emp: Employee): boolean {
    if (!this.filterRoleId) return true;
    
    const filterId = this.filterRoleId.toString();
    const primaryRoleId = emp.role?.id?.toString();
    const matchesPrimary = primaryRoleId === filterId;
    
    const matchesSecondary = emp.roles?.some(r => r.id.toString() === filterId) || false;
    
    return matchesPrimary || matchesSecondary;
  }

  getEmployeeRoleName(emp: Employee): string {
    return emp.role?.name || (emp.roles && emp.roles.length > 0 ? emp.roles[0].name : 'N/A');
  }

  getSelectedAssigneesNames(): string {
    const selectedIds = this.referralForm.get('assignedToIds')?.value || [];
    if (selectedIds.length === 0) return 'Select Assignees';
    
    const names = this.assignees
      .filter(emp => selectedIds.includes(Number(emp.id)))
      .map(emp => emp.name || `${emp.firstName} ${emp.lastName}`);
      
    if (names.length > 0) {
      if (names.length <= 2) return names.join(', ');
      return `${names.length} selected`;
    }
    
    return `${selectedIds.length} selected`;
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
    this.editingReferralId = null;
    this.referralForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      dialCode: this.selectedCountry?.mobileCode || '+91',
      phone: '',
      referralType: '',
      branchId: '',
      assignedToIds: []
    });
    this.assignees = [];
    this.showAddModal = true;
  }

  openEditModal(ref: Referral) {
    this.isEditMode = true;
    this.editingReferralId = ref.id || null;
    
    // Extract dial code and phone
    let dialCode = '+91';
    let phone = ref.phone || '';
    
    if (ref.mobileCountryCodeId) {
      const matched = this.countryCodes.find(c => c.id === ref.mobileCountryCodeId);
      if (matched) {
        dialCode = matched.mobileCode;
        this.selectedCountry = matched;
        if (phone.startsWith(dialCode)) {
          phone = phone.substring(dialCode.length);
        }
      }
    } else if (phone.startsWith('+')) {
      const matchedCountry = this.countryCodes.find(c => phone.startsWith(c.mobileCode));
      if (matchedCountry) {
        dialCode = matchedCountry.mobileCode;
        phone = phone.substring(dialCode.length);
        this.selectedCountry = matchedCountry;
      }
    }

    const nameParts = (ref.name || '').trim().split(' ');
    const firstName = ref.firstName || nameParts[0] || '';
    const lastName = ref.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

    this.referralForm.patchValue({
      firstName: firstName,
      lastName: lastName,
      email: ref.email,
      dialCode: dialCode,
      phone: phone,
      referralType: ref.referralType,
      branchId: ref.branchId || ref.branch?.id || '',
      assignedToIds: ref.assignedToIds || []
    });
    
    if (ref.branchId || ref.branch?.id) {
      this.onBranchOrRoleChange();
    }

    this.updatePhoneValidation();
    this.showAddModal = true;
    this.openDropdownId = null;
  }

  closeAddModal() {
    if (this.submitting) return;
    this.showAddModal = false;
    this.referralForm.reset();
  }

  onSubmitReferral() {
    if (this.referralForm.invalid) {
      this.referralForm.markAllAsTouched();
      this.notificationService.error('Please fill all required fields correctly.');
      return;
    }

    this.submitting = true;
    const formValue = this.referralForm.value;
    
    const referralData: Partial<Referral> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      name: `${formValue.firstName} ${formValue.lastName}`,
      email: formValue.email,
      phone: formValue.phone,
      mobileCountryCodeId: this.selectedCountry?.id,
      referralType: formValue.referralType,
      branchId: Number(formValue.branchId),
      assignedToIds: formValue.assignedToIds
    };

    if (this.isEditMode && this.editingReferralId) {
      this.referralService.updateReferral(this.editingReferralId, referralData).subscribe({
        next: () => {
          this.submitting = false;
          this.showAddModal = false;
          this.loadReferrals();
          this.notificationService.showModal(
            'Referral Updated',
            'Referral partner details have been successfully updated.',
            undefined,
            'success'
          );
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(err.message || 'Failed to update referral');
        }
      });
    } else {
      this.referralService.createReferral(referralData).subscribe({
        next: () => {
          this.submitting = false;
          this.showAddModal = false;
          this.loadReferrals();
          this.notificationService.showModal(
            'Referral Created!',
            'The referral account has been successfully registered.',
            'Access credentials have been shared to the referral\'s email address. They can now log in and start referring students.'
          );
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(err.message || 'Failed to create referral');
        }
      });
    }
  }
}
