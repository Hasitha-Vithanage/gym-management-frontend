import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewSupplementServiceService {

  constructor(private http: HttpClient, private httpService: HttpService) { }


  // Data saving backend call function
  serviceCall(form_details: any) {
    const requestUrl = environment.baseUrl + '/supplement';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.post(requestUrl, form_details, { headers: headers });
  }


  // Data updating backend call function
  editData(id: number, form_details: any) {
    const requestUrl = environment.baseUrl + '/supplement/' + id.toString();

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.put(requestUrl, form_details, { headers: headers });
  }


  // Delete data backend call function
  deleteData(id: number) {
    const requestUrl = environment.baseUrl + '/supplement/' + id.toString();

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.delete(requestUrl, { headers: headers });
  }


  // Data retrieving backend call
  getData() {
    const requestUrl = environment.baseUrl + '/supplement';

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  // Get supplement data by id
  getSupplementById(id: number) {
    const requestUrl = environment.baseUrl + '/supplement/' + id;

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }


  // Service all for get suppliers
  public getSuppliers() {
    const requestUrl = environment.baseUrl + '/supplement/get-suppliers';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  // Place order function
  placeOrder(orderDto: any) {
    console.log('Placing order with details Array:', orderDto);
    
    const requestUrl = environment.baseUrl + '/supplement/place-order';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    // Combine all data into a single request body
    return this.http.post(requestUrl, orderDto, { headers: headers });
  }



}
