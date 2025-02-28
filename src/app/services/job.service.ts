import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.development';
import { Job } from '../components/job/model/job.interface';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  http = inject(HttpClient);
  authService = inject(AuthService);

  createJob(job: Job) {
    const url = `${environment.API_URL}/job`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(url, job, { headers });
  }

  getJobs() {
    const url = `${environment.API_URL}/job`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Job[]>(url, { headers });
  }

  updateJob(job: Job) {
    const url = `${environment.API_URL}/job/${job._id}`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.patch(url, job, { headers });
  }
}
