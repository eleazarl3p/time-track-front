import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { Task } from '../../pages/utask/models/utask.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Job } from '../job/model/job.interface';

@Component({
  selector: 'app-task-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.css',
})
export class TaskModalComponent implements OnInit {
  users = signal<string[]>([]);

  task = signal<Task>(new Task());
  // date = signal<string>('');
  // pay_type = signal<string>('WORK');
  // start_time = signal<string>('');
  // end_time = signal<string>('');
  // approved = signal<boolean | null>(null);

  // code = signal<string>('');
  selectedJob = signal<number>(0);
  selectedItem = signal<number>(0);

  errorMsg = signal<string>('');

  // items = computed(() => {
  //   const job = this.jobs().find((jb) => jb._id == this.selectedJob());

  //   return job?.items ?? []; // Always return an array
  // });

  @Input() isAdmin: boolean = false;
  @Input() taskIn: Task | null = null;
  @Input() jobs: Job[] = [];
  @Input() items: string[] = [];
  @Output() closeMdl = new EventEmitter();

  addTask() {
    //console.log(this.date());
  }

  ngOnInit() {
    const dateLocal = new Date().toLocaleDateString('sv-SE');

    // this.date.set(dateLocal);
  }

  closeModal() {}

  updateTask() {}
}
