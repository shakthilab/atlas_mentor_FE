import { Component } from '@angular/core';
import { LoadingIndicatorComponent } from './loading-indicator.component';

@Component({
  selector: 'app-dot-circle-with-label-demo',
  standalone: true,
  imports: [LoadingIndicatorComponent],
  template: `
    <div class="demo-container">
      <h3>Dot Circle with Label Demo</h3>
      <app-loading-indicator type="dot-circle" size="md" label="Loading..."></app-loading-indicator>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      text-align: center;
    }
    
    h3 {
      margin-bottom: 1rem;
      color: #374151;
    }
  `]
})
export class DotCircleWithLabelDemo {}
