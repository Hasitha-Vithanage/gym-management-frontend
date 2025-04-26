import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({
  providedIn: 'root'
})
export class NewEquipmentServiceService {

  // Service all for get suppliers
  public getSuppliers() {
    const requestUrl = environment.baseUrl + '/equipments/get-suppliers';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  constructor(private http: HttpClient, private httpService: HttpService) { }

  // Service call function for save new supplier
  serviceCall(form_details: any) {
    console.log("In the service");

    const requestUrl = environment.baseUrl + '/equipments';

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
    const requestUrl = environment.baseUrl + '/equipments';

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

    const requestUrl = environment.baseUrl + '/equipments/' + id.toString();

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.put(requestUrl, form_details, { headers: headers });
  }

  // DeleteData function
  deleteEquipment(id: number) {
    const requestUrl = environment.baseUrl + '/equipments/' + id.toString();

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    return this.http.delete(requestUrl, { headers: headers });
  }

    // Get suppliers based on category
    getSuppliersByCategory(category: string) {
      const requestUrl = environment.baseUrl + `/suppliers/by-equipment-type?type=${category}`;
  
      let headers = {};
      if (this.httpService.getAuthToken() !== null) {
        headers = {
          Authorization: 'Bearer ' + this.httpService.getAuthToken()
        };
      }
  
      return this.http.get<any[]>(requestUrl, { headers: headers });
    }
}
