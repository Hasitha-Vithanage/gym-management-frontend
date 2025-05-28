import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NutritionAndMealPlansServiceService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

  // backend calling function
    serviceCall(employee_details: any) {
      console.log("Service Call!");
  
      // creating requesting URL
      const requestUrl = environment.baseUrl + '/nutrition&meal-plan'; // http://localhost:8080/employee
  
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
      const requestUrl = environment.baseUrl + '/nutrition&meal-plan'; // http://localhost:8080/employee
  
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
      const requestUrl = environment.baseUrl + '/nutrition&meal-plan/' + id.toString(); // http://localhost:8080/employee
  
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
      const requestUrl = environment.baseUrl + '/nutrition&meal-plan/' + id.toString(); // http://localhost:8080/employee
  
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
