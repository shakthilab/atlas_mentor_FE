import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../../core/services/branch.service';
import { Branch } from '../../../core/models/branch.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-branch-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="branch-filter" *ngIf="isAdmin()">
      <label class="filter-label">Branch</label>
      <select 
        class="form-control branch-select" 
        [(ngModel)]="selectedBranchId" 
        (change)="onBranchChange()"
        [disabled]="loading">
        <option value="">{{ placeholder }}</option>
        <option *ngFor="let branch of branches" [value]="branch.id">
          {{ branch.name }}
        </option>
      </select>
    </div>
  `,
  styles: [`
    .branch-filter {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 180px;
    }

    .filter-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #475467;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .branch-select {
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.875rem;
      color: #101828;
      outline: none;
      transition: all 0.2s;
      background: white;
    }

    .branch-select:focus {
      border-color: #667cb0;
      box-shadow: 0 0 0 4px rgba(102, 124, 176, 0.1);
    }

    .branch-select:disabled {
      background: #f8fafc;
      color: #6b7280;
      cursor: not-allowed;
    }
  `]
})
export class BranchFilterComponent implements OnInit {
  @Input() selectedBranchId: string = '';
  @Input() placeholder: string = 'All Branches';
  @Input() loading: boolean = false;
  @Output() branchChange = new EventEmitter<string | null>();

  branches: Branch[] = [];
  
  private authService = inject(AuthService);
  private branchService = inject(BranchService);

  ngOnInit() {
    this.loadBranches();
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role?.toUpperCase() === 'ADMIN';
  }

  /**
   * Load all branches for admin users
   */
  loadBranches() {
    if (!this.isAdmin()) {
      return;
    }

    this.loading = true;
    this.branchService.getAllBranches().subscribe({
      next: (branches) => {
        this.branches = branches;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Handle branch selection change
   */
  onBranchChange() {
    const branchId = this.selectedBranchId || null;
    this.branchChange.emit(branchId);
  }
}
