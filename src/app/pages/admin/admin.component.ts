import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IUser } from '../../components/user/models/loggedUser.interface';
import { UtaskService } from '../utask/service/utask.service';
import { ITask, STask } from '../utask/models/utask.interface';
import { catchError, single } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskFilterComponent } from '../../components/task-filter/task-filter.component';

import { User } from '../../components/user/models/user.model';
import { Task } from '../utask/models/utask.model';
import { Job } from '../../components/job/model/job.interface';
import { TaskModalComponent } from '../../components/task-modal/task-modal.component';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { UserService } from '../../components/user/service/user.service';
import { UserModalComponent } from '../../components/user-modal/user-modal.component';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import { JobComponent } from '../../components/job/job.component';
import { JobService } from '../../services/job.service';
import { CostCenterService } from '../../services/cost-center.service';
import { CostCenter } from '../../components/cost-center/model/cost-center.model';

@Component({
  selector: 'app-admin',
  imports: [HeaderComponent, CommonModule, FormsModule, TaskFilterComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  router = inject(Router);
  authService = inject(AuthService);
  taskService = inject(UtaskService);
  userService = inject(UserService);
  jobService = inject(JobService);
  ccService = inject(CostCenterService);

  loggedInUser = signal<IUser | null>(null);
  users = signal<User[]>([]);
  taskUsers = signal<User[]>([]);

  tasks = signal<ITask[]>([]);
  currentTask = signal<Task>(new Task());
  currentTaskUserId = signal<number>(0);
  costCenters: CostCenter[] = [];

  jobs = signal<Job[]>([]);

  // items = computed(() => {
  //   this.currentTask().item = null;
  //   const job = this.jobs().find((jb) => jb._id == this.currentTask().job);
  //   console.log(job);

  //   return job?.items ?? []; // Always return an array
  // });

  items: string[] = [];
  fromDate = signal<string>('');
  toDate = signal<string>('');

  modalNewTaskIsShown = signal<boolean>(false);

  //editedTask = signal<Task>(new Task());
  //nTask: Task = new Task();

  selectedUsers: User[] = [];
  selectedJobs: Job[] = [];
  filteredTasks: any[] = [];
  // groupedFilteredTask: any = [];
  sumarizedTask = signal<STask[]>([]);

  selectedModalJob = signal<number>(0);
  selectedModalItem = signal<string>('');
  selectedModalCode = signal<string>('');
  reportModal = signal<boolean>(false);

  reportType = signal<string>('itemized');
  errorMsg = signal<string>('');

  ngOnInit(): void {
    this.initDate();
    this.loggedInUser.set(this.authService.getLoggedInUser());

    if (this.loggedInUser == null) {
      this.router.navigate(['/login']);
    }

    this.getUsers();
    this.getJobs();
    this.getAlltasks();
    this.getCostCenters();
    this.filteredTasks = this.runFilter();
  }

  onJobChanged() {
    this.currentTask().item = null;
    const job = this.jobs().find((jb) => jb._id == this.selectedModalJob());
    this.items = job ? job.items : [];
  }
  addTask(userId: number) {
    if (!this.validateTask()) {
      return;
    }

    const formattedTask = this.taskService.formatTask(this.currentTask());

    this.taskService
      .addTask(formattedTask, this.currentTask().user)
      .pipe(
        catchError((err) => {
          const message = err['error']['message'][0];
          this.errorMsg.set(message);
          throw err;
        })
      )
      .subscribe((res) => {
        console.log(res);
        this.getAlltasks();
        this.modalNewTaskIsShown.set(false);
        this.currentTask.set(new Task());
      });
  }

  closeModal() {
    this.modalNewTaskIsShown.set(false);
  }

  closeReportModal() {
    this.reportModal.set(false);
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
    this.selectedModalItem.set(task.item ?? '');

    this.currentTask.set(tk);
    this.errorMsg.set('');
    this.modalNewTaskIsShown.set(true);

    this.selectedModalJob.set(task.job?._id ?? 0);
    //console.log(task._id);
  }

  exportCSV(): void {
    let csvContent = '';

    if (this.reportType() == 'itemized') {
      csvContent = 'Date,User,Pay Type, Hour, Job, Item, Approved\n';
      this.filteredTasks.forEach((task) => {
        const row = [
          task.date,
          task.user.fullName(),
          task.pay_type,
          this.getFormattedHours(task.start_time, task.end_time),
          task.job?.name || '-',
          task.item?.no || '-',
          task.approved ? '✔' : '✘',
        ].join(',');
        csvContent += row + '\n';
      });
    } else {
      csvContent = 'Job, Item, Hour\n';
      this.sumarizedTask().forEach((task) => {
        const row = [task.job, task.item, task.hour + ':' + task.minutes].join(
          ','
        );
        csvContent += row + '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    saveAs(blob, 'task-report.csv');
    console.log('save');
  }

  exportPDF(): void {
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40); // Dark gray
    doc.text('Task Report', 14, 20);

    // ** Paragraph Styling (Subtitle) **
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80); // Lighter gray

    if (this.reportType() == 'itemized') {
      doc.text('Itemized the completed tasks.', 14, 30);
      doc.text('some text', 14, 37);

      autoTable(doc, {
        startY: 45,
        head: [['Date', 'User', 'Pay Type', 'Hour', 'Job', 'Item', 'Approved']],
        body: this.filteredTasks.map((task) => [
          new Date(task.date).toLocaleDateString(),
          task.user.fullName(),
          task.pay_type,
          this.getFormattedHours(task.start_time, task.end_time),
          task.job?.name || '-',
          task.item?.no || '-',
          task.approved === true
            ? 'Approved'
            : task.approved === false
            ? 'Rejected'
            : 'Pending',
        ]),
        theme: 'grid', // Use grid instead of striped for a structured look
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [50, 50, 50], // Dark gray header
          textColor: [255, 255, 255], // White text
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240], // Light gray alternating rows
        },
      });
    } else {
      doc.text('Summarized the completed tasks.', 14, 30);
      doc.text('some text', 14, 37);

      autoTable(doc, {
        startY: 45,
        head: [['Job', 'Item', 'Hour']],
        body: this.sumarizedTask().map((task) => [
          task.job,
          task.item,
          task.hour + ':' + task.minutes,
        ]),
        theme: 'grid', // Use grid instead of striped for a structured look
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [50, 50, 50], // Dark gray header
          textColor: [255, 255, 255], // White text
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240], // Light gray alternating rows
        },
      });
    }

    doc.save('task-report.pdf');
    console.log('save pdf');
  }

  filterByUsers() {
    const ftasks = this.runFilter();

    this.filteredTasks = ftasks.filter((task) => {
      const userIds = this.selectedUsers.map((u) => u._id);
      // const userMatch =
      //   this.selectedUsers.length === 0 ||
      //   this.selectedUsers.includes(task.user);
      const userMatch = userIds.includes(task.user._id);

      // const jobMatch =
      //   this.selectedJobs.length === 0 ||
      //   (task.job && this.selectedJobs.some((j) => j._id === task.job?._id));

      if (this.selectedJobs.length > 0) {
        const jobIds = this.selectedJobs.map((j) => j._id);
        const jobMatch = jobIds.includes(task.job?._id || 0);

        return userMatch && jobMatch; // Must match both filters
      }

      return userMatch;
    });

    if (this.selectedJobs.length > 0) {
      this.filterByReportType();
    } else {
      this.sumarizedTask.set([]);
    }
  }

  filterByReportType() {
    const res = this.sumWorkingHoursByJobAndItem(this.filteredTasks);

    const sorted = res.sort((a: STask, b: STask) => {
      if (a.job == b.job) {
        if (a.item < b.item) {
          return -1;
        }
      }
      if (a.job < b.job) {
        return -1;
      }
      return 1;
    });
    this.sumarizedTask.set(res);
  }

  filterTasks(event: { fromDate: string; toDate: string }): void {
    this.fromDate.set(event.fromDate);
    this.toDate.set(event.toDate);

    this.filterByUsers();
    //this.filteredTasks = this.runFilter();
    // this.filteredUtaskItems.set(t);
  }

  getAlltasks() {
    this.taskService
      .getAllTasks()
      .pipe(
        catchError((err) => {
          throw err;
        })
      )
      .subscribe((tsk) => {
        const updated = tsk.map((tk) => {
          return { ...tk, user: Object.assign(new User(), tk.user) };
        });

        const usrs = updated.map((tk) => tk.user);
        const usrs2 = new Set(updated.map((tk) => tk.user._id));
        this.tasks.set(updated);
        this.filteredTasks = updated;

        let userSet: User[] = [];

        usrs2.forEach((id) => {
          const yuser = usrs.find((u) => u._id === id);
          if (yuser) {
            userSet = [...userSet, yuser];
          }
        });

        this.taskUsers.set(userSet);
        console.log(updated);
      });
  }

  getCostCenters() {
    this.ccService.getCC().subscribe((res) => {
      this.costCenters = res;
      console.log(res);
    });
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

  getFormattedHoursDecimal(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '00:00';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();

    const hours = diffMs / 3600000;

    return (Math.round(hours * 100) / 100).toFixed(2);
    return (
      hours.toFixed(4).toString() +
      ' | ' +
      (Math.round(hours * 100) / 100).toFixed(2)
    );
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

  getUsers() {
    this.userService.getAllUsers().subscribe((response) => {
      this.users.set(response.map((obj) => Object.assign(new User(), obj)));
    });
  }

  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }

  initDate() {
    const today = new Date();

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(today.getDate() - 7);

    this.toDate.set(today.toLocaleDateString('sv-SE')); // Format YYYY-MM-DD
    this.fromDate.set(sevenDaysAgo.toLocaleDateString('sv-SE'));
  }

  reviewTask(id: number, approved: boolean) {
    this.taskService
      .reviewTask(id, approved)
      .pipe(
        catchError((err) => {
          throw err;
        })
      )
      .subscribe((resp) => {
        this.getAlltasks();
      });
  }

  runFilter() {
    if (this.fromDate && this.toDate) {
      const ft = this.tasks().filter((task) => {
        const taskDate = new Date(task.date);

        const fromDate = new Date(this.fromDate());
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(this.toDate());
        toDate.setHours(23, 59, 59, 999);

        return taskDate >= fromDate && taskDate <= toDate;
      });

      return ft;
      //this.filteredUtaskItems.set(filteredTasks); // Set filtered tasks
    } else {
      return this.tasks();
      //this.filteredUtaskItems.set(this.tasks()); // Show all tasks if no filter
    }
  }

  showModal(_id: number | null = null, jobId: number | null = null) {
    this.currentTask.set(new Task());
    this.errorMsg.set('');
    this.currentTask().date = new Date().toLocaleDateString('sv-en');

    this.modalNewTaskIsShown.set(true);
  }

  updateTask() {
    this.validateTask();
    const formattedTask = this.taskService.formatTask(this.currentTask());
    this.taskService
      .updateTask(formattedTask, this.currentTask()._id)
      .pipe(
        catchError((err) => {
          throw err;
        })
      )
      .subscribe((res: any) => {
        this.getAlltasks();
        this.modalNewTaskIsShown.set(false);
        this.currentTask.set(new Task());
      });
  }

  toggleAllJobs(event: any) {
    if (event.target.checked) {
      this.selectedJobs = [...this.jobs()]; // Select all jobs
    } else {
      this.selectedJobs = []; // Deselect all jobs
    }
    this.filterByUsers();
  }

  toggleUserSelection(user: User, event: any) {
    if (event.target.checked) {
      this.selectedUsers.push(user); // Add user to selection
    } else {
      this.selectedUsers = this.selectedUsers.filter((u) => u !== user); // Remove user
    }
    this.filterByUsers(); // Update table after selection
  }

  togleJobSelection(job: Job, event: any) {
    if (event.target.checked) {
      this.selectedJobs.push(job); // Add user to selection
    } else {
      this.selectedJobs = this.selectedJobs.filter((j) => j !== job); // Remove user
    }

    this.filterByUsers();
  }

  toggleAllUsers(event: any) {
    if (event.target.checked) {
      this.selectedUsers = [...this.taskUsers()]; // Select all users
    } else {
      this.selectedUsers = []; // Deselect all users
    }
    this.filterByUsers();
  }
  validateTask(): boolean {
    this.errorMsg.set('');
    const validGap = this.taskService.checkAtLeast1Minutes(
      this.currentTask().start_time,
      this.currentTask().end_time
    );

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

  showReportModal() {
    this.reportModal.set(true);
  }

  sumWorkingHoursByJobAndItem(tasks: any[]) {
    const groupedTasks: { [key: string]: number } = {};

    tasks.forEach((task) => {
      // Only consider "WORK" tasks
      if (task.pay_type !== 'WORK' || !task.job || !task.item) return;

      if (task.approved != true) return;

      // Calculate working hours for the task
      const workingHours = this.getFormattedHours(
        task.start_time,
        task.end_time
      );
      const [hours, minutes] = workingHours.split(':').map(Number);

      // Create a unique key using job name and item number
      const key = `${task.job.name}-${task.item.no}`;

      // Add the hours to the total for this job/item group
      const totalMinutes = hours * 60 + minutes;
      if (groupedTasks[key]) {
        groupedTasks[key] += totalMinutes;
      } else {
        groupedTasks[key] = totalMinutes;
      }
    });

    // Convert minutes back to hours and minutes
    const result = Object.entries(groupedTasks).map(([key, totalMinutes]) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return new STask(
        key.split('-')[0],
        key.split('-')[1],
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0')
      );
    });

    return result;
  }
}
