import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MembershipCategoryService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

  // backend calling function
  serviceCall(details: any) {
    console.log("Service Call!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/membership-category'; // http://localhost:8080/assign-trainer

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, details, { headers: headers });
  }

  // editData function
  editData(id: number, employee_details: any) {
    console.log("In editData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/membership-category/' + id.toString(); // http://localhost:8080/assign-trainer

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
    const requestUrl = environment.baseUrl + '/membership-category'; // http://localhost:8080/assign-trainer

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
    const requestUrl = environment.baseUrl + '/membership-category/' + id.toString(); // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.delete(requestUrl, { headers: headers });
  }

    // Service all for get suppliers
  public getMembershipCategory() {
    const requestUrl = environment.baseUrl + '/membership-category';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

}
