import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({ providedIn: 'root' })
export class FoodItemService {

  constructor(private http: HttpClient, private httpService: HttpService) {}

  private get headers(): { [key: string]: string } {
    const token = this.httpService.getAuthToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  createFoodItem(data: any) {
    return this.http.post(`${environment.baseUrl}/food-items`, data, { headers: this.headers });
  }

  getAllFoodItems() {
    return this.http.get<any[]>(`${environment.baseUrl}/food-items`, { headers: this.headers });
  }

  updateFoodItem(id: number, data: any) {
    return this.http.put(`${environment.baseUrl}/food-items/${id}`, data, { headers: this.headers });
  }

  deleteFoodItem(id: number) {
    return this.http.put(`${environment.baseUrl}/food-items/delete/${id}`, {}, { headers: this.headers });
  }
}
