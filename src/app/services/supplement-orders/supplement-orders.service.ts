import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';


@Injectable({
  providedIn: 'root'
})
export class SupplementOrdersService {

  constructor(private http: HttpClient, private httpService: HttpService) { }
    
  getOrderDetails() {
  
      // creating requesting URL
      const requestUrl = environment.baseUrl + '/get-orders'; // http://localhost:8080/employee
  
      let headers = {};
  
      if (this.httpService.getAuthToken() !== null) {
        headers = {
          Authorization: 'Bearer ' + this.httpService.getAuthToken()
        };
      }
  
      // sending GET request to the server
      return this.http.get(requestUrl, { headers: headers });
    }

    getOrderItemDetails() {
  
      // creating requesting URL
      const requestUrl = environment.baseUrl + '/get-order-items'; // http://localhost:8080/employee
  
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
