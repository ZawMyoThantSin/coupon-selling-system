import { Injectable, NgZone } from '@angular/core';
import { StorageService } from '../storage.service';
import { Observable, Subject } from 'rxjs';
import { getDefaultAppConfig } from '../../models/appConfig';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private messageSubject = new Subject<any>();
  private readonly serverUrl = `ws://${getDefaultAppConfig().websocketHost}/ws`;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 5000;
  private token!: string | null;
  private pingIntervalId!: any;

  constructor(private ngZone: NgZone, private storageService: StorageService) {
    this.token = this.storageService.getItem('token');
  }
  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.warn('WebSocket is already connected or connecting.');
      return;
    }

    if (!this.token) {
      console.error('WebSocket connection requires a valid JWT token.');
      return;
    }

    const wsUrl = `${this.serverUrl}?token=${encodeURIComponent(this.token)}`;
    console.log('Attempting to connect to WebSocket:', wsUrl);

    console.log('Attempting to connect to WebSocket:', wsUrl);
    this.socket = new WebSocket(wsUrl);

    // On successful connection
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.socket.onmessage = (event: MessageEvent) => {

      console.log('WebSocket message received:', event.data);

      this.ngZone.run(() => {
        try {
          const message = JSON.parse(event.data); // Parse JSON message if applicable
          this.messageSubject.next(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          this.messageSubject.next(event.data);
        }
      });
    };

    this.socket.onerror = (event: Event) => {
      console.error('WebSocket error:', event);
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.warn('WebSocket disconnected:', event.reason);
      this.stopHeartbeat(); // Stop heartbeat on disconnection
      this.handleReconnection();
    };
  }

  reconnect(token: string): void {
    this.token = token;
    this.disconnect(); // Close existing connection if any
    this.connect(); // Establish new connection
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.stopHeartbeat(); // Stop heartbeat on disconnection
      console.log('WebSocket disconnected manually.');
    }
  }

  send(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      console.log('Message sent:', message);
    } else {
      console.warn('WebSocket is not connected. Message not sent.');
    }
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`WebSocket reconnection failed after ${this.maxReconnectAttempts} attempts.`);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.calculateReconnectDelay();
    console.log(`Reconnecting in ${delay / 1000} seconds (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => this.connect(), delay);
  }


  private calculateReconnectDelay(): number {
    return Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
  }

  private startHeartbeat(): void {
    this.pingIntervalId = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'PING' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

}
