import { Injectable } from '@angular/core';
import { getDefaultAppConfig } from '../../models/appConfig';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../websocket/websocket.service';
import { StorageService } from '../storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private BASE_URL = `${getDefaultAppConfig().backendHost}/messages`;

  constructor(
    private http: HttpClient,
    private websocketService: WebsocketService,
  ) {}

  sendMessage(message: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/send`, message, {});
  }

  editMessage(messageId : number, message: any): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/edit/${messageId}`, message, {});
  }

  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/delete/${messageId}`, {});
  }

  getChatMessages(userId1: number, userId2: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/chat/${userId1}/${userId2}`, {});
  }

  addReaction(messageId: number, userId: number, reaction: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/react/${messageId}/${userId}`, reaction);
  }

  removeReaction(messageId: number, userId: number): Observable<any> {
    return this.http.delete<any>(`${this.BASE_URL}/unreact/${messageId}/${userId}`);
  }
}
