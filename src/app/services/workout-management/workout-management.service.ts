import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkoutManagementService {
  private userDetails: any;

  constructor(
    private http: HttpClient,
    private httpService: HttpService
  ) {}

  setWorkoutData(data: any) {
    this.userDetails = data;
  }

  getWorkoutData() {
    return this.userDetails;
  }

  getTrainerById(memberName: string): Observable<any> {
    const requestUrl = environment.baseUrl + '/get-assign-trainer/' + memberName;

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  clearWorkoutData() {
    this.userDetails = null;
  }

  sendWorkoutRequest(requestPayload: any) {
    const requestUrl = environment.baseUrl + '/sendRequest';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.post(requestUrl, requestPayload, { headers: headers });
  }

  getTrainerDetails(trainerId: number) {
    const requestUrl = environment.baseUrl + '/trainer/' + trainerId;

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  async generateWorkoutPlan(payload: any, onMessage: (msg: string) => void) {
    const response = await fetch(environment.baseUrl + '/workout-plan-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.body) {
      throw new Error('ReadableStream not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop()!;

      for (const line of lines) {
        if (line.startsWith('data:')) {
          onMessage(line.replace('data:', '').trim());
        }
      }
    }
  }
}
