import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-filter',
  imports: [FormsModule],
  templateUrl: './task-filter.component.html',
  styleUrl: './task-filter.component.css',
})
export class TaskFilterComponent implements OnInit {
  router = inject(Router);
  fromDate = signal<string>('');
  toDate = signal<string>('');

  minToDate = computed(() => {
    const from = new Date(this.fromDate());
    from.setDate(from.getDate() + 1); // Add 1 day
    return from.toLocaleDateString('sv-SE');
  });

  @Input() isAdmin: boolean = false;
  @Output() addTaskClick = new EventEmitter<void>();

  @Output() dateRangeChanged = new EventEmitter<{
    fromDate: string;
    toDate: string;
  }>();

  ngOnInit(): void {
    const today = new Date();

    const sevenDaysAgo = new Date();
    const sixDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.toDate.set(today.toLocaleDateString('sv-SE')); // Format YYYY-MM-DD
    this.fromDate.set(sevenDaysAgo.toLocaleDateString('sv-SE'));
  }

  onFilter() {
    this.dateRangeChanged.emit({
      fromDate: this.fromDate(),
      toDate: this.toDate(),
    });
  }

  report() {
    this.addTaskClick.emit();
  }

  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }
  // onFilter() {
  //   this.filter.emit(); // Emit the event to parent
  // }
}
