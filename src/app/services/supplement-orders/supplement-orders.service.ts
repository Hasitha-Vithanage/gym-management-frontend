import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({ providedIn: 'root' })
export class SupplementOrderService {

  constructor(private http: HttpClient, private httpService: HttpService) {}

  private get headers(): { [key: string]: string } {
    const token = this.httpService.getAuthToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  placeOrder(data: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/supplement-orders`, data, { headers: this.headers });
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.baseUrl}/supplement-orders`, { headers: this.headers });
  }

  getOrdersByMember(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.baseUrl}/supplement-orders/member/${username}`, { headers: this.headers });
  }

  completeOrder(id: number): Observable<any> {
    return this.http.put(`${environment.baseUrl}/supplement-orders/${id}/complete`, {}, { headers: this.headers });
  }

  cancelOrder(id: number): Observable<any> {
    return this.http.put(`${environment.baseUrl}/supplement-orders/${id}/cancel`, {}, { headers: this.headers });
  }
}
