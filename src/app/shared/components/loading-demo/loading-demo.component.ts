import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-demo',
  standalone: true,
  imports: [CommonModule, LoadingIndicatorComponent],
  template: `
    <div class="loading-demo-container">
      <h2>Loading Indicators Demo</h2>
      
      <div class="demo-section">
        <h3>Dot Circle Types</h3>
        <div class="demo-grid">
          <div class="demo-item">
            <h4>Extra Small</h4>
            <app-loading-indicator type="dot-circle" size="xs" label="Loading..."></app-loading-indicator>
          </div>
          <div class="demo-item">
            <h4>Small</h4>
            <app-loading-indicator type="dot-circle" size="sm" label="Loading..."></app-loading-indicator>
          </div>
          <div class="demo-item">
            <h4>Medium</h4>
            <app-loading-indicator type="dot-circle" size="md" label="Loading..."></app-loading-indicator>
          </div>
          <div class="demo-item">
            <h4>Large</h4>
            <app-loading-indicator type="dot-circle" size="lg" label="Loading..."></app-loading-indicator>
          </div>
          <div class="demo-item">
            <h4>Extra Large</h4>
            <app-loading-indicator type="dot-circle" size="xl" label="Loading..."></app-loading-indicator>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>All Types (Medium Size)</h3>
        <div class="demo-grid">
          <div class="demo-item">
            <h4>Dot Circle</h4>
            <app-loading-indicator type="dot-circle" size="md" label="Loading..."></app-loading-indicator>
          </div>
          <div class="demo-item">
            <h4>Spinner</h4>
            <app-loading-indicator type="spinner" size="md" label="Loading..."></app-loading-indicator>
          </div>
          <div class="demo-item">
            <h4>Pulse</h4>
            <app-loading-indicator type="pulse" size="md" label="Loading..."></app-loading-indicator>
          </div>
          <div class="demo-item">
            <h4>Dots</h4>
            <app-loading-indicator type="dots" size="md" label="Loading..."></app-loading-indicator>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>Global Loading Demo</h3>
        <div class="demo-actions">
          <button (click)="showGlobalLoading()" class="demo-btn">
            Show Global Loading (2 seconds)
          </button>
          <button (click)="showGlobalLoadingWithCustom()" class="demo-btn">
            Show Custom Global Loading (3 seconds)
          </button>
          <button (click)="simulateApiCall()" class="demo-btn">
            Simulate API Call
          </button>
        </div>
        <p *ngIf="message" class="demo-message">{{ message }}</p>
      </div>
    </div>
  `,
  styleUrl: './loading-demo.component.css'
})
export class LoadingDemoComponent {
  message = '';

  constructor(private loadingService: LoadingService) {}

  showGlobalLoading() {
    this.message = '';
    this.loadingService.show('Loading data...', 'dot-circle', 'md');
    
    setTimeout(() => {
      this.loadingService.hide();
      this.message = 'Global loading completed!';
    }, 2000);
  }

  showGlobalLoadingWithCustom() {
    this.message = '';
    this.loadingService.show('Processing request...', 'spinner', 'lg');
    
    setTimeout(() => {
      this.loadingService.hide();
      this.message = 'Custom loading completed!';
    }, 3000);
  }

  async simulateApiCall() {
    this.message = '';
    
    try {
      await this.loadingService.withLoading(
        async () => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          return { data: 'API call successful!' };
        },
        'Making API call...',
        'dots',
        'sm'
      );
      
      this.message = 'API call completed successfully!';
    } catch (error) {
      this.message = 'API call failed!';
    }
  }
}
