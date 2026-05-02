import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  longMessage?: string;
  isModal?: boolean;
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

  show(
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info', 
    duration: number = 3000,
    title?: string,
    longMessage?: string,
    isModal: boolean = false
  ) {
    const id = this.nextId++;
    const toast: Toast = { id, message, type, title, longMessage, isModal };
    this.toasts.push(toast);
    this.toastSubject.next([...this.toasts]);

    // Modals should probably stay until closed manually, but we keep duration logic for toasts
    if (duration > 0 && !isModal) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, duration?: number, title?: string, longMessage?: string, isModal: boolean = false) {
    this.show(message, 'success', duration, title, longMessage, isModal);
  }

  error(message: string, duration?: number, title?: string, longMessage?: string, isModal: boolean = false) {
    this.show(message, 'error', duration, title, longMessage, isModal);
  }

  showModal(title: string, message: string, longMessage?: string, type: 'success' | 'error' = 'success') {
    this.show(message, type, 0, title, longMessage, true);
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
