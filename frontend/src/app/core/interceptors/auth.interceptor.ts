// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('=== AUTH INTERCEPTOR ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Token présent:', !!token);
  if (token) {
    console.log('Token length:', token.length);
    console.log('Token starts with:', token.substring(0, 20) + '...');
  } else {
    console.log('Token est NULL ou UNDEFINED');
  }
  console.log('Headers avant:', req.headers.keys());

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Headers après:', clonedReq.headers.keys());
    console.log('Authorization header:', clonedReq.headers.get('Authorization') ? 'OUI' : 'NON');
    return next(clonedReq);
  } else {
    console.warn('⚠️ AUCUN TOKEN - Requête sans authentification!');
    return next(req);
  }
};