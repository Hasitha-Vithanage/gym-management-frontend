import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  public userNameBehaviorSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  constructor(private http: HttpClient) {}

  getAuthToken(): string | null {
    return JSON.parse(window.localStorage.getItem('auth_token') as string);
  }

  setAuthToken(token: string | null): void {
    if (token !== null) {
      window.localStorage.setItem('auth_token', JSON.stringify(token));
    } else {
      window.localStorage.removeItem('auth_token');
    }
  }

  setUserId(id: number) {
    window.localStorage.setItem('user_id', id.toString());
  }

  getUserId() {
    return window.localStorage.getItem('user_id');
  }

  setLoginNameToCache(name: string) {
    window.localStorage.setItem('user_name', name);
    this.setUserName(name);
  }

  public setUserName(name: string): void {
    this.userNameBehaviorSubject.next(name);
  }

  getLoginNameFromCache(): string | null {
    return window.localStorage.getItem('user_name');
  }

  public getUserName(): Observable<string> {
    return this.userNameBehaviorSubject.asObservable();
  }

  removeToken() {
    window.localStorage.clear();
  }

  request(method: string, url: string, data: any): Promise<any> {
    const requestUrl = environment.baseUrl + url; // http://localhost:8080/login

    let headers = {};

    if (this.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.getAuthToken() };
    }

    // if (method === 'POST') {
    return this.http.post(requestUrl, data, { headers: headers }).toPromise();
    // }
  }

  get isLoggedIn() {
    if (window.localStorage.getItem('auth_token')) {
      return true;
    }
    return false;
  }

  public logOut(): void {
    this.request('GET', '/logout', {}).then((response) => {
      window.localStorage.clear();
    });
  }

  public getAuthIds(userId: number): Promise<any> {
    const requestUrl = environment.baseUrl + '/get-auth-ids/' + userId;

    let headers = {};

    if (this.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.getAuthToken() };
    }

    return this.http.get(requestUrl, { headers: headers }).toPromise();
  }

  getSystemPrivileges(): Promise<any> {
    const requestUrl = environment.baseUrl + '/system-privileges';

    let headers = {};

    if (this.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.getAuthToken() };
    }

    return this.http.get(requestUrl, { headers: headers }).toPromise();
  }

  saveSystemPrivileges(data: any): Promise<any> {
    const requestUrl = environment.baseUrl + '/system-privileges';

    let headers = {};

    if (this.getAuthToken() !== null) {
      headers = { Authorization: 'Bearer ' + this.getAuthToken() };
    }

    return this.http.put(requestUrl, data, { headers: headers }).toPromise();
  }

  public isTokenExpired() {
    const token = window.localStorage.getItem('auth_token');

    if (!token) {
      return false;
    }

    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  public clearCache(): void {
    this.removeToken();
  }
}
