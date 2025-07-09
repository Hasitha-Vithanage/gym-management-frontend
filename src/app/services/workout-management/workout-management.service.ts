import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

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

  clearWorkoutData() {
    this.userDetails = null;
  }

  getTrainerByUserName(userName: any) {
    console.log("In editData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/intermediate-workout-plan/' + userName.toString();

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.get(requestUrl, { headers: headers });
  }
}
