import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({ providedIn: 'root' })
export class EquipmentManagementService {

  constructor(private http: HttpClient, private httpService: HttpService) {}

  private get headers() {
    const token = this.httpService.getAuthToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  getAllEquipment(): Observable<any[]> {
    return this.http.get<any[]>(environment.baseUrl + '/equipments', { headers: this.headers });
  }

  getStatusSummary(): Observable<any> {
    return this.http.get<any>(environment.baseUrl + '/equipments/summary', { headers: this.headers });
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(environment.baseUrl + '/equipments/' + id + '/status', { status }, { headers: this.headers });
  }

  getMaintenanceLogs(equipmentId: number): Observable<any[]> {
    return this.http.get<any[]>(environment.baseUrl + '/equipment-maintenance/' + equipmentId, { headers: this.headers });
  }

  addMaintenanceLog(equipmentId: number, log: any): Observable<any> {
    return this.http.post<any>(environment.baseUrl + '/equipment-maintenance/' + equipmentId, log, { headers: this.headers });
  }
}
