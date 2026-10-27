import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ENVIRONMENT_TOKEN } from '../../../../environments/environment-model';
import { AuthStore } from '../auth-store';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (inject(ENVIRONMENT_TOKEN).showcase || auth.isDemo()) {
    return router.createUrlTree(['/']);
  }

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(
      ['/login'],
      { queryParams: { returnUrl: state.url } }
    );
  }

  return true;
};

