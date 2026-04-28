import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  type?: 'dot-circle' | 'spinner' | 'pulse' | 'dots';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
    message: 'Loading...',
    type: 'dot-circle',
    size: 'md'
  });

  public loading$: Observable<LoadingState> = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Show loading indicator
   */
  show(message?: string, type?: LoadingState['type'], size?: LoadingState['size']): void {
    this.loadingSubject.next({
      isLoading: true,
      message: message || 'Loading...',
      type: type || 'dot-circle',
      size: size || 'md'
    });
  }

  /**
   * Hide loading indicator
   */
  hide(): void {
    this.loadingSubject.next({
      isLoading: false,
      message: 'Loading...',
      type: 'dot-circle',
      size: 'md'
    });
  }

  /**
   * Get current loading state
   */
  get currentLoadingState(): LoadingState {
    return this.loadingSubject.value;
  }

  /**
   * Execute a function with automatic loading indicator
   */
  async withLoading<T>(
    fn: () => Promise<T> | Observable<T>,
    message?: string,
    type?: LoadingState['type'],
    size?: LoadingState['size']
  ): Promise<T> {
    this.show(message, type, size);
    
    try {
      const result = fn();
      return result instanceof Promise ? await result : await lastValueFrom(result);
    } finally {
      this.hide();
    }
  }
}
