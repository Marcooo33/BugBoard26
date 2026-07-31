import { inject, Injectable } from "@angular/core";
import { ENVIRONMENT_TOKEN } from "../../../environments/environment-model";
import { HttpClient } from "@angular/common/http";
import { JwtResponse } from "./JWT/jwt-response";
import { JwtRequest } from "./JWT/jwt-request";
import { IUserUpdate } from "../../modules/profile/user/user";

@Injectable({
  providedIn: 'root',
})
export class AuthApi {

  private readonly env = inject(ENVIRONMENT_TOKEN);
  private readonly http = inject(HttpClient);

  private readonly API_URL = this.env.urls.api;
  private readonly AUTH_URL = "/auth"
  private readonly USERS_URL = "/users"

  login(request: JwtRequest) {
    return this.http.post<JwtResponse>(`${this.API_URL}${this.AUTH_URL}/login`, request);
  };

  /** @deprecated Use updateEmail / updatePassword instead */
  modifyUser(update: IUserUpdate){
    return this.http.patch<JwtResponse>(`${this.API_URL}${this.AUTH_URL}`, update);
  }

  updateEmail(uuid: string, newEmail: string) {
    return this.http.patch<void>(
      `${this.API_URL}${this.USERS_URL}/${uuid}/email`,
      { newEmail }
    );
  }

  updatePassword(uuid: string, currentPassword: string, newPassword: string) {
    return this.http.patch<void>(
      `${this.API_URL}${this.USERS_URL}/${uuid}/password`,
      { currentPassword, newPassword }
    );
  }

}
