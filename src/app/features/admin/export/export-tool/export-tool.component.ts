import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-export-tool',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-container">
      <div class="module-header">
        <div>
          <h1 class="page-title">Export Data</h1>
          <p class="page-subtitle">Generate and download reports in various formats.</p>
        </div>
      </div>

      <div class="export-card shadow-premium">
        <div class="export-section">
          <h3 class="section-title">1. Select Data Module</h3>
          <div class="module-selector">
            <div class="selector-card" [class.active]="selectedModule === 'students'" (click)="selectedModule = 'students'">
              <span class="material-icons">graduation_cap</span>
              <span class="label">Students</span>
            </div>
            <div class="selector-card" [class.active]="selectedModule === 'tasks'" (click)="selectedModule = 'tasks'">
              <span class="material-icons">check_square</span>
              <span class="label">Tasks</span>
            </div>
            <div class="selector-card" [class.active]="selectedModule === 'payments'" (click)="selectedModule = 'payments'">
              <span class="material-icons">credit_card</span>
              <span class="label">Payments</span>
            </div>
            <div class="selector-card" [class.active]="selectedModule === 'employees'" (click)="selectedModule = 'employees'">
              <span class="material-icons">users</span>
              <span class="label">Employees</span>
            </div>
          </div>
        </div>

        <div class="export-section">
          <h3 class="section-title">2. Apply Filters</h3>
          <div class="filters-grid">
            <div class="form-group">
              <label>Date Range</label>
              <select class="form-control">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Custom Range</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status Filter</label>
              <select class="form-control">
                <option>All Statuses</option>
                <option>Active / Completed Only</option>
              </select>
            </div>
          </div>
        </div>

        <div class="export-section">
          <h3 class="section-title">3. Export Format</h3>
          <div class="format-options">
            <label class="format-radio">
              <input type="radio" name="format" value="csv" checked>
              <div class="radio-box">
                <span class="format-icon csv">CSV</span>
                <span class="format-label">Comma Separated Values</span>
              </div>
            </label>
            <label class="format-radio">
              <input type="radio" name="format" value="xlsx">
              <div class="radio-box">
                <span class="format-icon xls">XLSX</span>
                <span class="format-label">Microsoft Excel Format</span>
              </div>
            </label>
          </div>
        </div>

        <div class="export-footer">
          <button class="btn btn-secondary">Reset</button>
          <button class="btn btn-primary">
            <span class="material-icons">download</span>
            Generate and Download
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
   
   
   
   

    .export-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--color-gray-200); padding: 2.5rem; box-shadow: var(--shadow-sm); }
    .export-section { margin-bottom: 3rem; }
    .section-title { font-size: 1.125rem; font-weight: 600; color: var(--color-gray-900); margin-bottom: 1.5rem; }
    
    .module-selector { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .selector-card { background: white; border: 1px solid var(--color-gray-200); border-radius: var(--radius-xl); padding: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; cursor: pointer; transition: all var(--transition-fast); }
    .selector-card:hover { border-color: var(--color-primary); background: var(--color-gray-50); }
    .selector-card.active { border-color: var(--color-primary); background: var(--color-primary-light); border-width: 2px; }
    .selector-card span.material-icons { font-size: 32px; color: var(--color-gray-400); }
    .selector-card.active span.material-icons { color: var(--color-primary); }
    .selector-card .label { font-size: 0.875rem; font-weight: 600; color: var(--color-gray-700); }
    .selector-card.active .label { color: var(--color-primary); }

   
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--color-gray-700); }
    .form-control { padding: 0.625rem 0.875rem; border-radius: var(--radius-md); border: 1px solid var(--color-gray-300); background: white; font-size: 0.95rem; outline: none; transition: all var(--transition-fast); box-shadow: var(--shadow-xs); }

    .format-options { display: flex; flex-direction: column; gap: 1rem; }
    .format-radio { cursor: pointer; display: block; }
    .format-radio input { display: none; }
    .radio-box { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--color-gray-200); border-radius: var(--radius-lg); transition: all var(--transition-fast); box-shadow: var(--shadow-xs); }
    .format-radio:hover .radio-box { border-color: var(--color-primary-border); background: var(--color-gray-50); }
    .format-radio input:checked + .radio-box { border-color: var(--color-primary); background: var(--color-primary-light); border-width: 2px; }
    
    .format-icon { width: 48px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; color: white; }
    .format-icon.csv { background: var(--color-gray-600); }
    .format-icon.xls { background: #12b76a; }
    .format-label { font-size: 0.9375rem; font-weight: 600; color: var(--color-gray-700); }
    .format-radio input:checked + .radio-box .format-label { color: var(--color-primary); }

    .export-footer { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 2rem; border-top: 1px solid var(--color-gray-200); }


    @media (max-width: 768px) {
      .module-selector { grid-template-columns: repeat(2, 1fr); }
     
    }
  `]
})
export class ExportToolComponent {
  selectedModule = 'students';
}
