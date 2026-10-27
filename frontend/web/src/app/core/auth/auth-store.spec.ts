import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthStore } from './auth-store';
import { AuthApi } from './auth-api';
import { Jwt } from './JWT/jwt';
import { ENVIRONMENT_TOKEN } from '../../../environments/environment-model';

function token(sub: string) {
  return new Jwt(`${btoa('{}')}.${btoa(JSON.stringify({ sub, role: 'DEVELOPER' }))}.signature`);
}

describe('AuthStore demo session', () => {
  function setup(showcase = false) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthApi, useValue: {} },
        { provide: ENVIRONMENT_TOKEN, useValue: { showcase, urls: { api: '/api' } } },
      ],
    });
    return TestBed.inject(AuthStore);
  }

  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
  afterEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it('keeps demo identity in memory and restores the real session on exit', () => {
    const real = token('real-user');
    localStorage.setItem('auth', real.token());
    const store = setup();
    store.startDemo(token('u-demo'));
    expect(store.uuid()).toBe('u-demo');
    expect(store.isDemo()).toBe(true);
    expect(localStorage.getItem('auth')).toBe(real.token());
    store.endDemo();
    expect(store.uuid()).toBe('real-user');
    expect(store.isDemo()).toBe(false);
  });

  it('removes legacy persisted demo tokens on startup', () => {
    localStorage.setItem('auth', token('u-demo').token());
    sessionStorage.setItem('demo', '1');
    const store = setup();
    expect(store.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth')).toBeNull();
    expect(sessionStorage.getItem('demo')).toBeNull();
  });

  it('ignores real login sessions in showcase and ends demo without authentication', () => {
    localStorage.setItem('auth', token('real-user').token());
    const store = setup(true);
    expect(store.isAuthenticated()).toBe(false);
    store.startDemo(token('u-demo'));
    store.endDemo();
    expect(store.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth')).not.toBeNull();
  });

  it('rejects login in showcase before contacting the API', () => {
    const store = setup(true);
    let rejected = false;
    store.login('user@example.com', 'password', '/').subscribe({ error: () => { rejected = true; } });
    expect(rejected).toBe(true);
  });
});
