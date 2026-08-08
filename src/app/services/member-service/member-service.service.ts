import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MemberServiceService {

  constructor(private http: HttpClient, private httpService: HttpService) { }

  // Data saving backend call function
  serviceCall(form_details: any) {
    const requestUrl = environment.baseUrl + '/member';

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.post(requestUrl, form_details, { headers: headers });
  }


  // Data retrieving backend call
  getData() {
    const requestUrl = environment.baseUrl + '/member';

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }


  // Data updating backend call function
  editData(id: number, form_details: any) {
    const requestUrl = environment.baseUrl + '/member/' + id.toString();

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.put(requestUrl, form_details, { headers: headers });
  }


  // Delete data backend call function
  deleteData(id: number) {
    const requestUrl = environment.baseUrl + '/member/delete/' + id.toString();

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.put(requestUrl, { isDelete: true }, { headers: headers });
  }


  markAttendance(attendanceData: any) {

    // creating requesting URL
    const requestUrl = environment.baseUrl + '/memberService/mark-attendance/present/' + attendanceData.member; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, attendanceData, { headers: headers });
  }

  // GetUser by ID
  getUserById(userId: number) {
    const requestUrl = environment.baseUrl + '/user/' + userId.toString();

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  getMemberProfile(userId: number) {
    const requestUrl = environment.baseUrl + '/member/profile/' + userId.toString();
    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.httpService.getAuthToken() };
    }
    return this.http.get(requestUrl, { headers });
  }

  updateMemberProfile(userId: number, data: any) {
    const requestUrl = environment.baseUrl + '/member/profile/' + userId.toString();
    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.httpService.getAuthToken() };
    }
    return this.http.put(requestUrl, data, { headers });
  }

  // GetUser by ID
  getMemberById(userId: number) {
    const requestUrl = environment.baseUrl + '/member/' + userId.toString();

    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }
    return this.http.get(requestUrl, { headers: headers });
  }

  markAttendanceByMemberNo(memberNo: string) {
    const requestUrl = environment.baseUrl + '/memberService/mark-attendance/present/' + memberNo;
    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.httpService.getAuthToken() };
    }
    return this.http.post(requestUrl, {}, { headers });
  }

  getTodayAttendance() {
    const requestUrl = environment.baseUrl + '/memberService/attendance/today';
    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.httpService.getAuthToken() };
    }
    return this.http.get(requestUrl, { headers });
  }

  getAttendanceHistory(memberNo: string, year: number, month: number) {
    const requestUrl = `${environment.baseUrl}/memberService/attendance/history/${memberNo}?year=${year}&month=${month}`;
    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.httpService.getAuthToken() };
    }
    return this.http.get<any[]>(requestUrl, { headers });
  }

  getDailyCheckIns(year: number, month: number) {
    const requestUrl = `${environment.baseUrl}/memberService/attendance/daily-counts?year=${year}&month=${month}`;
    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.httpService.getAuthToken() };
    }
    return this.http.get<any[]>(requestUrl, { headers });
  }

  getPeakHours() {
    const requestUrl = `${environment.baseUrl}/memberService/attendance/peak-hours`;
    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.httpService.getAuthToken() };
    }
    return this.http.get<any[]>(requestUrl, { headers });
  }

  getAtRiskMembers(days: number = 14) {
    const requestUrl = `${environment.baseUrl}/memberService/attendance/at-risk?days=${days}`;
    let headers = {};
    if (this.httpService.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.httpService.getAuthToken() };
    }
    return this.http.get<any[]>(requestUrl, { headers });
  }
}
