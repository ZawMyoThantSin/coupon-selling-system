import { Injectable } from '@angular/core';
import { Observable,filter,map,of } from 'rxjs';
import { FriendshipResponse } from '../../models/friendship-response.models';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { WebsocketService } from '../websocket/websocket.service';
import { getDefaultAppConfig } from '../../models/appConfig';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  BASE_URL = `${getDefaultAppConfig().backendHost}/friendship`;
  public token: any;

  constructor(
    private http: HttpClient,
    private websocketService: WebsocketService,
    private storageService: StorageService // Inject the StorageService to manage the token
  ) {
    this.token = this.storageService.getItem('token'); // Retrieve token from storage
  }



  connectWebSocket(): void {
    this.websocketService.connect();
  }

  disconnectWebSocket(): void {
    this.websocketService.disconnect();
  }



  sendFriendRequest(request: any): Observable<FriendshipResponse> {
    if (!request.senderId || !request.accepterId) {
      throw new Error('Sender or Accepter ID is missing');
    }
    return this.http.post<FriendshipResponse>(`${this.BASE_URL}`, request, {});
  }

  acceptFriendRequest(id: number): Observable<FriendshipResponse> {
    return this.http.put<FriendshipResponse>(`${this.BASE_URL}/${id}/accept`, {}, {});
  }

  denyFriendRequest(id: number): Observable<FriendshipResponse> {
    return this.http.put<FriendshipResponse>(`${this.BASE_URL}/${id}/deny`, {}, {});
  }

  cancelFriendRequest(id: number): Observable<FriendshipResponse> {
    return this.http.put<FriendshipResponse>(`${this.BASE_URL}/${id}/cancel`, {}, {});
  }

  getFriends(userId: number): Observable<FriendshipResponse[]> {
    return this.http.get<FriendshipResponse[]>(`${this.BASE_URL}/${userId}/friends`, {
    });
  }

  getPendingRequests(userId: number): Observable<FriendshipResponse[]> {
    return this.http.get<FriendshipResponse[]>(`${this.BASE_URL}/${userId}/pending`, {});
  }

  getSentPendingRequests(userId: number): Observable<FriendshipResponse[]> {
    return this.http.get<FriendshipResponse[]>(`${this.BASE_URL}/${userId}/sent-pending`, {});
  }

  searchUsersByEmail(email: string, loggedInUserId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/search`, {
      params: { email, loggedInUserId: loggedInUserId.toString() },
      responseType: 'json',
    });
  }

  unfriend(userId: number, friendId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${userId}/unfriend/${friendId}`, {});
  }

  getFriendDetails(friendId: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/friend/${friendId}`, {

    });
  }
}
