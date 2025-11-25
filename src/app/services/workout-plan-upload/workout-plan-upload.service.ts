import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({
  providedIn: 'root'
})
export class WorkoutPlanUploadService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

  // getData function
  getData() {

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/workout-plan-upload'; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.get(requestUrl, { headers: headers });
  }


  // backend calling function
  serviceCall(workoutData: any) {
    console.log("Service Call!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/workout-plan-upload'; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, workoutData, { headers: headers });
  }


  // editData function
  uploadWorkout(id: number, employee_details: any) {
    console.log("In editData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/workout-plan-upload/' + id.toString(); // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.put(requestUrl, employee_details, { headers: headers });
  }
  

getPdf(userId: string) {
  console.log("Fetching PDF for user:", userId);

  const requestUrl = environment.baseUrl + '/my-workout-plan/' + userId;

  let headers = {};

  if (this.httpService.getAuthToken() !== null) {
    headers = {
      Authorization: 'Bearer ' + this.httpService.getAuthToken()
    };
  }

  return this.http.get(requestUrl, { headers: headers, responseType: 'blob' });
}


  deleteRecord(id: number) {

  const requestUrl = environment.baseUrl + '/my-workout-plan/' + id.toString();

  let headers = {};

  if (this.httpService.getAuthToken() !== null) {
    headers = {
      Authorization: 'Bearer ' + this.httpService.getAuthToken()
    };
  }

  return this.http.delete(requestUrl, { headers: headers });
  }


}
