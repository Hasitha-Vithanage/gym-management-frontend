import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';

@Injectable({ providedIn: 'root' })
export class MealPlanTemplateService {

  constructor(private http: HttpClient, private httpService: HttpService) {}

  private get headers(): { [key: string]: string } {
    const token = this.httpService.getAuthToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  createTemplate(data: any) {
    return this.http.post(`${environment.baseUrl}/meal-plan-templates`, data, { headers: this.headers });
  }

  getAllTemplates() {
    return this.http.get<any[]>(`${environment.baseUrl}/meal-plan-templates`, { headers: this.headers });
  }

  getTemplateById(id: number) {
    return this.http.get<any>(`${environment.baseUrl}/meal-plan-templates/${id}`, { headers: this.headers });
  }

  updateTemplate(id: number, data: any) {
    return this.http.put(`${environment.baseUrl}/meal-plan-templates/${id}`, data, { headers: this.headers });
  }

  deleteTemplate(id: number) {
    return this.http.put(`${environment.baseUrl}/meal-plan-templates/delete/${id}`, {}, { headers: this.headers });
  }

  getMealItems(templateId: number) {
    return this.http.get<any[]>(
      `${environment.baseUrl}/meal-plan-templates/${templateId}/meal-items`,
      { headers: this.headers }
    );
  }

  saveMealItems(templateId: number, items: any[]) {
    return this.http.post(
      `${environment.baseUrl}/meal-plan-templates/${templateId}/meal-items`,
      items,
      { headers: this.headers }
    );
  }

  deleteMealItem(templateId: number, id: number) {
    return this.http.delete(
      `${environment.baseUrl}/meal-plan-templates/${templateId}/meal-items/${id}`,
      { headers: this.headers }
    );
  }
}
