import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TrainerLoginServiceService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

    serviceCall(details: any) {
    console.log("Service Call!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/trainer-login'; // http://localhost:8080/trainer-login

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, details, { headers: headers });
  }
  

    // Call the backend service to get the trainers
    getTrainers() {
      console.log("In the service");
  
      const requestUrl = environment.baseUrl + '/employee'; // http://localhost:8080/form-demo
  
      let headers = {};
  
      if (this.httpService.getAuthToken() !== null) {
        headers = {
          Authorization: 'Bearer ' + this.httpService.getAuthToken()
        };
      }
      return this.http.get(requestUrl, { headers: headers });
    }

     editData(id: number, employee_details: any) {
    console.log("In editData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/trainer-login/' + id.toString(); // http://localhost:8080/assign-trainer

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.put(requestUrl, employee_details, { headers: headers });
  }

    getData() {

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/trainer-login'; // http://localhost:8080/assign-trainer

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.get(requestUrl, { headers: headers });
  }

   deleteData(id: number) {
    console.log("In deleteData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/trainer-login/' + id.toString(); // http://localhost:8080/assign-trainer

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.delete(requestUrl, { headers: headers });
  }

  toggleStatus(id: number) {
    const requestUrl = environment.baseUrl + '/trainer-login/' + id + '/status';
    return this.http.patch(requestUrl, {});
  }
}
