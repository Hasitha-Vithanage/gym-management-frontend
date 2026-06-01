import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookClassService {

  constructor(private readonly http: HttpClient, private readonly httpService: HttpService) { }

  private get headers() {
    const token = this.httpService.getAuthToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  confirmBooking(classId: number, userId: number) {
    const url = `${environment.baseUrl}/booking-class/confirm/${classId}`;
    return this.http.post(url, { userId }, { headers: this.headers });
  }

  // Legacy endpoint kept for backward compatibility
  bookClass(formData: any) {
    const url = environment.baseUrl + '/booking-class';
    return this.http.post(url, formData, { headers: this.headers });
  }
}
