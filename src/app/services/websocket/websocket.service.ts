import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private client: Client;
  private friendUpdates$: BehaviorSubject<any> = new BehaviorSubject(null);
  private transferUpdates$: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    this.client.onConnect = () => {
      console.log('Connected to WebSocket');

      // Subscribe to specific topics for updates
      this.client.subscribe('/topic/friend-updates', (message: Message) => {
        this.friendUpdates$.next(JSON.parse(message.body));
      });

      this.client.subscribe('/topic/transfer-updates', (message: Message) => {
        this.transferUpdates$.next(JSON.parse(message.body));
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
    };

    this.client.activate();
  }

  // Expose friend updates as an observable
  getFriendUpdates(): Observable<any> {
    return this.friendUpdates$.asObservable();
  }

  // Expose transfer updates as an observable
  getTransferUpdates(): Observable<any> {
    return this.transferUpdates$.asObservable();
  }

  // Optional: Publish messages to a specific topic
  sendMessage(topic: string, message: any): void {
    this.client.publish({ destination: topic, body: JSON.stringify(message) });
  }
}
