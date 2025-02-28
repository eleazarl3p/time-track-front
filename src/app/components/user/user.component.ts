import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from './service/user.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-user',
  imports: [FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {
  userObject: User = new User();
  userService = inject(UserService);

  // onSaveUser() {
  //   console.log(this.userObject);
  //   this.userService.createUser(this.userObject).subscribe((result) => {
  //     console.log(result);
  //   });
  // }
}
