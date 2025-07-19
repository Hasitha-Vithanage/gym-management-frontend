import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignTrainerServiceService {
  constructor(
    private http: HttpClient,
    private httpService: HttpService
  ) {}

  // backend calling function
  serviceCall(details: any) {
    console.log('Service Call!');

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/assign-trainer'; // http://localhost:8080/assign-trainer

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, details, { headers: headers });
  }

  // getData function
  getData() {
    // creating requesting URL
    const requestUrl = environment.baseUrl + '/assign-trainer'; // http://localhost:8080/assign-trainer

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.get(requestUrl, { headers: headers });
  }

  // Service all for get suppliers
  public getMembers() {
    const requestUrl = environment.baseUrl + '/member';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  // Call the backend service to get the trainers
  getTrainers() {
    console.log('In the service');

    const requestUrl = environment.baseUrl + '/getTrainers'; // http://localhost:8080/form-demo

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  // editData function
  editData(id: number, employee_details: any) {
    console.log('In editData!');

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/assign-trainer/' + id.toString(); // http://localhost:8080/assign-trainer

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.put(requestUrl, employee_details, { headers: headers });
  }

  // deleteData function
  deleteData(id: number) {
    console.log('In deleteData!');

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/assign-trainer/' + id.toString(); // http://localhost:8080/assign-trainer

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.delete(requestUrl, { headers: headers });
  }

  public getTrainerUserId(id: number) {
    const requestUrl = environment.baseUrl + '/trainer-user-id/' + id.toString();

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  public getMemberUserId(id: number) {
    const requestUrl = environment.baseUrl + '/member-user-id/' + id.toString();

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }
}
