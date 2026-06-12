import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({ providedIn: 'root' })
export class UserMealPlanAssignmentMealService {

  constructor(private http: HttpClient, private httpService: HttpService) {}

  private get headers(): { [key: string]: string } {
    const token = this.httpService.getAuthToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  suggestTemplates(userId: string) {
    return this.http.get<any[]>(
      `${environment.baseUrl}/user-meal-plan-assignment/suggest/${userId}`,
      { headers: this.headers }
    );
  }

  createAssignment(body: { userId: string; templateId: number; assignedBy: string; durationWeeks?: number }) {
    return this.http.post(
      `${environment.baseUrl}/user-meal-plan-assignment`,
      body,
      { headers: this.headers }
    );
  }

  getActiveAssignment(userId: string) {
    return this.http.get<any>(
      `${environment.baseUrl}/user-meal-plan-assignment/active/${userId}`,
      { headers: this.headers }
    );
  }

  getAllAssignments(userId: string) {
    return this.http.get<any[]>(
      `${environment.baseUrl}/user-meal-plan-assignment/all/${userId}`,
      { headers: this.headers }
    );
  }
}
