import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">Student Management</h1>
          <p class="page-subtitle">Manage all student leads and registered accounts.</p>
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
          <button class="btn btn-primary" [routerLink]="['add']">
            <span class="material-icons">add</span>
            Add Student
          </button>
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
            <option value="Lead">Lead</option>
            <option value="Registered">Registered</option>
            <option value="Lost">Lost</option>
          </select>
          <select class="filter-select" [(ngModel)]="filterCountry">
            <option value="">All Countries</option>
            <option value="Germany">Germany</option>
            <option value="UK">UK</option>
            <option value="USA">USA</option>
          </select>
          <button class="btn btn-secondary">
            <span class="material-icons">filter_list</span>
            More Filters
          </button>
        </div>
      </div>

      <div class="empty-state-container" *ngIf="students.length === 0">
        <div class="empty-state-content">
          <span class="material-icons empty-icon">school</span>
          <h3>No Students Found</h3>
          <p>There are currently no students registered. Add your first student to get started.</p>
        </div>
      </div>

      <!-- Desktop Table Card View -->
      <div class="table-card" *ngIf="students.length > 0 && viewMode === 'list'">
        <div class="table-card-header">
          <div class="table-header-title">
            <h2>Student records</h2>
            <span class="count-badge">{{ students.length }} users</span>
          </div>
          <button class="btn-icon">
            <span class="material-icons">more_vert</span>
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table class="premium-table">
            <thead>
              <tr>
                <th style="width: 40px;"><input type="checkbox"></th>
                <th>Name</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th>Counsellor</th>
                <th>Country / University</th>
                <th>Joined Date</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of students" (click)="viewDetail(student.id)" class="clickable-row">
                <td><input type="checkbox"></td>
                <td>
                  <div class="student-meta">
                    <div class="avatar">{{ student.name.charAt(0) }}</div>
                    <div class="info">
                      <span class="name">{{ student.name }}</span>
                      <span class="id">#{{ student.id }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="contact-info">
                    <span>{{ student.phone }}</span>
                    <span class="email">{{ student.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="student.status.toLowerCase()">
                    {{ student.status }}
                  </span>
                </td>
                <td>{{ student.counsellor }}</td>
                <td>
                  <div class="edu-info">
                    <span>{{ student.country }}</span>
                    <span class="uni">{{ student.university }}</span>
                  </div>
                </td>
                <td>{{ student.date }}</td>
                <td style="text-align: right;">
                  <div class="action-group" (click)="$event.stopPropagation()">
                    <button class="btn-icon" [routerLink]="['edit', student.id]">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="btn-icon delete">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="table-card-footer">
          <button class="pagination-btn" disabled>
            <span class="material-icons">arrow_back</span>
            Previous
          </button>
          
          <div class="pagination-pages">
            <button class="page-num active">1</button>
            <button class="page-num">2</button>
            <button class="page-num">3</button>
            <span class="page-dots">...</span>
            <button class="page-num">10</button>
          </div>

          <button class="pagination-btn">
            Next
            <span class="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>

      <!-- Card View -->
      <div class="grid-view" *ngIf="students.length > 0 && viewMode === 'grid'">
        <div class="student-card" *ngFor="let student of students | slice:0:displayedCardsCount" (click)="viewDetail(student.id)">
          <div class="card-top">
            <div class="student-meta">
              <div class="avatar">{{ student.name.charAt(0) }}</div>
              <div class="info">
                <span class="name">{{ student.name }}</span>
                <span class="id">#{{ student.id }}</span>
              </div>
            </div>
            <span class="status-badge" [ngClass]="student.status.toLowerCase()">{{ student.status }}</span>
          </div>
          <div class="card-details">
            <div class="detail-item">
              <span class="label">Contact:</span>
              <span>{{ student.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="label">University:</span>
              <span>{{ student.university }}</span>
            </div>
          </div>
          <div class="card-footer">
            <span class="date">{{ student.date }}</span>
            <div class="actions">
              <button class="btn-icon" (click)="$event.stopPropagation()">
                <span class="material-icons">more_vert</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="load-more-container" *ngIf="students.length > displayedCardsCount">
          <button class="btn btn-secondary load-more-btn" (click)="loadMoreCards()">
            <span>Load More Students</span>
            <span class="material-icons">expand_more</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .module-container { padding-bottom: 2rem; width: 100%; overflow-x: hidden; }
    .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 1.875rem; font-weight: 600; color: var(--color-gray-900); margin: 0; }
    .page-subtitle { color: var(--color-gray-600); margin: 0.25rem 0 0; font-size: 1rem; }
    
    .empty-state-container { padding: 4rem 2rem; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--color-gray-300); text-align: center; display: flex; justify-content: center; align-items: center; margin-bottom: 2rem; width: 100%; }
    .empty-state-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .empty-icon { font-size: 3rem; color: var(--color-gray-300); margin-bottom: 0.5rem; }
    .empty-state-content h3 { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-800); margin: 0; }
    .empty-state-content p { color: var(--color-gray-500); margin: 0; font-size: 0.875rem; max-width: 300px; }
    
    /* Filters */
    .filters-card {
      background: white;
      padding: 1.25rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-gray-200);
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
      width: 100%;
    }
    .search-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      border: 1px solid var(--color-gray-300);
      padding: 0.625rem 0.875rem;
      border-radius: var(--radius-md);
      flex: 1;
      min-width: 200px;
      box-shadow: var(--shadow-xs);
      transition: all var(--transition-fast);
    }
    .search-bar:focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 4px var(--color-primary-light);
    }
    .search-bar .material-icons { color: var(--color-gray-400); font-size: 20px; }
    .search-bar input { background: none; border: none; width: 100%; font-size: 0.9375rem; color: var(--color-gray-900); outline: none; }
    .filter-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .filter-select { background: white; border: 1px solid var(--color-gray-300); padding: 0.625rem 0.875rem; border-radius: var(--radius-md); cursor: pointer; color: var(--color-gray-700); font-weight: 500; font-size: 0.875rem; outline: none; box-shadow: var(--shadow-xs); transition: all var(--transition-fast); }
    .filter-select:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-light); }


    .student-meta { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: 600; border: 1px solid var(--color-primary-border); }
    .info { display: flex; flex-direction: column; }
    .name { font-weight: 600; color: var(--color-gray-900); }
    .id { font-size: 0.75rem; color: var(--color-gray-500); }
    .contact-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .email { font-size: 0.8125rem; color: var(--color-gray-500); }
    .status-badge { padding: 0.125rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; display: inline-flex; border: 1px solid transparent; }
    .status-badge.registered { background: #ecfdf3; color: #027a48; border-color: #abefc6; }
    .status-badge.lead { background: #eff8ff; color: #175cd3; border-color: #b2ddff; }
    .status-badge.lost { background: #fef3f2; color: #b42318; border-color: #fecdca; }
    .uni { font-size: 0.8125rem; color: var(--color-gray-500); }
    .action-group { display: flex; gap: 0.25rem; justify-content: flex-end; }

    /* View Switcher */
    .view-switcher { display: flex; background: var(--color-gray-100); padding: 4px; border-radius: var(--radius-md); border: 1px solid var(--color-gray-200); }
    .switcher-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; color: var(--color-gray-500); cursor: pointer; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
    .switcher-btn .material-icons { font-size: 20px; }
    .switcher-btn:hover { color: var(--color-gray-700); }
    .switcher-btn.active { background: white; color: var(--color-gray-700); box-shadow: var(--shadow-sm); }

    /* Grid/Card View */
    .grid-view { width: 100%; }
    .student-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); padding: 1.25rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm); cursor: pointer; transition: all var(--transition-fast); }
    .student-card:hover { border-color: var(--color-primary); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .card-details { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .detail-item { display: flex; gap: 0.5rem; font-size: 0.875rem; }
    .label { color: var(--color-gray-500); font-weight: 500; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-gray-100); }
    .date { font-size: 0.75rem; color: var(--color-gray-500); }

    .load-more-container { display: flex; justify-content: center; margin-top: 2rem; margin-bottom: 2rem; }
    .load-more-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; font-weight: 600; }

    @media (max-width: 1024px) {
      .desktop-only { display: none !important; }
      .grid-view { display: block !important; }
      .filters-card { flex-direction: column; align-items: stretch; gap: 1rem; }
      .module-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .header-actions { width: 100%; justify-content: space-between; }
    }
  `]
})
export class StudentListComponent {
  router = inject(Router);
  searchQuery = '';
  filterStatus = '';
  filterCountry = '';
  viewMode: 'list' | 'grid' = 'list';
  displayedCardsCount = 10;

  loadMoreCards() {
    this.displayedCardsCount += 10;
  }

  students = [
    { id: 'ST1001', name: 'Mukul Sharma', phone: '+91 9876543210', email: 'mukul@example.com', status: 'Registered', counsellor: 'Siddharth Patel', country: 'Germany', university: 'Technical University of Munich', date: '12 Apr 2024' },
    { id: 'ST1002', name: 'Priya Rai', phone: '+91 8765432109', email: 'priya@example.com', status: 'Lead', counsellor: 'Rohan Gupta', country: 'USA', university: 'Stanford University', date: '10 Apr 2024' },
    { id: 'ST1003', name: 'Amit Kumar', phone: '+91 7654321098', email: 'amit@example.com', status: 'Lead', counsellor: 'Siddharth Patel', country: 'UK', university: 'Oxford University', date: '08 Apr 2024' },
    { id: 'ST1004', name: 'Sonal Singh', phone: '+91 6543210987', email: 'sonal@example.com', status: 'Lost', counsellor: 'Admin', country: 'Poland', university: 'University of Warsaw', date: '05 Apr 2024' },
    { id: 'ST1005', name: 'Rahul Verma', phone: '+91 5432109876', email: 'rahul@example.com', status: 'Registered', counsellor: 'Rohan Gupta', country: 'Canada', university: 'University of Toronto', date: '01 Apr 2024' }
  ];

  viewDetail(id: string) {
    this.router.navigate(['/admin/students', id]);
  }
}
