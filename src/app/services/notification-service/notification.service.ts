import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notifications.asObservable();

  private toastNotifications = new BehaviorSubject<Notification[]>([]);
  public toastNotifications$ = this.toastNotifications.asObservable();

  addNotification(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };

    // Add to main notifications
    const currentNotifications = this.notifications.value;
    this.notifications.next([notification, ...currentNotifications]);

    // Add to toast notifications
    const currentToasts = this.toastNotifications.value;
    this.toastNotifications.next([...currentToasts, notification]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      this.removeToast(notification.id);
    }, 5000);
  }

  removeToast(notificationId: string) {
    const currentToasts = this.toastNotifications.value;
    this.toastNotifications.next(currentToasts.filter((n) => n.id !== notificationId));
  }

  markAsRead(notificationId: string) {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
    this.notifications.next(updatedNotifications);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
