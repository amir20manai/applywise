import { inject } from '@angular/core';

import { AuthService } from '../services/auth';

// Où envoyer quelqu'un qui tape "/" ou une adresse qui n'existe pas
export const homeRedirect = (): string => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? auth.homePath() : '/login';
};