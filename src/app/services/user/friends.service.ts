import { Injectable } from '@angular/core';
import { filter, map, Observable,of } from 'rxjs';
import { FriendshipResponse } from '../../models/friendship-response.models';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  BASE_URL = 'http://localhost:8080/friendship';
  public token: any;

  constructor(private http: HttpClient, private storageService: StorageService,
    private websocketService: WebsocketService) {
    this.token = this.storageService.getItem('token');
  }

  private createAuthHeader(): any {
    if (this.token) {
      console.log('Token found in storage..', this.token);
      return new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
    } else {
      console.log('Not Found!');
    }
    return null;
  }

  connectWebSocket(): void {
    this.websocketService.connect();
  }

  disconnectWebSocket(): void {
    this.websocketService.disconnect();
  }

  getFriendRequestUpdates(): Observable<any> {
    return this.websocketService.onMessage().pipe(
      filter((message) => message.type === 'FRIEND_REQUEST_UPDATE'), 
      map((message) => message.payload) // Extract payload
    );
  }

  sendFriendRequest(request: any): Observable<FriendshipResponse> {
    if (!request.senderId || !request.accepterId) {
      throw new Error('Sender or Accepter ID is missing');
    }
    return this.http.post<FriendshipResponse>(`${this.BASE_URL}`, request, {
      headers: this.createAuthHeader(),
    });
  }

  acceptFriendRequest(id: number): Observable<FriendshipResponse> {
    return this.http.put<FriendshipResponse>(`${this.BASE_URL}/${id}/accept`, {}, {
      headers: this.createAuthHeader(),
    });
  }

  denyFriendRequest(id: number): Observable<FriendshipResponse> {
    return this.http.put<FriendshipResponse>(`${this.BASE_URL}/${id}/deny`, {}, {
      headers: this.createAuthHeader(),
    });
  }

  getFriends(userId: number): Observable<FriendshipResponse[]> {
    return this.http.get<FriendshipResponse[]>(`${this.BASE_URL}/${userId}/friends`, {
      headers: this.createAuthHeader(),
    });
  }

  getPendingRequests(userId: number): Observable<FriendshipResponse[]> {
    return this.http.get<FriendshipResponse[]>(`${this.BASE_URL}/${userId}/pending`, {
      headers: this.createAuthHeader(),
    });
  }

  searchUsersByEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/search`, {
      headers: this.createAuthHeader(),
      params: { email },
      responseType: 'json',
    });
  }

  unfriend(userId: number, friendId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${userId}/unfriend/${friendId}`, {
      headers: this.createAuthHeader(),
    });
  }

  getFriendDetails(friendId: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/friend/${friendId}`, {
      headers: this.createAuthHeader(),
    });
  }
}
