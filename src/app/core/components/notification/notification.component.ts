import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast" 
           [class.success]="toast.type === 'success'"
           [class.error]="toast.type === 'error'">
        <div class="d-flex align-items-center">
          <span class="material-icons me-2" style="font-size: 20px;">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
          </span>
          <span>{{ toast.message }}</span>
        </div>
        <span class="material-icons text-sm" style="cursor: pointer; opacity: 0.6;" (click)="close(toast.id)">close</span>
      </div>
    </div>
  `,
  styles: [`
    .me-2 { margin-right: 0.5rem; }
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
}
