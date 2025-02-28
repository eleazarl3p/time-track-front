import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { IUser } from '../../components/user/models/loggedUser.interface';
import { AuthService } from '../../services/auth.service';
import { User } from '../../components/user/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../components/user/service/user.service';
import { Router } from '@angular/router';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import { JobComponent } from '../../components/job/job.component';
import { CostCenterComponent } from '../../components/cost-center/cost-center.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    HeaderComponent,
    FormsModule,
    CommonModule,
    UserTableComponent,
    JobComponent,
    CostCenterComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);

  loggedInUser = signal<IUser | null>(null);

  user: User = new User();

  confirmPassword = signal<string>('');
  erroMessage = signal<string>('');

  activeItem = signal<string>('User');

  updateUser(user: User) {
    if (!this.passwordsMatch()) {
      this.erroMessage.set('Password does not match');
      return;
    }
    console.log('match');

    this.userService.updateUser(user).subscribe((res) => {
      this.router.navigate(['/activity']);
    });
  }

  cancel() {
    this.router.navigate(['/activity']);
  }

  passwordsMatch(): boolean {
    return this.user.password === this.confirmPassword();
  }

  setActiveItem(item: string) {
    this.activeItem.set(item);
  }

  ngOnInit(): void {
    this.loggedInUser.set(this.authService.getLoggedInUser());
    this.user._id = this.loggedInUser()?._id ?? 0;
    this.user.first_name = this.loggedInUser()?.first_name ?? '';
    this.user.last_name = this.loggedInUser()?.last_name ?? '';
    this.user.username = this.loggedInUser()?.username ?? '';
  }
}
