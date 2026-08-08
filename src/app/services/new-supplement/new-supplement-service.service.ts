import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({ providedIn: 'root' })
export class SupplementProductService {

  constructor(private http: HttpClient, private httpService: HttpService) {}

  private get headers(): { [key: string]: string } {
    const token = this.httpService.getAuthToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  createProduct(data: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/supplements`, data, { headers: this.headers });
  }

  getProductsForMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.baseUrl}/supplements`, { headers: this.headers });
  }

  getProductsForStaff(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.baseUrl}/supplements/all`, { headers: this.headers });
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.baseUrl}/supplements/${id}`, data, { headers: this.headers });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.put(`${environment.baseUrl}/supplements/delete/${id}`, {}, { headers: this.headers });
  }
}
