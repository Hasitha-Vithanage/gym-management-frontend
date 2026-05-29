import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

export interface TrainerRequest {
  id?: number;
  memberId: number;
  memberName: string;
  status: 'PENDING' | 'ASSIGNED';
  level?: string;
  goal?: string;
  bmiCategory?: string;
  requestDate?: string;
}

@Injectable({ providedIn: 'root' })
export class TrainerRequestService {

  constructor(private http: HttpClient, private httpService: HttpService) {}

  private get headers() {
    const token = this.httpService.getAuthToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  createRequest(payload: Omit<TrainerRequest, 'id' | 'status' | 'requestDate'>): Observable<TrainerRequest> {
    return this.http.post<TrainerRequest>(
      environment.baseUrl + '/trainer-request',
      payload,
      { headers: this.headers }
    );
  }

  getByMemberId(memberId: number): Observable<TrainerRequest> {
    return this.http.get<TrainerRequest>(
      environment.baseUrl + '/trainer-request/member/' + memberId,
      { headers: this.headers }
    );
  }

  updateStatus(memberId: number, status: 'PENDING' | 'ASSIGNED'): Observable<TrainerRequest> {
    return this.http.put<TrainerRequest>(
      environment.baseUrl + '/trainer-request/member/' + memberId + '/status?status=' + status,
      null,
      { headers: this.headers }
    );
  }

  getAllRequests(): Observable<TrainerRequest[]> {
    return this.http.get<TrainerRequest[]>(
      environment.baseUrl + '/trainer-request',
      { headers: this.headers }
    );
  }
}
