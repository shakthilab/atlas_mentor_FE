import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.currentUserValue?.token;

  // Add authorization header if token is available
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        // Check for the specific JWT token expired error format in successful responses
        const body = event.body as any;
        if (body && (body.error === 'JWT token expired' || body.message?.includes('Token has expired'))) {
          console.warn('AuthInterceptor: JWT Expired detected in 200 OK response');
          authService.handleSessionExpired();
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.error(`AuthInterceptor: Caught error ${error.status} for ${req.url}`, error);
      
      // Check for the specific JWT token expired error format in error responses
      // Any 401 is treated as a session expiration
      const isJwtExpired = 
        (error.status === 401) || 
        (error.error && typeof error.error === 'object' && 
          (error.error.error === 'JWT token expired' || 
           error.error.message?.includes('Token has expired'))) ||
        (typeof error.error === 'string' && 
          (error.error.includes('JWT token expired') || 
           error.error.includes('Token has expired')));

      if (isJwtExpired) {
        console.warn('AuthInterceptor: Session expired detected, calling handleSessionExpired()');
        authService.handleSessionExpired();
      }
      return throwError(() => error);
    })
  );
};
