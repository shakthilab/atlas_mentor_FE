import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule, LoadingIndicatorComponent],
  template: `
    <div class="global-loading-overlay" *ngIf="loadingState.isLoading" 
         [class.global-loading-overlay--fixed]="fixed">
      <div class="global-loading-backdrop"></div>
      <div class="global-loading-content">
        <app-loading-indicator 
          [type]="loadingState.type || 'dot-circle'"
          [size]="loadingState.size || 'md'"
          [label]="loadingState.message">
        </app-loading-indicator>
      </div>
    </div>
  `,
  styleUrl: './global-loading.component.css'
})
export class GlobalLoadingComponent {
  loadingState = this.loadingService.currentLoadingState;
  
  @Input() fixed: boolean = true;

  constructor(private loadingService: LoadingService) {}
}
