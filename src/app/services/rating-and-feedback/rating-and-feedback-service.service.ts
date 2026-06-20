import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({
  providedIn: 'root'
})
export class RatingAndFeedbackServiceService {

  private readonly baseUrl = environment.baseUrl + '/feedback';

  constructor(private http: HttpClient, private httpService: HttpService) {}

  private getHeaders(): Record<string, string> {
    const token = this.httpService.getAuthToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  submitFeedback(payload: any) {
    return this.http.post(this.baseUrl, payload, { headers: this.getHeaders() });
  }

  getTrainers() {
    return this.http.get(environment.baseUrl + '/getTrainers', { headers: this.getHeaders() });
  }

  getAllFeedbacks() {
    return this.http.get<any[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  getMyFeedbacks(submittedBy: string) {
    return this.http.get<any[]>(`${this.baseUrl}/my/${submittedBy}`, { headers: this.getHeaders() });
  }

  updateFeedback(id: number, payload: any) {
    return this.http.put(`${this.baseUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  updateStatus(id: number, status: string, adminRemarks: string = '') {
    return this.http.patch(`${this.baseUrl}/${id}/status`, { status, adminRemarks }, { headers: this.getHeaders() });
  }

  deleteFeedback(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  getAnalytics() {
    return this.http.get<any>(`${this.baseUrl}/analytics`, { headers: this.getHeaders() });
  }
}
