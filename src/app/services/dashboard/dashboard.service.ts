import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

    totalEmployeeCount() {
      // creating requesting URL
        const requestUrl = environment.baseUrl + '/employee-count'; // http://localhost:8080/employee
    
        let headers = {};
    
        if (this.httpService.getAuthToken() !== null) {
          headers = {
            Authorization: 'Bearer ' + this.httpService.getAuthToken()
          };
        }
    
        // sending GET request to the server
        return this.http.get(requestUrl, { headers: headers });
  }

  totalMemberCount() {
      // creating requesting URL
        const requestUrl = environment.baseUrl + '/member-count'; // http://localhost:8080/employee
    
        let headers = {};
    
        if (this.httpService.getAuthToken() !== null) {
          headers = {
            Authorization: 'Bearer ' + this.httpService.getAuthToken()
          };
        }
    
        // sending GET request to the server
        return this.http.get(requestUrl, { headers: headers });
  }

  totalSupplierCount() {
      // creating requesting URL
        const requestUrl = environment.baseUrl + '/supplier-count'; // http://localhost:8080/employee
    
        let headers = {};
    
        if (this.httpService.getAuthToken() !== null) {
          headers = {
            Authorization: 'Bearer ' + this.httpService.getAuthToken()
          };
        }
    
        // sending GET request to the server
        return this.http.get(requestUrl, { headers: headers });
  }

  newMembersInThisMonth() {
      // creating requesting URL
        const requestUrl = environment.baseUrl + '/new-members'; // http://localhost:8080/employee
    
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
