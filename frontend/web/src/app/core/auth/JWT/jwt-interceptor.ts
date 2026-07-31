import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../auth-store';
import { ToastService } from '../../ui/toast/toast.service';

/**
 * Endpoints that return 401/403 intentionally as business errors.
 * These must NOT trigger the global logout safety-net.
 */
const AUTH_PASSTHROUGH_PATTERNS = [
  '/auth/login',   // login with wrong credentials → 401
  '/email',        // PATCH /users/{id}/email → 400/409 handled locally
  '/password',     // PATCH /users/{id}/password → 400/401 handled locally
];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const toast = inject(ToastService);

  // Attach the JWT Bearer token to every outgoing request when authenticated
  const authReq = auth.isAuthenticated()
    ? req.clone({ headers: req.headers.append('Authorization', `Bearer ${auth.JWT()!.token()}`) })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint = AUTH_PASSTHROUGH_PATTERNS.some(p => req.url.includes(p));

      // Global safety-net: unexpected 401/403 on any protected route
      // means the token is invalid/expired → force logout
      if ((err.status === 401 || err.status === 403) && auth.isAuthenticated() && !isAuthEndpoint) {
        toast.info('Sessione scaduta o non autorizzata. Effettua nuovamente l\'accesso.');
        auth.logout();
      }

      // Re-throw so component-level error handlers still fire
      return throwError(() => err);
    })
  );
};
