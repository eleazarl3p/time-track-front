import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

import { jwtDecode } from 'jwt-decode';
import { IUser } from '../components/user/models/loggedUser.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //private apiUrl = 'http://127.0.0.1:3000/auth';

  http = inject(HttpClient);
  router = inject(Router);

  login(username: string, password: string) {
    return this.http.post(
      `${environment.API_URL}/auth/login`,
      { username, password },
      { responseType: 'text', withCredentials: true }
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getLoggedInUser(): IUser | null {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
