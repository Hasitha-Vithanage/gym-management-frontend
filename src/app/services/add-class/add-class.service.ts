import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddClassService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

  // backend calling function
  serviceCall(class_details: any) {
    console.log("Service Call!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/add-class';

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, class_details, { headers: headers });
  }

  // editData function
  editData(id: number, class_details: any) {
    console.log("In editData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/update-class/' + id.toString();

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.put(requestUrl, class_details, { headers: headers });
  }

   // deleteData function
  deleteData(id: number) {
    console.log("In deleteData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/add-class/' + id.toString(); // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.delete(requestUrl, { headers: headers });
  }

  getData() {

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/add-class'; // http://localhost:8080/employee

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
