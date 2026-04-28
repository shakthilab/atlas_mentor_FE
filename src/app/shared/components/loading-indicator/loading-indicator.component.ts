import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoadingIndicatorType = 'dot-circle' | 'spinner' | 'pulse' | 'dots';
export type LoadingIndicatorSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-indicator loading-indicator--{{ type }} loading-indicator--{{ size }}" [class.with-label]="label">
      <!-- Dot Circle Type -->
      <div *ngIf="type === 'dot-circle'" class="dot-circle-container">
        <div class="dot-circle">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <div *ngIf="label" class="loading-label">{{ label }}</div>
      </div>

      <!-- Spinner Type -->
      <div *ngIf="type === 'spinner'" class="spinner-container">
        <div class="spinner"></div>
        <div *ngIf="label" class="loading-label">{{ label }}</div>
      </div>

      <!-- Pulse Type -->
      <div *ngIf="type === 'pulse'" class="pulse-container">
        <div class="pulse"></div>
        <div *ngIf="label" class="loading-label">{{ label }}</div>
      </div>

      <!-- Dots Type -->
      <div *ngIf="type === 'dots'" class="dots-container">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div *ngIf="label" class="loading-label">{{ label }}</div>
      </div>
    </div>
  `,
  styleUrl: './loading-indicator.component.css'
})
export class LoadingIndicatorComponent {
  @Input() type: LoadingIndicatorType = 'dot-circle';
  @Input() size: LoadingIndicatorSize = 'md';
  @Input() label?: string;
}
