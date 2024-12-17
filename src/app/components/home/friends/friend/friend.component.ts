import { Component, OnInit } from '@angular/core';
import { FriendshipResponse } from '../../../../models/friendship-response.models';
import { FriendsService } from '../../../../services/user/friends.service';
import { FormsModule } from '@angular/forms';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple'; // MDBootstrap ripple effect
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-friend',
  standalone:true,
  imports:[CommonModule,
    FormsModule, 
    MdbRippleModule,],
  templateUrl: './friend.component.html',
  styleUrl: './friend.component.css'
})
export class FriendComponent implements OnInit {
  friendsList: FriendshipResponse[] = [];
  searchQuery: string = '';
  pendingRequests: FriendshipResponse[] = [];
  filteredFriends: FriendshipResponse[] = [];

  constructor(private friendsService: FriendsService) {}

  ngOnInit(): void {
    this.loadFriends();
  }

  loadFriends(): void {
    this.friendsService.getFriends().subscribe({
      next: (data: FriendshipResponse[]) => {
        this.friendsList = data.filter(friend => friend.status === 1); // Accepted friends
        this.pendingRequests = data.filter(friend => friend.status === 0); // Pending requests
        this.filteredFriends = [...this.friendsList];
      },
      error: (err) => {
        console.error('Error fetching friends:', err);
      }
    });
  }

  searchFriends(): void {
    this.filteredFriends = this.friendsList.filter(friend =>
      friend.accepterName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      friend.senderName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  addFriend(name: string): void {
    if (!name) {
      alert('Please enter a valid name!');
      return;
    }

    this.friendsService.addFriend(name).subscribe({
      next: (success) => {
        if (success) {
          alert(`Friend request sent to ${name}`);
          this.loadFriends(); // Refresh data after sending the request
        }
      },
      error: (err) => {
        console.error('Error adding friend:', err);
      }
    });
  }

  unfriend(friendId: number): void {
    this.friendsService.unfriend(friendId).subscribe({
      next: (success) => {
        if (success) {
          this.friendsList = this.friendsList.filter(friend => friend.id !== friendId);
          this.filteredFriends = this.filteredFriends.filter(friend => friend.id !== friendId);
          alert('Friend has been removed.');
        }
      },
      error: (err) => {
        console.error('Error unfriending:', err);
      }
    });
  }

  acceptRequest(requestId: number): void {
    this.friendsService.acceptFriendRequest(requestId).subscribe({
      next: (success) => {
        if (success) {
          alert('Friend request accepted!');
          this.loadFriends(); // Refresh data after accepting
        }
      },
      error: (err) => {
        console.error('Error accepting friend request:', err);
      }
    });
  }
}