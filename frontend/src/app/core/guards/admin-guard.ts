import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth';

// Un candidat qui essaie d'ouvrir une page admin est renvoyé vers sa page d'accueil.
// La vraie protection reste dans le backend (hasRole ADMIN).
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAdmin() ? true : router.createUrlTree([auth.homePath()]);
};