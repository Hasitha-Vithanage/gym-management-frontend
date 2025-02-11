import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormDemoServiceService {

  constructor(private http: HttpClient,
    private httpService: HttpService) 
    { }

  /*http client*/
  /* Get, Post, Delete, Put */

  serviceCall(form_details: any) {
    console.log("In the service");
    
    const requestUrl = environment.baseUrl + '/form-demo'; // http://localhost:8080/form-demo

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.post(requestUrl, form_details, { headers: headers });
  }

  // edit function
  edit(form_details: any) {
    console.log("In the service");
    
    const requestUrl = environment.baseUrl + '/form-demo${formDetails.id}'; // http://localhost:8080/form-demo

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.put(requestUrl, form_details, { headers: headers });
  }

  // getData function
  getData() {

    const requestUrl = environment.baseUrl + '/form-demo'; // http://localhost:8080/form-demo

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }
}
