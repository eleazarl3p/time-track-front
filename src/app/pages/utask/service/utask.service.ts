import { computed, inject, Injectable } from '@angular/core';
import { ITask } from '../models/utask.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../services/auth.service';
import { Task } from '../models/utask.model';
import { Job } from '../../../components/job/model/job.interface';
import { UserService } from '../../../components/user/service/user.service';
import { User } from '../../../components/user/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UtaskService {
  http = inject(HttpClient);
  authService = inject(AuthService);

  getUserTaskByUser(userId: number) {
    const url = `${environment.API_URL}/task/${userId}`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<ITask[]>(url, { headers });
  }

  getAllTasks() {
    const url = `${environment.API_URL}/task/`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<ITask[]>(url, { headers });
  }

  addTask(task: any, userId: number | null = null) {
    let url = `${environment.API_URL}/task`;

    if (userId != null) {
      url = url + `?userId=${userId}`;
    }
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(url, task, { headers });
  }

  formatTask(newTask: Task) {
    return {
      pay_type: newTask.pay_type,
      date: newTask.date,
      start_hour: parseInt(newTask.start_time.split(':')[0], 10),
      start_minute: parseInt(newTask.start_time.split(':')[1], 10),
      end_hour: parseInt(newTask.end_time.split(':')[0], 10),
      end_minute: parseInt(newTask.end_time.split(':')[1], 10),
      notes: newTask.notes ?? null,
      code: newTask.code ?? undefined,
      job: newTask.job ? Number(newTask.job) : null,
      item: newTask.item ? newTask.item : null,
    };
  }

  checkAtLeast1Minutes(start: string, end: string) {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    // Convert the times to minutes since midnight
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    // Check if the difference is at least 5 minutes
    return endTotal - startTotal >= 1;
  }

  reviewTask(id: number, approved: boolean) {
    const url = `${environment.API_URL}/task/review/${id}/`;

    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.patch(url, { approved }, { headers });
  }

  updateTask(task: any, id: number) {
    const url = `${environment.API_URL}/task/${id}`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.patch(url, task, { headers });
  }
}
