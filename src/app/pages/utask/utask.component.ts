import {
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { UtaskService } from './service/utask.service';
import { ITask } from './models/utask.interface';
import { catchError } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { IUser } from '../../components/user/models/loggedUser.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from './models/utask.model';
import { Router } from '@angular/router';

import { TaskFilterComponent } from '../../components/task-filter/task-filter.component';
import { Job } from '../../components/job/model/job.interface';
import { format } from 'date-fns';
import { JobService } from '../../services/job.service';
import { CostCenterService } from '../../services/cost-center.service';
import { CostCenter } from '../../components/cost-center/model/cost-center.model';

@Component({
  selector: 'app-utask',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, TaskFilterComponent],
  templateUrl: './utask.component.html',
  styleUrl: './utask.component.css',
})
export class UtaskComponent implements OnInit {
  authService = inject(AuthService);
  utaskService = inject(UtaskService);
  jobService = inject(JobService);
  ccService = inject(CostCenterService);
  router = inject(Router);

  utaskItems = signal<ITask[]>([]);
  filteredUtaskItems = signal<ITask[]>([]);
  user = signal<IUser | null>(null);
  jobs = signal<Job[]>([]);
  modalIsShown = signal(false);

  fromDate = signal<string>('');
  toDate = signal<string>('');

  currentTask = signal<Task>(new Task());

  errorMsg = signal<string>('');

  hours = Array.from({ length: 12 }, (_, i) =>
    (i + 7).toString().padStart(2, '0')
  ); // 07 - 18
  minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // selectedJob = signal<number>(0);
  // selectedItem = signal<string>('');

  items: string[] = [];

  costCenters: CostCenter[] = [];

  // selectedModalJob = signal<number>(0);
  // selectedModalItem = signal<string>('');
  // selectedModalCode = signal<string>('');

  selectedModalJob = signal<number>(0);
  selectedModalItem = signal<string>('');
  selectedModalCode = signal<string>('');

  onJobChanged() {
    this.currentTask().item = null;
    const job = this.jobs().find((jb) => jb._id == this.selectedModalJob());
    this.items = job ? job.items : [];

    // if (job) {
    //   this.currentTask().job = job._id;
    // } else {
    //   this.currentTask().job = 0;
    // }
  }

  ngOnInit(): void {
    this.user.set(this.authService.getLoggedInUser());

    if (this.user == null) {
      this.router.navigate(['/login']);
      return;
    }
    this.getUserTasks();
    this.getJobs();
    this.getCostCenters();
  }

  handleDateChange(event: { fromDate: string; toDate: string }) {
    this.fromDate.set(event.fromDate);
    this.toDate.set(event.toDate);
  }

  filterTasks(event: { fromDate: string; toDate: string }): void {
    this.fromDate.set(event.fromDate);
    this.toDate.set(event.toDate);

    if (this.fromDate && this.toDate) {
      const filteredTasks = this.utaskItems().filter((task) => {
        const taskDate = new Date(task.date);

        const fromDate = new Date(this.fromDate());
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(this.toDate());
        toDate.setHours(23, 59, 59, 999);

        return taskDate >= fromDate && taskDate <= toDate;
      });
      this.filteredUtaskItems.set(filteredTasks); // Set filtered tasks
    } else {
      this.filteredUtaskItems.set(this.utaskItems()); // Show all tasks if no filter
    }
  }

  showModal() {
    this.currentTask.set(new Task());
    this.errorMsg.set('');
    this.currentTask().date = new Date().toLocaleDateString('sv-en');

    this.modalIsShown.set(true);
  }

  editTask(task: ITask) {
    //this.newTask.set(task);

    const start_date = new Date(task.start_time);

    const hours = start_date.getUTCHours().toString().padStart(2, '0');
    const minutes = start_date.getUTCMinutes().toString().padStart(2, '0');

    const start_time = `${hours}:${minutes}`;

    const end_date = new Date(task.end_time);

    const end_hours = end_date.getUTCHours().toString().padStart(2, '0');
    const end_minutes = end_date.getUTCMinutes().toString().padStart(2, '0');

    const end_time = `${end_hours}:${end_minutes}`;

    const date = new Date(task.date).toLocaleDateString('sv-SE');

    const jb = this.jobs().find((jb) => jb._id == task.job?._id);
    this.items = jb ? jb.items : [];

    const tk = new Task(
      task._id,
      task.pay_type,
      date,
      start_time,
      end_time,
      task.notes,
      task.approved,
      task.code,
      task.job ? task.job._id : null,
      task.item ? task.item : null
    );

    this.selectedModalJob.set(task.job?._id ?? 0);
    // this.selectedModalItem.set(task.item? ?? "");

    this.currentTask.set(tk);
    this.errorMsg.set('');
    this.modalIsShown.set(true);
  }

  closeModal() {
    this.modalIsShown.set(false);
  }
  getCostCenters() {
    this.ccService.getCC().subscribe((res) => {
      this.costCenters = res;
      console.log(res);
    });
  }
  getJobs() {
    this.jobService
      .getJobs()
      .pipe(
        catchError((err) => {
          throw err;
        })
      )
      .subscribe((jbs) => {
        this.jobs.set(jbs);
      });
  }

  getUserTasks() {
    const usrtask = this.utaskService
      .getUserTaskByUser(this.user()!._id)
      .pipe(
        catchError((err) => {
          //console.log(err);
          throw err;
        })
      )
      .subscribe((ut) => {
        this.utaskItems.set(ut);
        this.filteredUtaskItems.set(ut);
      });
  }

  getFormattedHoursDecimal(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '00:00';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();

    const hours = diffMs / 3600000;

    return (Math.round(hours * 100) / 100).toFixed(2);
  }

  addTask() {
    try {
      // validate time

      if (!this.validateTask()) {
        return;
      }

      const formattedTask = this.utaskService.formatTask(this.currentTask());

      this.utaskService
        .addTask(formattedTask)
        .pipe(
          catchError((err) => {
            const message = err['error']['message'][0];
            this.errorMsg.set(message);
            throw err;
          })
        )
        .subscribe((res) => {
          this.getUserTasks();
          this.modalIsShown.set(false);
          this.currentTask.set(new Task());
        });
    } catch (error) {}
  }

  updateTask() {
    this.validateTask();
    const formattedTask = this.utaskService.formatTask(this.currentTask());

    this.utaskService
      .updateTask(formattedTask, this.currentTask()._id)
      .pipe(
        catchError((err) => {
          throw err;
        })
      )
      .subscribe((res: any) => {
        this.getUserTasks();
        this.modalIsShown.set(false);
        this.currentTask.set(new Task());
      });
  }

  validateTask(): boolean {
    this.errorMsg.set('');
    const validGap = this.utaskService.checkAtLeast1Minutes(
      this.currentTask().start_time,
      this.currentTask().end_time
    );
    if (this.currentTask().pay_type == '') {
      this.errorMsg.set('Please select a valid pay type');
      return false;
    }

    if (!validGap) {
      this.errorMsg.set('Invalid time, At least 1 minute interval');
      return false;
    }

    // validate code

    if (
      this.currentTask().pay_type == 'WORK' &&
      this.currentTask().code == null
    ) {
      this.errorMsg.set('Invalid Code');
      return false;
    }

    this.currentTask().job =
      this.selectedModalJob() == 0 ? null : this.selectedModalJob();
    // validate code

    console.log('slet job : ', this.selectedModalItem());
    console.log('current', this.currentTask());
    if (
      this.currentTask().pay_type == 'WORK' &&
      this.currentTask().job == null
    ) {
      this.errorMsg.set('Job cannot be null');
      return false;
    }

    this.currentTask().item =
      this.selectedModalItem() == '' ? null : this.selectedModalItem();
    if (
      this.currentTask().pay_type == 'WORK' &&
      this.currentTask().item == null
    ) {
      this.errorMsg.set('Item cannot be null');
      return false;
    }

    return true;
  }
  // validateTask() {
  //   this.errorMsg.set('');
  //   const validGap = this.utaskService.checkAtLeast1Minutes(
  //     this.newTask().start_time,
  //     this.newTask().end_time
  //   );

  //   if (!validGap) {
  //     this.errorMsg.set('Invalid time, At least 1 minute interval');
  //     return;
  //   }

  //   // validate code
  //   if (
  //     this.newTask().pay_type == 'WORK' &&
  //     (this.newTask().code == null ||
  //       this.newTask().code?.trimStart().length == 0)
  //   ) {
  //     this.errorMsg.set('Invalid Code');
  //     return;
  //   }

  //   this.newTask().job = this.selectedJob() == 0 ? null : this.selectedJob();
  //   // validate code
  //   if (this.newTask().pay_type == 'WORK' && this.newTask().job == null) {
  //     this.errorMsg.set('Job cannot be null');
  //     return;
  //   }

  //   this.newTask().item =
  //     this.selectedItem() == '' ? null : this.selectedItem();
  //   if (this.newTask().pay_type == 'WORK' && this.newTask().item == null) {
  //     this.errorMsg.set('Item cannot be null');
  //     return;
  //   }
  // }

  getTotalHours(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '0';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return (diffMs / (1000 * 60 * 60)).toFixed(2); // Convert to hours with 2 decimals
  }

  getFormattedHours(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '00:00';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }
}
