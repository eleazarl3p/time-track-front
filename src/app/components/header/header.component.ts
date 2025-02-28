import { Component, inject, Input, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IUser } from '../user/models/loggedUser.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',

  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  router = inject(Router);

  @Input({ required: true }) loggedInUser: IUser | null = null;

  authService = inject(AuthService);

  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }

  logOut() {
    this.authService.logout();
  }
}
