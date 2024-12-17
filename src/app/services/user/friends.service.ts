import { Injectable } from '@angular/core';
import { Observable,of } from 'rxjs';
import { FriendshipResponse } from '../../models/friendship-response.models';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  constructor() {}

  // Mock friends data
  getFriends(): Observable<FriendshipResponse[]> {
    const mockData: FriendshipResponse[] = [
      { id: 1, senderName: 'John', accepterName: 'Doe', status: 1, createdAt: new Date('2023-01-01'), acceptedDate: new Date('2023-01-02') },
      { id: 2, senderName: 'Alice', accepterName: 'Bob', status: 0, createdAt: new Date('2023-03-05'), acceptedDate: null },
    ];
    return of(mockData);
  }

  // Placeholder methods for actions
  addFriend(name: string): Observable<boolean> {
    console.log(`Sending friend request to ${name}`);
    return of(true);
  }

  unfriend(friendId: number): Observable<boolean> {
    console.log(`Unfriending friend with ID: ${friendId}`);
    return of(true);
  }

  acceptFriendRequest(friendId: number): Observable<boolean> {
    console.log(`Accepting friend request ID: ${friendId}`);
    return of(true);
  }
}
