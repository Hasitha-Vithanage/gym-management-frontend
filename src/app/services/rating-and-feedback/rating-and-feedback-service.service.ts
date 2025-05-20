import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({
  providedIn: 'root'
})
export class RatingAndFeedbackServiceService {

  constructor(private http: HttpClient,
    private httpService: HttpService) { }

  // Call the backend service to save the form data
  serviceCall(form_details: any) {
    console.log("In the service");

    const requestUrl = environment.baseUrl + '/ratings&feedback'; // http://localhost:8080/form-demo

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.post(requestUrl, form_details, { headers: headers });
  }

  // Call the backend service to get the trainers
  getTrainers() {
    console.log("In the service");

    const requestUrl = environment.baseUrl + '/ratings&feedback/getTrainers'; // http://localhost:8080/form-demo

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  // getData function
  getData() {

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/ratings&feedback'; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.get(requestUrl, { headers: headers });
  }

  // editData function
  editData(id: number, form_details: any) {
    console.log("In editData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/ratings&feedback/' + id.toString(); // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.put(requestUrl, form_details, { headers: headers });
  }

  // deleteData function
  deleteData(id: number) {
    console.log("In deleteData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/ratings&feedback/' + id.toString(); // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.delete(requestUrl, { headers: headers });
  }
}
