import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../user/service/user.service';
import { User } from '../user/models/user.model';
import { UserModalComponent } from '../user-modal/user-modal.component';

@Component({
  selector: 'app-user-table',
  imports: [UserModalComponent],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.css',
})
export class UserTableComponent implements OnInit {
  userService = inject(UserService);

  users = signal<User[]>([]);

  user = signal<User>(new User());
  modalUserIsShown = signal<boolean>(false);

  ngOnInit(): void {
    this.getUsers();
  }

  closseUserModal() {
    this.modalUserIsShown.set(false);
    this.getUsers();
  }

  editUser(usr: User) {
    this.user.set(usr);
    this.modalUserIsShown.set(true);
  }

  getUsers() {
    this.userService.getAllUsers().subscribe((response) => {
      this.users.set(response.map((obj) => Object.assign(new User(), obj)));
    });
  }

  addNewUser() {
    this.user.set(new User());
    this.modalUserIsShown.set(true);
  }

  resetUser(user: User) {
    user.password = '1234';

    this.userService.updateUser(user).subscribe((res) => console.log(res));
  }
}
