import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthCall = req.url.includes('/api/auth/');
  const token = auth.getToken();

  // Ajoute le token à toutes les requêtes sauf login/register
  const request =
    token && !isAuthCall
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Token expiré/invalide: on déconnecte (sauf pour login/register)
      if (error.status === 401 && !isAuthCall) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};