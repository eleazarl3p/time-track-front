import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../components/user/models/user.model';
import { UserService } from '../../components/user/service/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  //username = signal<string>('');
  username = '';
  password = '';

  user = new User();

  authService = inject(AuthService);
  router = inject(Router);
  onLogin() {
    this.authService
      .login(this.username, this.password)
      .subscribe((tkn: string) => {
        localStorage.setItem('token', tkn);

        if (this.password == '1234') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/activity']);
        }
      });
  }
}
