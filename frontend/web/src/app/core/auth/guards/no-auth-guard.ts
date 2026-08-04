import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth-store';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    const isDemo = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo') === '1';
    return router.createUrlTree([isDemo ? '/demo/home' : '/home']);
  }

  return true;
};
