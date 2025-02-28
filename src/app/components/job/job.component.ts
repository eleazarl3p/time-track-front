import { Component, CSP_NONCE, inject, OnInit, signal } from '@angular/core';
import { Job } from './model/job.interface';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';
import { catchError, timer } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job',
  imports: [CommonModule, FormsModule],
  templateUrl: './job.component.html',
  styleUrl: './job.component.css',
})
export class JobComponent implements OnInit {
  jobService = inject(JobService);
  jobs = signal<Job[]>([]);
  itemsName = signal<string[]>([]);
  newItemName = signal<string>('');
  items: string[] = [];

  job = new Job();

  showJobModal = signal<boolean>(false);

  addItem(event: KeyboardEvent) {
    event.preventDefault();

    if (event.key == 'Enter' && this.newItemName().trim().length > 0) {
      this.job.items.push(this.newItemName());

      const itemSet = new Set(this.job.items);
      this.job.items = [...itemSet]; //[...itemSet].map((no) => new Item(0, no));
      this.newItemName.set('');
    }
  }

  addJob() {
    this.job = new Job();
    this.showJobModal.set(true);
  }

  closeModal(event: Event) {
    const g = event as PointerEvent;
    if (g.pointerType == 'mouse') {
      this.showJobModal.set(false);
    }
  }

  editJob(job: Job) {
    this.job = job;
    this.showJobModal.set(true);
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

  removeItem(index: number, event: Event) {
    const g = event as PointerEvent;
    if (g.pointerType == 'mouse') {
      this.job.items.splice(index, 1);
    }
  }

  saveJob() {
    //this.job.items = this.items.map((itm) => new Item(0, itm));

    this.jobService.createJob(this.job).subscribe({
      next: (res) => {
        console.log('Job created successfully:', res);

        this.getJobs();

        this.job = new Job();
        this.items = [];
        this.showJobModal.set(false);
      },
      error: (err) => {
        console.error('Error creating job:', err);
      },
    });
  }

  updateJob(job: Job) {
    this.jobService.updateJob(this.job).subscribe({
      next: (res) => {
        console.log('Job created successfully:', res);

        this.getJobs();

        this.job = new Job();
        this.items = [];
        this.showJobModal.set(false);
      },
      error: (err) => {
        console.error('Error creating job:', err);
      },
    });
  }

  ngOnInit(): void {
    this.getJobs();
  }
}
