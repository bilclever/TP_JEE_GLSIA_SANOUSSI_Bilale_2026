// role.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  const requiredRoles = route.data['roles'] as Array<string>;
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
    toastr.error('Vous n\'avez pas les droits nécessaires pour accéder à cette page', 'Accès refusé');
    router.navigate(['/transactions']);
    return false;
  }

  return true;
};
