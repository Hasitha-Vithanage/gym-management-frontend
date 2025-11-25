import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpolyeeServiceService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

  // backend calling function
  serviceCall(employee_details: any) {
    console.log("Service Call!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/employee'; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, employee_details, { headers: headers });
  }

  // getData function
  getData() {

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/employee'; // http://localhost:8080/employee

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
  editData(id: number, employee_details: any) {
    console.log("In editData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/employee/' + id.toString(); // http://localhost:8080/employee

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
    console.log("In deleteData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/employee/delete/' + id.toString(); // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.put(requestUrl, { isDelete: true }, { headers: headers });
  }

// markAttendance function
    markAttendance(attendanceData: any) {
      
      // creating requesting URL
    const requestUrl = environment.baseUrl + '/employeeService/mark-attendance/' + attendanceData.employee; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, attendanceData, { headers: headers });
  }
}
