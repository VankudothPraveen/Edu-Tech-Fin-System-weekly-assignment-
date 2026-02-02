import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';
import { UserRole } from '../models/user';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  // Check role-based access
  const requiredRole = route.data['role'] as UserRole;
  if (requiredRole && !authService.hasRole(requiredRole)) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
