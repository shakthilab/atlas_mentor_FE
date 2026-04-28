import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUserValue;

  if (currentUser && currentUser.status === 'ACTIVE') {
    // Check if route has roles restricted
    const expectedRoles = (route.data['roles'] as Array<string>)?.map(r => r.toUpperCase());
    const userRole = currentUser.role?.toUpperCase();

    if (expectedRoles && (!userRole || !expectedRoles.includes(userRole))) {
      // Role not authorized, redirect to home
      router.navigate(['/']);
      return false;
    }
    return true;
  }

  // Not logged in so redirect to login page with the return url
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
