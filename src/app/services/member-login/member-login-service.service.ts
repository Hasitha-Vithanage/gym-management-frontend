import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class MemberLoginServiceService {

constructor(private http: HttpClient, private httpService: HttpService) { }

    serviceCall(details: any) {
    console.log("Service Call!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/member-login'; // http://localhost:8080/member-login

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, details, { headers: headers });
  }

       editData(id: number, employee_details: any) {
    console.log("In editData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/member-login/' + id.toString(); // http://localhost:8080/assign-trainer

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
    const requestUrl = environment.baseUrl + '/member-login'; // http://localhost:8080/assign-trainer

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


  public getMemberById(memberId): Observable<any>{
        const requestUrl = environment.baseUrl + '/member/' + memberId.toString();

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

     deleteData(id: number) {
    console.log("In deleteData!");

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/member-login/' + id.toString(); // http://localhost:8080/assign-trainer

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
