import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getDefaultAppConfig } from '../../models/appConfig';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private BASE_URL = getDefaultAppConfig().backendHost;

  constructor(private http: HttpClient) {}

  getNotificationsByReceiver(receiverId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.BASE_URL}/api/notifications?receiverId=${receiverId}`
    );
  }

  getUnreadCount(receiverId: number): Observable<number> {
    return this.http.get<number>(
      `${this.BASE_URL}/api/notifications/unread-count?receiverId=${receiverId}`
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(
      `${this.BASE_URL}/api/notifications/${notificationId}/mark-read`,
      {}
    );
  }

  markAllAsRead(receiverId: number): Observable<void> {
    return this.http.put<void>(
      `${this.BASE_URL}/api/notifications/mark-all-read?receiverId=${receiverId}`,
      {}
    );
  }

  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/api/notifications/${notificationId}`);
  }
}
