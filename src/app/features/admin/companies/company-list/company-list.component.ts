import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CompanyService, Company } from '../../../../core/services/company.service';
import { BranchService } from '../../../../core/services/branch.service';
import { Branch } from '../../../../core/models/branch.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CountryService, CountryMobileCode } from '../../../../core/services/country.service';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EmptyStateComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">Corporate Partners</h1>
          <p class="page-subtitle">Manage university tie-ups and recruitment companies.</p>
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
            <span>Add Company</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search companies by name..." [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()">
        </div>
        <div class="filter-actions">
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
      <div class="loading-container shadow-premium" *ngIf="isLoading" style="padding: 3rem; text-align: center; background: white; border-radius: 12px; border: 1px solid var(--color-gray-200); margin-bottom: 2rem;">
        <div class="spinner-container" style="display: flex; justify-content: center; margin-bottom: 1rem;">
          <div class="loading-spinner"></div>
        </div>
        <p style="color: var(--color-gray-500);">Loading companies...</p>
      </div>

      <app-empty-state 
        *ngIf="!isLoading && companies.length === 0"
        title="No Companies Found"
        message="There are currently no corporate partners found. Add your first company to get started."
        [showAction]="true"
        actionText="Add Company"
        (actionClick)="openAddModal()">
      </app-empty-state>

      <!-- Table View -->
      <div class="table-card" *ngIf="!isLoading && companies.length > 0 && viewMode === 'list'">
        <div class="table-responsive">
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
              <tr *ngFor="let company of companies" class="clickable-row" (click)="viewDetails(company)">
                <td>
                  <div class="entity-meta">
                    <div class="avatar-circle" [style.background]="getAvatarColor(company.companyDetails?.companyName || company.name || company.firstName)">
                      {{ getInitials(company.companyDetails?.companyName || company.name || company.firstName) }}
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ company.companyDetails?.companyName || company.name || company.firstName || 'Unknown Company' }}</span>
                      <span class="entity-subtext">{{ company.email }}</span>
                    </div>
                  </div>
                </td>
                <td><span class="badge-status gray">{{ company.companyDetails?.industry || company.industry }}</span></td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-weight: 500; font-size: 0.8125rem;">{{ company.companyDetails?.address || company.address || company.branch?.name || 'No address' }}</span>
                  </div>
                </td>
                <td>
                  <a [href]="company.companyDetails?.website || company.website" target="_blank" class="website-link" (click)="$event.stopPropagation()" 
                     style="color: var(--color-primary); font-size: 0.8125rem; text-decoration: none; max-width: 150px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                     [title]="company.companyDetails?.website || company.website">
                    {{ company.companyDetails?.website || company.website }}
                  </a>
                </td>
                <td>
                  <span class="badge-status" [ngClass]="(company.status || 'ACTIVE').toLowerCase() === 'active' ? 'success' : 'gray'">
                    {{ company.status || 'ACTIVE' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-btns" (click)="$event.stopPropagation()">
                    <button class="btn-icon" (click)="viewDetails(company)" title="View Details"><span class="material-icons">visibility</span></button>
                    <button class="btn-icon" (click)="openEditModal(company)"><span class="material-icons">edit</span></button>
                    <button class="btn-icon" (click)="toggleDropdown($event, 'row-' + company.id)"><span class="material-icons">more_vert</span></button>
                    
                    <div class="action-dropdown shadow-premium" *ngIf="openDropdownId === 'row-' + company.id" (click)="$event.stopPropagation()" style="position: absolute; right: 0; top: 100%; z-index: 100; background: white; border: 1px solid var(--color-gray-200); border-radius: 8px; padding: 4px; min-width: 160px; box-shadow: var(--shadow-lg);">
                      <button class="dropdown-item" (click)="confirmDeactivate(company); openDropdownId = null" *ngIf="(company.status || 'ACTIVE').toUpperCase() !== 'INACTIVE'" style="width: 100%; text-align: left; padding: 8px 12px; display: flex; align-items: center; gap: 8px; color: #b54708; border: none; background: none; cursor: pointer; border-radius: 4px;">
                        <span class="material-icons" style="font-size: 18px;">block</span> Deactivate
                      </button>
                      <button class="dropdown-item" (click)="confirmReactivate(company); openDropdownId = null" *ngIf="(company.status || '').toUpperCase() === 'INACTIVE'" style="width: 100%; text-align: left; padding: 8px 12px; display: flex; align-items: center; gap: 8px; color: #027a48; border: none; background: none; cursor: pointer; border-radius: 4px;">
                        <span class="material-icons" style="font-size: 18px;">check_circle</span> Reactivate
                      </button>
                      <button class="dropdown-item" (click)="confirmDelete(company); openDropdownId = null" style="width: 100%; text-align: left; padding: 8px 12px; display: flex; align-items: center; gap: 8px; color: #b42318; border: none; background: none; cursor: pointer; border-radius: 4px;">
                        <span class="material-icons" style="font-size: 18px;">delete</span> Delete
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
      <div class="grid-container" *ngIf="!isLoading && companies.length > 0 && viewMode === 'grid'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        <div class="table-card" *ngFor="let company of companies | slice:0:displayedCardsCount" style="padding: 1.25rem; transition: all 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div class="entity-meta">
              <div class="avatar-circle" [style.background]="getAvatarColor(company.companyDetails?.companyName || company.name || company.firstName)">
                {{ getInitials(company.companyDetails?.companyName || company.name || company.firstName) }}
              </div>
              <div class="entity-info">
                <span class="entity-name">{{ company.companyDetails?.companyName || company.name || company.firstName || 'Unknown Company' }}</span>
                <span class="badge-status gray" style="margin-top: 4px;">{{ company.companyDetails?.industry || company.industry }}</span>
              </div>
            </div>
            <span class="badge-status" [ngClass]="(company.status || 'ACTIVE').toLowerCase() === 'active' ? 'success' : 'gray'">
              {{ company.status || 'ACTIVE' }}
            </span>
          </div>
          
          <div style="padding: 1rem; background: var(--color-gray-50); border-radius: 8px; margin-bottom: 1rem;">
            <div class="entity-info">
              <span class="entity-subtext">Contact Person</span>
              <span class="entity-name" style="font-size: 0.875rem;">{{ company.companyDetails?.contactPerson || 'N/A' }}</span>
            </div>
            <div class="entity-info" style="margin-top: 0.75rem;">
              <span class="entity-subtext">Address</span>
              <span class="entity-name" style="font-size: 0.8125rem; font-weight: 500;">{{ company.companyDetails?.address || company.address || company.branch?.name || 'No address' }}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
            <span class="entity-subtext" style="font-size: 0.75rem;">{{ company.email }}</span>
            <div class="action-btns" (click)="$event.stopPropagation()">
              <button class="btn-icon" (click)="viewDetails(company)"><span class="material-icons">visibility</span></button>
              <button class="btn-icon" (click)="toggleDropdown($event, 'card-' + company.id)"><span class="material-icons">more_vert</span></button>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div *ngIf="companies.length > displayedCardsCount" style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 1rem;">
          <button class="btn btn-secondary" (click)="loadMoreCards()">
            <span>Load More Companies</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>

    <!-- Add/Edit Company Modal -->
    <div class="modal-overlay" *ngIf="showAddModal" (click)="closeAddModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 650px;">
        <div class="modal-header">
          <div class="modal-header-icon" style="background: var(--color-primary-light); color: var(--color-primary); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <span class="material-icons">{{ isEditMode ? 'edit' : 'domain_add' }}</span>
          </div>
          <div class="modal-header-text" style="flex: 1; padding-left: 1rem;">
            <h2 class="modal-title" style="margin: 0; font-size: 1.25rem;">{{ isEditMode ? 'Edit Company' : 'Add New Company' }}</h2>
            <p class="modal-subtitle" style="margin: 0.25rem 0 0; color: var(--color-gray-500); font-size: 0.875rem;">{{ isEditMode ? 'Update details for the corporate partner.' : 'Enter details for the new corporate partner.' }}</p>
          </div>
          <button class="btn-icon" (click)="closeAddModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-body" style="padding: 1.5rem;">
          <form [formGroup]="companyForm" (ngSubmit)="onSubmitCompany()">
            <div class="form-row" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group" style="flex: 1;">
                <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Company Name</label>
                <input type="text" class="form-control" formControlName="name" placeholder="Tech Company Inc">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Industry</label>
                <input type="text" class="form-control" formControlName="industry" placeholder="Technology">
              </div>
            </div>

            <div class="form-row" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group" style="flex: 1;">
                <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Email Address</label>
                <input type="email" class="form-control" formControlName="email" placeholder="contact@company.com" [readonly]="isEditMode">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Phone Number</label>
                <div style="display: flex; border: 1px solid var(--color-gray-300); border-radius: 8px; overflow: hidden;">
                  <div style="padding: 0 12px; background: var(--color-gray-50); display: flex; align-items: center; border-right: 1px solid var(--color-gray-300); cursor: pointer;" (click)="toggleCountryDropdown($event)">
                    <img *ngIf="selectedCountry?.flagUrl" [src]="selectedCountry?.flagUrl" style="width: 20px; height: 14px; margin-right: 6px;">
                    <span style="font-size: 0.875rem; font-weight: 500;">{{ selectedCountry?.mobileCode || '+91' }}</span>
                  </div>
                  <input type="text" class="form-control" style="border: none;" formControlName="phone" placeholder="Phone number" [attr.maxlength]="selectedCountry?.mobileNumberLength">
                </div>
                <div *ngIf="companyForm.get('phone')?.touched && companyForm.get('phone')?.invalid" class="validation-error" style="color: var(--color-error); font-size: 0.75rem; margin-top: 4px;">
                  <span *ngIf="companyForm.get('phone')?.hasError('required')">Phone number is required.</span>
                  <span *ngIf="companyForm.get('phone')?.hasError('minlength') || companyForm.get('phone')?.hasError('maxlength')">
                    Phone number must be exactly {{ selectedCountry?.mobileNumberLength }} digits for {{ selectedCountry?.countryName }}.
                  </span>
                  <span *ngIf="companyForm.get('phone')?.hasError('pattern')">Only numeric digits allowed.</span>
                </div>
              </div>
            </div>

            <div class="form-row" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group" style="flex: 1;">
                <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Contact First Name</label>
                <input type="text" class="form-control" formControlName="firstName" placeholder="John">
              </div>
              <div class="form-group" style="flex: 1;">
                <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Contact Last Name</label>
                <input type="text" class="form-control" formControlName="lastName" placeholder="Doe">
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Website</label>
              <input type="text" class="form-control" formControlName="website" placeholder="https://example.com">
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Address</label>
              <textarea class="form-control" formControlName="address" placeholder="123 Business St, City, State" rows="2"></textarea>
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Branch</label>
              <select class="form-control" formControlName="branchId">
                <option value="" disabled>Select Branch</option>
                <option *ngFor="let branch of branches" [value]="branch.id">{{ branch.name }}</option>
              </select>
            </div>

            <div class="modal-footer" style="margin-top: 2rem; display: flex; justify-content: flex-end; gap: 12px;">
              <button type="button" class="btn btn-secondary" (click)="closeAddModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="companyForm.invalid || submitting">
                {{ isEditMode ? 'Save Changes' : 'Create Company' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Company Detail Modal -->
    <div class="modal-overlay" *ngIf="showDetailModal" (click)="closeDetailModal()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 600px;">
        <div class="modal-header" style="background: linear-gradient(135deg, #667cb0 0%, #4a5d8a 100%); color: white; padding: 2.5rem;">
          <div style="display: flex; align-items: center; gap: 1.5rem; width: 100%;">
            <div class="avatar-circle" style="width: 64px; height: 64px; font-size: 1.5rem; background: rgba(255,255,255,0.2); border: 2px solid white;">
              {{ (selectedCompany?.companyDetails?.companyName || selectedCompany?.name || 'C').charAt(0) }}
            </div>
            <div>
              <h2 style="margin: 0; color: white; font-size: 1.5rem;">{{ selectedCompany?.companyDetails?.companyName || selectedCompany?.name }}</h2>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <span style="background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem;">{{ selectedCompany?.companyDetails?.industry }}</span>
                <span style="background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 6px; font-size: 0.75rem;">{{ selectedCompany?.status }}</span>
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
              <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Contact Person</span>
              <span class="entity-name" style="margin-top: 4px;">{{ selectedCompany?.companyDetails?.contactPerson }}</span>
            </div>
            <div class="entity-info">
              <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Email</span>
              <span class="entity-name" style="margin-top: 4px;">{{ selectedCompany?.email }}</span>
            </div>
            <div class="entity-info">
              <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Phone</span>
              <span class="entity-name" style="margin-top: 4px;">{{ selectedCompany?.phone }}</span>
            </div>
            <div class="entity-info">
              <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Branch</span>
              <span class="entity-name" style="margin-top: 4px;">{{ selectedCompany?.branch?.name }}</span>
            </div>
            <div class="entity-info" style="grid-column: span 2;">
              <span class="entity-subtext" style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.7rem; font-weight: 700;">Address</span>
              <span class="entity-name" style="margin-top: 4px;">{{ selectedCompany?.companyDetails?.address }}</span>
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
  `]
})
export class CompanyListComponent implements OnInit {
  private companyService = inject(CompanyService);
  private branchService = inject(BranchService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private countryService = inject(CountryService);
  private fb = inject(FormBuilder);

  companyForm: FormGroup;
  countryCodes: CountryMobileCode[] = [];
  selectedCountry: CountryMobileCode | null = null;
  isCountryDropdownOpen = false;
  editingCompanyId: string | number | null = null;

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
  showAdvancedFilters = false;
  filterBranch = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  private searchSubject = new Subject<string>();

  constructor() {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      industry: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dialCode: ['+91', Validators.required],
      phone: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      website: ['', Validators.required],
      address: ['', Validators.required],
      branchId: ['', Validators.required]
    });
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
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isCountryDropdownOpen = false;
    }
    // Handle action dropdown close
    this.openDropdownId = null;
  }

  toggleCountryDropdown(event: Event) {
    event.stopPropagation();
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }

  selectCountry(country: CountryMobileCode, event: Event) {
    if (event.type !== 'init') event.stopPropagation();
    this.selectedCountry = country;
    this.companyForm.get('dialCode')?.setValue(country.mobileCode);
    this.isCountryDropdownOpen = false;
    this.updatePhoneValidation();
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadCompanies();
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterBranch = '';
    this.onFilterChange();
  }

  updatePhoneValidation() {
    const phoneControl = this.companyForm.get('phone');
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
    this.loadCountryCodes();

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
        this.isLoading = false;
        this.companies = [];
      }
    });
  }

  getInitials(name?: string): string {
    if (!name || name.trim() === '') return 'C';
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
    this.editingCompanyId = null;
    this.companyForm.reset({
      name: '',
      industry: '',
      email: '',
      dialCode: this.selectedCountry?.mobileCode || '+91',
      phone: '',
      firstName: '',
      lastName: '',
      website: '',
      address: '',
      branchId: ''
    });
    this.showAddModal = true;
  }

  openEditModal(comp: Company) {
    this.isEditMode = true;
    this.editingCompanyId = comp.id || null;
    
    const contactPerson = comp.companyDetails?.contactPerson || comp.contactPerson || '';
    const nameParts = contactPerson.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Extract dial code and phone
    let dialCode = '+91';
    let phone = comp.phone || '';
    
    const matchedCountry = this.countryCodes.find(c => phone.startsWith(c.mobileCode));
    if (matchedCountry) {
      dialCode = matchedCountry.mobileCode;
      phone = phone.substring(dialCode.length);
      this.selectedCountry = matchedCountry;
    }

    this.companyForm.patchValue({
      name: comp.companyDetails?.companyName || comp.name || comp.firstName,
      industry: comp.companyDetails?.industry || comp.industry,
      email: comp.email,
      dialCode: dialCode,
      phone: phone,
      firstName: firstName,
      lastName: lastName,
      website: comp.companyDetails?.website || comp.website,
      address: comp.companyDetails?.address || comp.address,
      branchId: comp.branch?.id || comp.branchId
    });
    
    this.updatePhoneValidation();
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
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.companyForm.value;
    
    const companyData: Partial<Company> = {
      name: formValue.name,
      industry: formValue.industry,
      email: formValue.email,
      phone: `${formValue.dialCode}${formValue.phone}`,
      mobileCountryCodeId: this.selectedCountry?.id,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      contactPerson: `${formValue.firstName} ${formValue.lastName}`,
      website: formValue.website,
      address: formValue.address,
      branchId: Number(formValue.branchId),
      assignedTo: 1 // Default or from logic
    };

    if (this.isEditMode && this.editingCompanyId) {
      this.companyService.updateCompany(this.editingCompanyId, companyData).subscribe({
        next: () => {
          this.submitting = false;
          this.showAddModal = false;
          this.loadCompanies();
          this.notificationService.showModal(
            'Company Updated',
            'Company partner details have been successfully updated.',
            undefined,
            'success'
          );
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(err.message || 'Failed to update company');
        }
      });
    } else {
      this.companyService.createCompany(companyData).subscribe({
        next: () => {
          this.submitting = false;
          this.showAddModal = false;
          this.loadCompanies();
          this.notificationService.showModal(
            'Company Created!',
            'The corporate partner has been successfully registered.',
            'Access credentials have been shared to the company\'s email address. They can now access the partner portal.'
          );
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(err.message || 'Failed to create company');
        }
      });
    }
  }
}
