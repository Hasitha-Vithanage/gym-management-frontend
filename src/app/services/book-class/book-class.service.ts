import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookClassService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

  // serviceCall(data: FormData) {
  //   console.log('Booking Class with details Array:', data);

  //   const requestUrl = environment.baseUrl + '/book-class';

  //   let headers = {};
  //   if (this.httpService.getAuthToken() !== null) {
  //     headers = {
  //       Authorization: 'Bearer ' + this.httpService.getAuthToken()
  //     };
  //   }
  //   // Combine all data into a single request body
  //   return this.http.post(requestUrl, data, { headers: headers });
  // }

  bookClass(formData: any) {

    const requestUrl = environment.baseUrl + '/booking-class';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    // Combine all data into a single request body
    return this.http.post(requestUrl, formData, { headers: headers });
  }

}
