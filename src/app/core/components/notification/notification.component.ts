import { Component, inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../services/notification.service';

@Pipe({
  name: 'filterToasts',
  standalone: true
})
export class FilterToastsPipe implements PipeTransform {
  transform(toasts: Toast[]): Toast[] {
    return toasts.filter(t => !t.isModal);
  }
}

@Pipe({
  name: 'filterModals',
  standalone: true
})
export class FilterModalsPipe implements PipeTransform {
  transform(toasts: Toast[]): Toast[] {
    return toasts.filter(t => t.isModal);
  }
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FilterToastsPipe, FilterModalsPipe],
  template: `
    <!-- Toasts (Top Right) -->
    <div class="toast-container">
      <div *ngFor="let toast of toasts | filterToasts" 
           class="toast" 
           [class.success]="toast.type === 'success'"
           [class.error]="toast.type === 'error'"
           [class.warning]="toast.type === 'warning'">
        <div class="d-flex align-items-center">
          <span class="material-icons me-2" [style.color]="getToastIconColor(toast.type)">
            {{ getIcon(toast.type) }}
          </span>
          <span style="font-weight: 500;">{{ toast.message }}</span>
        </div>
        <span class="material-icons text-sm" style="cursor: pointer; opacity: 0.6; margin-left: 1rem;" (click)="close(toast.id)">close</span>
      </div>
    </div>

    <!-- Modals (Center) -->
    <div *ngFor="let modal of toasts | filterModals" class="notif-modal-overlay" (click)="close(modal.id)">
      <div class="notif-modal-content" (click)="$event.stopPropagation()">
        <button class="notif-modal-close" (click)="close(modal.id)">
          <span class="material-icons">close</span>
        </button>
        
        <div class="notif-modal-body">
          <div class="notif-icon-wrap" [class.success]="modal.type === 'success'" [class.error]="modal.type === 'error'">
            <span class="material-icons">
              {{ modal.type === 'success' ? 'check_circle' : 'error' }}
            </span>
          </div>
          
          <h2 class="notif-title">{{ modal.title || (modal.type === 'success' ? 'Success!' : 'Oops!') }}</h2>
          <p class="notif-message">{{ modal.message }}</p>
          
          <div *ngIf="modal.longMessage" class="notif-long-message">
            {{ modal.longMessage }}
          </div>
          
          <button class="notif-btn" [class.success]="modal.type === 'success'" [class.error]="modal.type === 'error'" (click)="close(modal.id)">
            {{ modal.type === 'success' ? 'Continue' : 'Try Again' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .me-2 { margin-right: 0.75rem; }
    .d-flex { display: flex; }
    .align-items-center { align-items: center; }
  `]
})
export class NotificationComponent implements OnInit {
  private notificationService = inject(NotificationService);
  toasts: Toast[] = [];

  ngOnInit() {
    this.notificationService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  close(id: number) {
    this.notificationService.remove(id);
  }

  getIcon(type: string): string {
    switch(type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  getToastIconColor(type: string): string {
    switch(type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return 'var(--color-primary)';
    }
  }
}
