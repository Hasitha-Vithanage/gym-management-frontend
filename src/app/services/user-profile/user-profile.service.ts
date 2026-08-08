import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(
    private readonly http: HttpClient,
    private readonly httpService: HttpService
  ) { }

  updateUser(userId: number, data: { firstName: string; lastName: string; email: string }) {
    const requestUrl = environment.baseUrl + '/user/' + userId.toString();
    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.httpService.getAuthToken() };
    }
    return this.http.put(requestUrl, data, { headers });
  }

  getUserData(userId: any) {
    const requestUrl = environment.baseUrl + '/get-user-data/'  + userId.toString();

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.get(requestUrl, { headers: headers });
  }

  getAllUsers() {
    const requestUrl = environment.baseUrl + '/get-all-users';

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.get(requestUrl, { headers: headers });
  }

  approveUser(userId: any) {
    const requestUrl = environment.baseUrl + '/approve-user/' + userId.toString();

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.put(requestUrl, { headers: headers });
  }

  rejectUser(userId: any) {
    const requestUrl = environment.baseUrl + '/reject-user/' + userId.toString();

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.put(requestUrl, { headers: headers });
  }
}
