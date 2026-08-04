import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthStore } from '../auth/auth-store';
import { Jwt } from '../auth/JWT/jwt';
import { DemoDataService } from './demo-data.service';

function encodeJwtPart(obj: unknown): string {
  return btoa(JSON.stringify(obj));
}

const DEMO_JWT_TOKEN = (() => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'u-demo',
    iat: Math.floor(Date.now() / 1000),
    name: 'Demo',
    surname: 'Developer',
    email: 'demo@bugboard.local',
    role: 'DEVELOPER',
  };
  const signature = 'demo-signature';
  return `${encodeJwtPart(header)}.${encodeJwtPart(payload)}.${encodeJwtPart(signature)}`;
})();

export const demoGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const demoData = inject(DemoDataService);

  demoData.ensureSeeded();
  demoData.isActive.set(true);
  sessionStorage.setItem('demo', '1');

  if (!authStore.isAuthenticated()) {
    authStore.setJwt(new Jwt(DEMO_JWT_TOKEN));
  }

  return true;
};
