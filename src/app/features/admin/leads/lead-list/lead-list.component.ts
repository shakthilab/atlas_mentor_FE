import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RoleConfigService } from '../../../../core/services/role-config.service';

@Component({
  selector: 'app-lead-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, EmptyStateComponent],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div class="header-left">
          <h1 class="page-title">{{ roleConfig.getRoleSpecificTitle('Leads') }}</h1>
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
          <button class="btn btn-primary" (click)="addLead()">
            <span class="material-icons">person_add</span>
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      <!-- Stats row for leads -->
      <div class="stats-grid">
        <div class="stat-mini-card">
          <span class="label">Total Leads</span>
          <span class="value">{{ leads.length }}</span>
        </div>
        <div class="stat-mini-card">
          <span class="label">New This Week</span>
          <span class="value orange">{{ newLeadsCount }}</span>
        </div>
        <div class="stat-mini-card">
          <span class="label">Conversion Rate</span>
          <span class="value">{{ conversionRate }}%</span>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-card">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search by name, email or phone..." [(ngModel)]="searchQuery">
        </div>
        <div class="filter-actions">
          <select class="filter-select" [(ngModel)]="filterStatus">
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
          <select class="filter-select" [(ngModel)]="filterSource">
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Email">Email</option>
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
            <label>Country</label>
            <select [(ngModel)]="filterCountry">
              <option value="">All Countries</option>
              <option value="Germany">Germany</option>
              <option value="UK">UK</option>
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Lead Date From</label>
            <input type="date" [(ngModel)]="filterDateFrom">
          </div>
          <div class="filter-group">
            <label>Lead Date To</label>
            <input type="date" [(ngModel)]="filterDateTo">
          </div>
          <div class="filter-group">
            <button class="btn-ghost-sm" (click)="resetFilters()">Reset All Filters</button>
          </div>
        </div>
      </div>

      <app-empty-state 
        *ngIf="filteredLeads.length === 0"
        title="No Leads Found"
        message="There are currently no leads matching your criteria. Try adjusting your filters or add a new lead."
        [showAction]="true"
        actionText="Add Lead"
        (actionClick)="addLead()">
      </app-empty-state>

      <!-- List View -->
      <div class="table-card" *ngIf="filteredLeads.length > 0 && viewMode === 'list'">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Source</th>
                <th>Country</th>
                <th>Lead Date</th>
                <th>Assigned To</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let lead of filteredLeads" (click)="viewDetail(lead.id)" class="clickable-row">
                <td>
                  <div class="entity-meta">
                    <div class="avatar-circle" [style.background]="getAvatarColor(lead.name)">
                      {{ getInitials(lead.name) }}
                    </div>
                    <div class="entity-info">
                      <span class="entity-name">{{ lead.name }}</span>
                      <span class="entity-subtext">#{{ lead.id }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="entity-info">
                    <span class="entity-name" style="font-weight: 500;">{{ lead.phone }}</span>
                    <span class="entity-subtext">{{ lead.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge-status" [ngClass]="getStatusClass(lead.status)">
                    {{ lead.status }}
                  </span>
                </td>
                <td>
                  <span class="badge-status gray">{{ lead.source }}</span>
                </td>
                <td>{{ lead.country }}</td>
                <td>{{ lead.leadDate }}</td>
                <td>{{ lead.assignedTo }}</td>
                <td style="text-align: right;">
                  <div class="action-btns" (click)="$event.stopPropagation()">
                    <button class="btn-icon" (click)="convertLead(lead.id)" title="Convert to Student">
                      <span class="material-icons">how_to_reg</span>
                    </button>
                    <button class="btn-icon" (click)="editLead(lead.id)" title="Edit Lead">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon" style="color: var(--color-error);" (click)="deleteLead(lead.id)" title="Delete Lead">
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
      <div class="grid-container" *ngIf="filteredLeads.length > 0 && viewMode === 'grid'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        <div class="table-card" *ngFor="let lead of filteredLeads | slice:0:displayedCardsCount" (click)="viewDetail(lead.id)" style="cursor: pointer; padding: 1.25rem; transition: all 0.2s;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div class="entity-meta">
              <div class="avatar-circle" [style.background]="getAvatarColor(lead.name)">
                {{ getInitials(lead.name) }}
              </div>
              <div class="entity-info">
                <span class="entity-name">{{ lead.name }}</span>
                <span class="entity-subtext">#{{ lead.id }}</span>
              </div>
            </div>
            <span class="badge-status" [ngClass]="getStatusClass(lead.status)">{{ lead.status }}</span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: var(--color-gray-50); border-radius: 8px;">
            <div class="entity-info">
              <span class="entity-subtext">Phone</span>
              <span class="entity-name" style="font-size: 0.8125rem;">{{ lead.phone }}</span>
            </div>
            <div class="entity-info">
              <span class="entity-subtext">Source</span>
              <span class="badge-status gray" style="align-self: flex-start; margin-top: 2px;">{{ lead.source }}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100);">
            <span class="entity-subtext">{{ lead.leadDate }}</span>
            <div class="action-btns" (click)="$event.stopPropagation()">
              <button class="btn-icon" (click)="convertLead(lead.id)" title="Convert to Student">
                <span class="material-icons">how_to_reg</span>
              </button>
              <button class="btn-icon">
                <span class="material-icons">more_vert</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div *ngIf="filteredLeads.length > displayedCardsCount" style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 1rem;">
          <button class="btn btn-secondary" (click)="loadMoreCards()">
            <span>Load More Leads</span>
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
  `]
})
export class LeadListComponent {
  router = inject(Router);
  roleConfig = inject(RoleConfigService);
  searchQuery = '';
  filterStatus = '';
  filterSource = '';
  filterCountry = '';
  filterDateFrom = '';
  filterDateTo = '';
  showAdvancedFilters = false;
  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;

  loadMoreCards() {
    this.displayedCardsCount += 10;
  }

  getRoleSpecificSubtitle(): string {
    const role = this.roleConfig.getCurrentUserRole();
    switch (role) {
      case 'ADMIN':
        return 'Manage and track prospective student leads.';
      case 'MANAGER':
        return 'Manage leads for your branch.';
      case 'COMPANY':
        return 'Manage leads generated by your company.';
      case 'REFERRAL':
        return 'Manage leads you have referred.';
      default:
        return 'Manage lead information.';
    }
  }

  leads = [
    { id: 'LD1001', name: 'Rohit Kumar', phone: '+91 9876543210', email: 'rohit@example.com', status: 'New', source: 'Website', country: 'Germany', leadDate: '15 Apr 2024', assignedTo: 'Siddharth Patel' },
    { id: 'LD1002', name: 'Anita Sharma', phone: '+91 8765432109', email: 'anita@example.com', status: 'Contacted', source: 'Referral', country: 'USA', leadDate: '14 Apr 2024', assignedTo: 'Rohan Gupta' },
    { id: 'LD1003', name: 'Vikram Singh', phone: '+91 7654321098', email: 'vikram@example.com', status: 'Qualified', source: 'Social Media', country: 'UK', leadDate: '13 Apr 2024', assignedTo: 'Siddharth Patel' },
    { id: 'LD1004', name: 'Priya Nair', phone: '+91 6543210987', email: 'priya@example.com', status: 'Converted', source: 'Email', country: 'Canada', leadDate: '12 Apr 2024', assignedTo: 'Admin' },
    { id: 'LD1005', name: 'Amit Joshi', phone: '+91 5432109876', email: 'amit@example.com', status: 'New', source: 'Website', leadDate: '11 Apr 2024', country: 'Australia', assignedTo: 'Rohan Gupta' },
    { id: 'LD1006', name: 'Kavita Reddy', phone: '+91 4321098765', email: 'kavita@example.com', status: 'Lost', source: 'Referral', country: 'Germany', leadDate: '10 Apr 2024', assignedTo: 'Siddharth Patel' }
  ];

  get newLeadsCount(): number {
    return this.leads.filter(lead => lead.status === 'New').length;
  }

  get conversionRate(): number {
    const converted = this.leads.filter(lead => lead.status === 'Converted').length;
    return Math.round((converted / this.leads.length) * 100);
  }

  get filteredLeads() {
    return this.leads.filter(lead => {
      const matchesSearch = !this.searchQuery || 
        lead.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        lead.phone.includes(this.searchQuery);
      
      const matchesStatus = !this.filterStatus || lead.status === this.filterStatus;
      const matchesSource = !this.filterSource || lead.source === this.filterSource;
      const matchesCountry = !this.filterCountry || lead.country === this.filterCountry;
      
      return matchesSearch && matchesStatus && matchesSource && matchesCountry;
    });
  }

  addLead() {
    // Navigate to add lead form or open modal
    console.log('Add new lead');
  }

  viewDetail(id: string) {
    console.log('View lead details:', id);
  }

  editLead(id: string) {
    console.log('Edit lead:', id);
  }

  convertLead(id: string) {
    console.log('Convert lead to student:', id);
  }

  deleteLead(id: string) {
    console.log('Delete lead:', id);
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterSource = '';
    this.filterCountry = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'new': return 'info';
      case 'contacted': return 'warning';
      case 'qualified': return 'primary';
      case 'converted': return 'success';
      case 'lost': return 'error';
      default: return 'gray';
    }
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
}
