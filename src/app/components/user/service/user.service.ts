import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment.development';
import { User } from '../models/user.model';
import { catchError } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);
  authService = inject(AuthService);

  createUser(user: User) {
    const url = `${environment.API_URL}/user`;
    user.password = '1234';
    return this.http.post<User>(url, user);
  }

  getAllUsers() {
    const url = `${environment.API_URL}/user`;

    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<User[]>(url, {
      headers,
    });
  }

  updateUser(user: User) {
    const url = `${environment.API_URL}/user/${user._id}`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.patch(url, user, { headers });
  }

  delete(id: number) {
    const url = `${environment.API_URL}/user/${id}`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(url, { headers });
  }
  // login(user: User) {
  //   console.log(
  //     this.http.post<User>(`${environment.API_URL}/auth/login`, user)
  //   );

  //   // .subscribe((res) => {
  //   //   console.log(res);
  //   // });
  // }

  // login(username: string, password: string) {
  //   return this.http.post(
  //     'http://127.0.0.1:3000/auth/login',
  //     { username, password },
  //     { responseType: 'text' }
  //   );
  // }
}
