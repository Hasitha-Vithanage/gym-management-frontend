import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({
  providedIn: 'root'
})
export class EmailServiceService {

  constructor(private http: HttpClient,
    private httpService: HttpService
  ) {
  }

  // Service call function for save new supplier
  public sendTrialRequest(data: any) {
    console.log("In the service");

    const requestUrl = environment.baseUrl + '/email/request-trial';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.post(requestUrl, data, { headers: headers });
  }
}
