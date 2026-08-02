import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthStateService } from '../store/auth-state.service';
import { UserRole } from '../models/models';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authState = inject(AuthStateService);
  const router    = inject(Router);

  if (!authState.isAuthenticated()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: route.url.join('/') }
    });
    return false;
  }

  // Role-based check — define roles in route data: { roles: ['admin', 'manager'] }
  const requiredRoles = route.data?.['roles'] as UserRole[] | undefined;
  if (requiredRoles?.length) {
    const hasRole = requiredRoles.some(r => authState.hasRole(r));
    if (!hasRole) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};

export const guestGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router    = inject(Router);

  if (authState.isAuthenticated()) {
    // Redirect logged-in users away from auth pages
    const roles = authState.userRoles();
    if (roles.includes('owner') || roles.includes('admin') || roles.includes('manager')) {
      router.navigate(['/admin']);
    } else if (roles.includes('specialist')) {
      router.navigate(['/employee']);
    } else {
      router.navigate(['/customer']);
    }
    return false;
  }

  return true;
};

export const roleGuard = (roles: UserRole[]): CanActivateFn => () => {
  const authState = inject(AuthStateService);
  const router    = inject(Router);

  if (!authState.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!roles.some(r => authState.hasRole(r))) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
