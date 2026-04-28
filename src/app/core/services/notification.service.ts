import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toasts: Toast[] = [];
  private toastSubject = new Subject<Toast[]>();
  public toasts$ = this.toastSubject.asObservable();
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000) {
    const id = this.nextId++;
    const toast: Toast = { id, message, type };
    this.toasts.push(toast);
    this.toastSubject.next([...this.toasts]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastSubject.next([...this.toasts]);
  }
}
