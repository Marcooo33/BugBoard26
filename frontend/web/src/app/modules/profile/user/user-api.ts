import { inject, Injectable } from '@angular/core';
import { ENVIRONMENT_TOKEN } from '../../../../environments/environment-model';
import { HttpClient, httpResource } from '@angular/common/http';
import { INewUser, IUser } from './user';
import { AuthStore } from '../../../core/auth/auth-store';

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private readonly env = inject(ENVIRONMENT_TOKEN);
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);

  private readonly API_URL = this.env.urls.api;
  private readonly USERS_URL = "/users"

  readonly usersResource = httpResource<IUser[]>(() => ({
    url: `${this.API_URL}${this.USERS_URL}`,
    method: "GET",
    params: { _v: this.authStore.resourceVersion().toString() },
  }));

  createUser(user: INewUser){
    return this.http.post<IUser>(
      `${this.API_URL}${this.USERS_URL}`, user
    );
  }

  deleteUser(userUuid: IUser['uuid']){
    return this.http.delete<void>(
      `${this.API_URL}${this.USERS_URL}/${userUuid}`
    );
  }

}
