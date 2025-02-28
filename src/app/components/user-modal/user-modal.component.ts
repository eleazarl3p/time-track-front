import {
  Component,
  EventEmitter,
  inject,
  Input,
  input,
  OnInit,
  output,
  Output,
  signal,
} from '@angular/core';
import { User } from '../user/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../user/service/user.service';

@Component({
  selector: 'app-user-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.css',
})
export class UserModalComponent implements OnInit {
  //user = signal<User>(new User());
  errorMsg = signal<string>('');

  userService = inject(UserService);

  //uu = input<User>();
  @Input({ required: true }) user: User = new User();

  closeModalEmiter = output();

  deleteUser(id: number) {
    this.userService.delete(id).subscribe((res) => console.log(res));
  }
  saveUser() {
    if (this.valideUser()) {
      console.log('invalid');
      this.userService.createUser(this.user).subscribe((res) => {
        this.closeModalEmiter.emit();
      });
    }
  }

  updateUser(user: User) {
    if (this.valideUser()) {
      this.userService.updateUser(user).subscribe((res) => {
        this.closeModalEmiter.emit();
      });
    }
  }

  ngOnInit(): void {
    // if (this.uu) {
    //   this.user.set(this.uu()!);
    // }
  }

  valideUser(): boolean {
    if (this.user.first_name.trim().length < 1) {
      this.errorMsg.set('first name cannot be empty');
      return false;
    }

    if (this.user.last_name.trim().length < 1) {
      this.errorMsg.set('last name cannot be empty');
      return false;
    }

    if (this.user.username.trim().length < 1) {
      this.errorMsg.set('username cannot be empty');
      return false;
    }

    return true;
  }
}
