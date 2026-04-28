import { HttpInterceptorFn, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';

let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Skip loading for certain requests
  if (shouldSkipLoading(req)) {
    return next(req);
  }

  activeRequests++;
  
  // Show loading indicator
  if (activeRequests === 1) {
    loadingService.show('Loading data...', 'dot-circle', 'md');
  }

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      
      if (activeRequests === 0) {
        loadingService.hide();
      }
    })
  );
};

function shouldSkipLoading(req: HttpRequest<any>): boolean {
  const skipUrls = [
    '/health',
    '/status',
    '/ping',
    '/notifications',
    '/auth/refresh'
  ];
  
  return skipUrls.some(url => req.url.includes(url)) || 
         req.headers.has('X-Skip-Loading');
}
