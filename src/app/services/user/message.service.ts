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
    private storageService: StorageService // Token management (if required)
  ) {}

  sendMessage(message: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/send`, message, {});
  }

  getChatMessages(userId1: number, userId2: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/chat/${userId1}/${userId2}`, {});
  }

  connectWebSocket(): void {
    this.websocketService.connect();
  }

  disconnectWebSocket(): void {
    this.websocketService.disconnect();
  }
}
