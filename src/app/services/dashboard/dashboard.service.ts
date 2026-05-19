import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly BASE = environment.baseUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly httpService: HttpService
  ) {}

  totalEmployeeCount(): Observable<number> {
    return this.get<number>('/employee-count');
  }

  totalMemberCount(): Observable<number> {
    return this.get<number>('/member-count');
  }

  totalSupplierCount(): Observable<number> {
    return this.get<number>('/supplier-count');
  }

  newMembersInThisMonth(): Observable<number> {
    return this.get<number>('/new-members');
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.BASE}${endpoint}`, { headers: this.authHeaders() });
  }

  private authHeaders(): HttpHeaders {
    const token = this.httpService.getAuthToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
