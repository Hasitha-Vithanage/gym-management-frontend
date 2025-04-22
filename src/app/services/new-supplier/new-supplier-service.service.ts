import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewSupplierServiceService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

  // Service call function for save new supplier
  serviceCall(form_details: any) {
    console.log("In the service");

    const requestUrl = environment.baseUrl + '/suppliers';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.post(requestUrl, form_details, { headers: headers });
  }

  // GetData function
  getData() {
    const requestUrl = environment.baseUrl + '/suppliers';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  // EditData function
  editData(id: number, form_details: any) {

    const requestUrl = environment.baseUrl + '/suppliers/' + id.toString();

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.put(requestUrl, form_details, { headers: headers });
  }

  // DeleteData function
deleteSupplier(id: number) {
  const requestUrl = environment.baseUrl + '/suppliers/' + id.toString();

  let headers = {};
  if (this.httpService.getAuthToken() !== null) {
    headers = {
      Authorization: 'Bearer ' + this.httpService.getAuthToken()
    };
  }

  return this.http.delete(requestUrl, { headers: headers });
}
}
  