import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  dueDate?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
  readStatus: boolean;
  targetUser?: number;
  other?: any;
  email?: string;
  mobile?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notifications.asObservable();

  private toastNotifications = new BehaviorSubject<Notification[]>([]);
  public toastNotifications$ = this.toastNotifications.asObservable();

  constructor(
    private httpService: HttpService,
    private http: HttpClient
  ) {}

  addNotification(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', targetUser?: number, details?: any) {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      timestamp: new Date(),
      readStatus: false,
      targetUser: targetUser,
      other: details ?? null
    };

    // save to db

    const notificationtemp = notification;
    notificationtemp.id = null;

    this.addNotificationToDb(notificationtemp).subscribe({
      next: (response: any) => {
        console.log(response);
        this.addNotificationToBell([response]);
      },
      // Displaying error message
      error: (error) => {
        console.log(error);
      }
    });
  }

  public addNotificationToBell(notification: Notification[]): void {
    // Add to main notifications
    const currentNotifications = this.notifications.value;
    this.notifications.next([...notification, ...currentNotifications]);

    // Add to toast notifications
    const currentToasts = this.toastNotifications.value;
    this.toastNotifications.next([...currentToasts, ...notification]);

    // Auto-remove toast after 5 seconds
    // setTimeout(() => {
    //   this.removeToast(notification.id);
    // }, 5000);
  }

  public getNotifications() {
    const userId = this.httpService.getUserId();

    const requestUrl = environment.baseUrl + '/notification/' + userId; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending GET request to the server
    return this.http.get(requestUrl, { headers: headers });
  }

  removeToast(notificationId: string) {
    const currentToasts = this.toastNotifications.value;
    this.toastNotifications.next(currentToasts.filter((n) => n.id !== notificationId));
  }

  markAsRead(notificationId: string) {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map((n) => (n.id === notificationId ? { ...n, readStatus: true } : n));
    this.notifications.next(updatedNotifications);

    this.changeNotificationStatus(notificationId).subscribe({
      next: (response: any) => {
        console.log(response);
      },
      // Displaying error message
      error: (error) => {
        console.log(error);
      }
    });
  }

  public changeNotificationStatus(id: String) {
    const requestUrl = environment.baseUrl + '/notification/changeStatus/' + id; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.put(requestUrl, null, { headers: headers });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public addNotificationToDb(notification: Notification) {
    const requestUrl = environment.baseUrl + '/notification'; // http://localhost:8080/employee

    let headers = {};

    if (this.httpService.getAuthToken() !== null) {
      headers = {
        Authorization: 'Bearer ' + this.httpService.getAuthToken()
      };
    }

    // sending POST request to the server
    return this.http.post(requestUrl, notification, { headers: headers });
  }
}
