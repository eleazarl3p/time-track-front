import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { CostCenter } from '../components/cost-center/model/cost-center.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CostCenterService {
  http = inject(HttpClient);
  authService = inject(AuthService);

  createCC(cc: CostCenter) {
    const url = `${environment.API_URL}/cost-center`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    console.log(cc);

    return this.http.post(url, cc, { headers });
  }

  deleteCC(cc: CostCenter) {
    const url = `${environment.API_URL}/cost-center/${cc._id}`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(url, { headers });
  }

  getCC() {
    const url = `${environment.API_URL}/cost-center`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<CostCenter[]>(url, { headers });
  }

  updateCC(cc: CostCenter) {
    const url = `${environment.API_URL}/cost-center/${cc._id}`;
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.patch(url, cc, { headers });
  }
}
