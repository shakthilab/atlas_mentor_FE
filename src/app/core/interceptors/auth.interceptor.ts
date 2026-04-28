import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        // Check for the specific JWT token expired error format in successful responses (some APIs return 200 for errors)
        const body = event.body as any;
        if (body && (body.error === 'JWT token expired' || body.message?.includes('Token has expired'))) {
          console.log('JWT Expired detected in 200 OK response');
          authService.handleSessionExpired();
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.log('Auth Interceptor caught error:', error.status, error.error);
      
      // Check for the specific JWT token expired error format in error responses
      const isJwtExpired = 
        (error.status === 401) || 
        (error.error && typeof error.error === 'object' && 
          (error.error.error === 'JWT token expired' || 
           error.error.message === 'Token has expired. Please login again.')) ||
        (typeof error.error === 'string' && 
          (error.error.includes('JWT token expired') || 
           error.error.includes('Token has expired')));

      if (isJwtExpired) {
        console.log('JWT Expired detected, calling handleSessionExpired()');
        authService.handleSessionExpired();
      }
      return throwError(() => error);
    })
  );
};
