import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewProgressServiceService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

  // Service call function for save new progress
  serviceCall(form_details: any, userName: string) {
    const requestUrl = environment.baseUrl + '/progress-tracking/' + userName;

    let headers = {};
    const token = this.httpService.getAuthToken();
    if (token !== null) {
      headers = {
        Authorization: 'Bearer ' + token
      };
    }

    return this.http.post(requestUrl, form_details, { headers });
  }

  // Update existing progress data
  updateProgress(id: number, form_details: any) {
    const requestUrl = environment.baseUrl + '/progress/' + id.toString();

    let headers = {};
    const token = this.httpService.getAuthToken();
    if (token !== null) {
      headers = {
        Authorization: 'Bearer ' + token
      };
    }

    return this.http.put(requestUrl, form_details, { headers });
  }

  // Delete progress entry
  deleteProgress(id: number) {
    const requestUrl = environment.baseUrl + '/progress/' + id.toString();

    let headers = {};
    const token = this.httpService.getAuthToken();
    if (token !== null) {
      headers = {
        Authorization: 'Bearer ' + token
      };
    }

    return this.http.delete(requestUrl, { headers });
  }

  getWeightOverTimeData(userName: string): Observable<{ date: string; weight: number }[]> {
    const requestUrl = environment.baseUrl + '/weight-over-time/' + userName;

    let headers = {};
    const token = this.httpService.getAuthToken();
    if (token !== null) {
      headers = {
        Authorization: 'Bearer ' + token
      };
    }

    return this.http.get<any[]>(requestUrl, { headers });
  }

  getBmiOverTimeData(userName: string): Observable<{ date: string; weight: number }[]> {
    const requestUrl = environment.baseUrl + '/bmi-over-time/' + userName;

    let headers = {};
    const token = this.httpService.getAuthToken();
    if (token !== null) {
      headers = {
        Authorization: 'Bearer ' + token
      };
    }

    return this.http.get<any[]>(requestUrl, { headers });
  }


  getProgressPhotos(userName: string) {
  const requestUrl = environment.baseUrl + '/progress-photos/' + userName;

  const token = this.httpService.getAuthToken();
  const headers = token ? { Authorization: 'Bearer ' + token } : {};

  return this.http.get<any[]>(requestUrl, { headers });
}


}
