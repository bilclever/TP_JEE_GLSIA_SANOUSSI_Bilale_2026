// error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const toast = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';
      let shouldShowToast = true;

      // Ne pas afficher de toast pour les erreurs d'authentification
      // car elles sont gérées dans les composants
      const isAuthEndpoint = req.url.includes('/auth/login') || 
                             req.url.includes('/auth/register') ||
                             req.url.includes('/auth/logout') ||
                             req.url.includes('/auth/change-password');

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Erreur côté serveur
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Requête invalide';
            if (isAuthEndpoint) {
              shouldShowToast = false;
            }
            break;
          case 401:
            // Toujours désactiver pour les endpoints auth
            if (isAuthEndpoint) {
              shouldShowToast = false;
            } else {
              errorMessage = 'Session expirée. Veuillez vous reconnecter.';
              authService.logout().subscribe();
              router.navigate(['/login']);
            }
            break;
          case 403:
            errorMessage = 'Accès refusé';
            // Ne pas afficher pour les endpoints auth ni pour les agents
            const userRole = authService.getCurrentUser()?.role;
            if (isAuthEndpoint || userRole === 'AGENT') {
              shouldShowToast = false;
            }
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            if (isAuthEndpoint) {
              shouldShowToast = false;
            }
            break;
          default:
            errorMessage = error.error?.message || `Erreur ${error.status}`;
            if (isAuthEndpoint) {
              shouldShowToast = false;
            }
        }
      }

      // Afficher l'erreur seulement si nécessaire
      if (shouldShowToast) {
        toast.error(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
