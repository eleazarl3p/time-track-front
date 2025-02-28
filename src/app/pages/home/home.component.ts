import { Component, signal } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { TaskFilterComponent } from '../../components/task-filter/task-filter.component';

@Component({
  selector: 'app-home',

  imports: [TaskFilterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  title = signal('abcd');

  keyUpHandler(event: KeyboardEvent) {
    console.log(`User type ${event.key}`);
  }
}
