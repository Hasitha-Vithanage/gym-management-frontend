import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MealPlanUploadService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

    // backend calling function
  serviceCall(MealPlanData: any) {
    console.log("Service Call!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/meal-plan-upload'; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, MealPlanData, { headers: headers });
  }

  getPdf(userId: string) {
  console.log("Fetching PDF for user:", userId);

  const requestUrl = environment.baseUrl + '/my-meal-plan/' + userId;

  let headers = {};

  if (this.httpService.getAuthToken() !== null) {
    headers = {
      Authorization: 'Bearer ' + this.httpService.getAuthToken()
    };
  }

  return this.http.get(requestUrl, { headers: headers, responseType: 'blob' });
}

  getData() {

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/nutrition&meal-plan'; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.get(requestUrl, { headers: headers });
  }

  deleteRecord(id: number) {

    const requestUrl = environment.baseUrl + '/meal-plan-upload/' + id.toString();

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    return this.http.delete(requestUrl, { headers: headers });
  }



}
