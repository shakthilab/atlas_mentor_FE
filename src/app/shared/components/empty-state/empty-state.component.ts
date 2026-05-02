import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-container animate-fade-in">
      <div class="illustration-wrapper">
        <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Background Shape -->
          <circle cx="120" cy="100" r="90" fill="var(--color-gray-50)" />
          
          <!-- Document -->
          <rect x="75" y="45" width="70" height="95" rx="8" fill="white" stroke="var(--color-gray-200)" stroke-width="2"/>
          <rect x="90" y="65" width="40" height="3" rx="1.5" fill="var(--color-gray-100)"/>
          <rect x="90" y="78" width="40" height="3" rx="1.5" fill="var(--color-gray-100)"/>
          <rect x="90" y="91" width="25" height="3" rx="1.5" fill="var(--color-gray-100)"/>
          
          <!-- Magnifying Glass -->
          <circle cx="140" cy="115" r="32" fill="white" stroke="var(--color-primary)" stroke-width="3"/>
          <path d="M165 140L190 165" stroke="var(--color-primary)" stroke-width="8" stroke-linecap="round"/>
          <circle cx="140" cy="115" r="15" fill="var(--color-primary-light)"/>
          <path d="M134 109L146 121M146 109L134 121" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round"/>
          
          <!-- Decorative bits -->
          <circle cx="50" cy="60" r="3" fill="var(--color-gray-200)" />
          <circle cx="190" cy="50" r="2" fill="var(--color-gray-200)" />
          <circle cx="40" cy="140" r="2.5" fill="var(--color-gray-200)" />
        </svg>
      </div>
      
      <div class="content-wrapper">
        <h3 class="empty-title">{{ title }}</h3>
        <p class="empty-message">{{ message }}</p>
        
        <div class="action-area" *ngIf="showAction">
          <button class="btn btn-primary shadow-sm" (click)="onActionClick()">
            <span class="material-icons">{{ actionIcon }}</span>
            {{ actionText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      text-align: center;
      background: #ffffff;
      border-radius: var(--radius-xl);
      border: 1px dashed var(--color-gray-200);
      width: 100%;
      min-height: 450px;
      transition: all var(--transition-normal);
      overflow: hidden;
    }

    .empty-state-container:hover {
      border-color: var(--color-primary-border);
      background: var(--color-gray-50);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .illustration-wrapper {
      margin-bottom: 2.5rem;
      position: relative;
    }

    /* SVG Animations */
    .illustration-wrapper svg circle:first-child {
      animation: pulse 4s ease-in-out infinite;
    }

    .illustration-wrapper svg rect:first-child {
      animation: float 6s ease-in-out infinite;
    }

    .illustration-wrapper svg g.magnifying-glass, 
    .illustration-wrapper svg circle:nth-of-type(2),
    .illustration-wrapper svg path:first-of-type,
    .illustration-wrapper svg circle:nth-of-type(3),
    .illustration-wrapper svg path:nth-of-type(2) {
      /* Targeting the magnifying glass components */
      animation: float-alt 5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { fill: var(--color-gray-50); r: 90; }
      50% { fill: var(--color-primary-light); r: 95; opacity: 0.5; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes float-alt {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(5px, -5px); }
    }

    .content-wrapper {
      max-width: 480px;
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-gray-900);
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }

    .empty-message {
      font-size: 1rem;
      color: var(--color-gray-500);
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .action-area {
      display: flex;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    
    .btn:hover {
      transform: scale(1.05);
      box-shadow: var(--shadow-md);
    }

    .animate-fade-in {
      animation: fadeIn 0.6s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 640px) {
      .empty-state-container {
        padding: 3rem 1.5rem;
        min-height: 350px;
      }
      .empty-title {
        font-size: 1.25rem;
      }
      .illustration-wrapper svg {
        width: 180px;
        height: auto;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() title: string = 'No Data Found';
  @Input() message: string = 'There is no data to show you right now';
  @Input() showAction: boolean = false;
  @Input() actionText: string = 'Add New';
  @Input() actionIcon: string = 'add';
  
  @Output() actionClick = new EventEmitter<void>();

  onActionClick() {
    this.actionClick.emit();
  }
}
