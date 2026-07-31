import { Injectable } from '@angular/core';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NutritionProfileService {

  constructor(private readonly http: HttpClient, private readonly httpService: HttpService) { }

  private get headers(): { [key: string]: string } {
    const token = this.httpService.getAuthToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  submitProfile(profileData: any) {
    return this.http.post(`${environment.baseUrl}/nutrition-profile`, profileData, { headers: this.headers });
  }

  getAllProfiles() {
    return this.http.get(`${environment.baseUrl}/nutrition-profile`, { headers: this.headers });
  }

  hasProfile(userId: string) {
    return this.http.get<boolean>(`${environment.baseUrl}/nutrition-profile/exists/${userId}`, { headers: this.headers });
  }

  getProfileByUserId(userId: string) {
    return this.http.get(`${environment.baseUrl}/nutrition-profile/${userId}`, { headers: this.headers });
  }

  getPendingRequestsForTrainer(trainerUserId: number) {
    return this.http.get<any[]>(
      `${environment.baseUrl}/nutrition-profile/pending-custom/trainer/${trainerUserId}`,
      { headers: this.headers }
    );
  }

  updateStatusByUserId(userId: string, status: string) {
    const url = `${environment.baseUrl}/nutrition-profile/user/${encodeURIComponent(userId)}/status?status=${encodeURIComponent(status)}`;
    return this.http.put(url, null, { headers: this.headers });
  }
}
