import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket!: WebSocket;
  private messageSubject = new Subject<any>();
  private readonly serverUrl = 'ws://localhost:8080/ws';
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 5000;
  private token!: string | null;

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
    };

    this.socket.onmessage = (event: MessageEvent) => {

      console.log('WebSocket message received:', event.data);

      this.ngZone.run(() => {
        // Since messages are plain strings, no JSON parsing
        this.messageSubject.next(event.data);
      });
    };

    this.socket.onerror = (event: Event) => {
      console.error('WebSocket error:', event);
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.warn('WebSocket disconnected:', event.reason);
      this.handleReconnection();
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      console.log('WebSocket disconnected manually.');
    }
  }

  /**
   * Sends a message to the WebSocket server.
   * @param message 
   *  
   */
  send(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      console.log('Message sent:', message);
    } else {
      console.warn('WebSocket is not connected. Message not sent.');
    }
  }

  /**
   * Subscribes to incoming WebSocket messages.
   * @returns 
   */
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

  /**
   * Calculates an exponential backoff delay for reconnection attempts.
   * @returns 
   */
  private calculateReconnectDelay(): number {
    return Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); 
  }

}
