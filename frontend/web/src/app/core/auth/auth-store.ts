import { computed, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Jwt } from './JWT/jwt';
import { AuthApi } from './auth-api';
import { Router } from '@angular/router';
import { ENVIRONMENT_TOKEN } from '../../../environments/environment-model';
import { JwtResponse } from './JWT/jwt-response';
import { IUserUpdate, TUserRole } from '../../modules/profile/user/user';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {

  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly environment = inject(ENVIRONMENT_TOKEN);
  private readonly demoJwt = signal<Jwt | null>(null);
  readonly isDemo = computed(() => this.demoJwt() !== null);

  private readonly _jwt: WritableSignal<Jwt | null> = signal(null);
  readonly jwt = computed(() => this.demoJwt() ?? this._jwt());

  readonly resourceVersion = signal(0);

  readonly JWT: Signal<Jwt | null> = computed(() => this.jwt());

  // TODO: spostare tutte queste informazioni nello user-store
  readonly uuid: Signal<string | null> = computed(() => this.jwt()?.payload().sub || null);
  readonly name: Signal<string | null> = computed(() => this.jwt()?.payload().name || null);
  readonly surname: Signal<string | null> = computed(() => this.jwt()?.payload().surname || null);
  readonly email: Signal<string | null> = computed(() => this.jwt()?.payload().email || null);
  readonly role: Signal<TUserRole | null> = computed(() => this.jwt()?.payload().role || null);
  // fino a qui

  readonly isAuthenticated: Signal<boolean> = computed(() => this.jwt() !== null);

  constructor() {
    this.loadTokenFromStorage();
  }

  loadTokenFromStorage() {
    const token = localStorage.getItem('auth');
    // Migrate tokens persisted by older demo versions; preserve real sessions.
    let realToken = token;
    if (token) {
      try {
        if (new Jwt(token).payload().sub === 'u-demo') {
          localStorage.removeItem('auth');
          realToken = null;
        }
      } catch {
        localStorage.removeItem('auth');
        realToken = null;
      }
    }
    sessionStorage.removeItem('demo');
    this._jwt.set(!this.environment.showcase && realToken ? new Jwt(realToken) : null);
  }
  
  startDemo(token: Jwt) {
    this.demoJwt.set(token);
    this.resourceVersion.update(v => v + 1);
  }

  endDemo() {
    this.demoJwt.set(null);
    this.resourceVersion.update(v => v + 1);
  }

  setJwt(token: Jwt) {
    this.saveTokenToStorage(token);
    this._jwt.set(token);
    this.resourceVersion.update(v => v + 1);
  }

  unsetJwt() {
    this.deleteTokenFromStorage();
    this._jwt.set(null);
    this.resourceVersion.update(v => v + 1);
  }

  logout() {
    if (this.isDemo()) {
      void this.router.navigate(['/']);
      return;
    }
    this.unsetJwt();
    void this.router.navigate(['/']);
  }

  private saveTokenToStorage(token: Jwt) {
    localStorage.setItem('auth', token.token());
  }

  private deleteTokenFromStorage() {
    localStorage.removeItem('auth');
  }


  login(email: string, password: string, returnUrl: string): Observable<JwtResponse> {
    if (this.environment.showcase) {
      return throwError(() => new Error('Accesso non disponibile nella vetrina pubblica'));
    }
    if (!email || !password) {
      throw new Error('Email and password must be provided');
    }
    return this.authApi.login({ email, password }).pipe(
      tap((response: JwtResponse) => {
        const jwt = new Jwt(response.token);
        this.setJwt(jwt);
        window.location.href = returnUrl || '/';
      }),
      catchError((err) => {
        console.error('Login failed', err);
        this.unsetJwt();
        return throwError(() => err);
      })
    );
  }

  modifyUser(updates: IUserUpdate){
    this.authApi.modifyUser(updates).subscribe({
      next: (Response: JwtResponse) => {
        this.logout();
      },
      error: (err) => {
        console.error('update failed', err);
      }
    });

  }

}
