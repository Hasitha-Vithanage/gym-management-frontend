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

  constructor(private http: HttpClient,
    private httpService: HttpService) { }

  setWorkoutData(data: any) {
    this.userDetails = data;
  }

  getWorkoutData() {
    return this.userDetails;
  }


    getTrainerById(): Observable<any> {
      const id = 9;
        const requestUrl = environment.baseUrl + '/trainer/' + id.toString();

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

}
