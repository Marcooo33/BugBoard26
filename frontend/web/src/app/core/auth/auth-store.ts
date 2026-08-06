import { computed, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Jwt } from './JWT/jwt';
import { AuthApi } from './auth-api';
import { JwtResponse } from './JWT/jwt-response';
import { IUserUpdate, TUserRole } from '../../modules/profile/user/user';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {

  private readonly authApi = inject(AuthApi);

  private readonly _jwt: WritableSignal<Jwt | null> = signal(null);
  readonly jwt = this._jwt.asReadonly();

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
    this._jwt.set(token ? new Jwt(token) : null);
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
    sessionStorage.removeItem('demo');
    localStorage.removeItem('auth');
    window.location.href = '/';
  }

  private saveTokenToStorage(token: Jwt) {
    localStorage.setItem('auth', token.token());
  }

  private deleteTokenFromStorage() {
    localStorage.removeItem('auth');
  }


  login(email: string, password: string, returnUrl: string): Observable<JwtResponse> {
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
