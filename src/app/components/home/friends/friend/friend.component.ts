import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { CommonModule } from '@angular/common';
import { FriendsService } from '../../../../services/user/friends.service';
import { StorageService } from '../../../../services/storage.service';
import { UserService } from '../../../../services/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { WebsocketService } from '../../../../services/websocket/websocket.service';
import { catchError, map, Observable, of } from 'rxjs';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { FriendDetailComponent } from './friend-detail/friend-detail.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MessageService } from '../../../../services/user/message.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-friend',
  standalone: true,
  imports: [CommonModule, FormsModule, MdbRippleModule,ConfirmationModalComponent,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatListModule,
    RouterModule
  ],
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.css']
})
export class FriendComponent implements OnInit {
  friends: any[] = [];
  searchQuery: string = '';
  searchResults: any[] = [];
  emailSuggestions: any[] = [];
  pendingRequests: any[] = [];
  sentPendingRequests: any & { type: 'received' | 'sent' }[] = [];
  isLoading = false;
  loggedInUserEmail: string | null = '';
  loggedInUserId: number | null = null;
  friendIds: Set<number> = new Set();
  pendingRequestsCount: number = 0;
  currentFriendId: number | null = null;
  selectedFriend: any | null = null;
  showConfirmUnfriendModal = false;
  showConfirmDenyModal = false;
  showConfirmCancelModal = false;
  friendIdToDelete: number = 0;
  friendRequestIdToDelete: number = 0;

  messages: { [key: number]: { sender: string; content: string; sendAt: any }[] } = {};
  activeChat: { friendId: number; friendName: string } | null = null;
  newMessage: string = '';

  constructor(
    private friendshipService: FriendsService,
    private messageService: MessageService,
    private storageService: StorageService,
    private userService: UserService,
    private toastr: ToastrService,
    private websocketService: WebsocketService,
    private modalService: MdbModalService
 ) {}

  ngOnInit(): void {
    this.getLoggedInUserInfo();
    this.setupWebSocket();
  }

  getLoggedInUserInfo(): void {
    this.userService.getUserInfo().subscribe({
      next: (user) => {
        this.loggedInUserEmail = user.email;
        this.loggedInUserId = user.id;
        this.loadFriends();
        this.loadPendingRequests();
       },
       error: (err) => console.error('Error fetching user info:', err),
    });
  }

  onInput(): void {
    if (!this.loggedInUserId) {
      console.error('Logged in user ID is missing.');
      return;
    }
    if (this.searchQuery.trim().length > 1) {
      this.friendshipService
        .searchUsersByEmail(this.searchQuery, this.loggedInUserId)
        .subscribe({
          next: (results) => {
            this.emailSuggestions = results; // Backend already filters ineligible users
          },
          error: () => this.toastr.error('Error fetching search suggestions.', 'Error'),
        });
    } else {
      this.emailSuggestions = [];
    }
  }

  loadFriends(): void {
    if (!this.loggedInUserId) {
      console.error('Logged-in user ID is missing. Cannot load friends.');
      return;
    }
    this.friendshipService.getFriends(this.loggedInUserId).subscribe({
      next: (data) => {
        this.friends = data;
        this.friendIds = new Set(data.map((friend) => friend.id));
        console.log('Friends loaded:', this.friends);

        // Fetch additional details for each friend (e.g., profile pictures)
        this.friends.forEach((friend) => {
          console.log('Fetching details for friend:', friend.friendId);
          this.friendshipService.getFriendDetails(friend.friendId).subscribe({
            next: (details) => {
              friend.profile = details.profile; // Assuming API provides 'profilePictureUrl'
            },
            error: (err) => {
              console.error(`Error fetching details for friend ${friend.id}:`, err);
              // Set a default image in case of error
              friend.profile = '/images/default-avatar.png';
            },
          });
        });
      },
      error: (err) => {
        console.error('Error fetching friends:', err);
      },
    });
  }

  loadPendingRequests(): void {
    if (!this.loggedInUserId) return;
    this.friendshipService.getPendingRequests(this.loggedInUserId).subscribe({
      next: (receivedRequests) => {
        const receivedWithType = receivedRequests.map(request => ({
          ...request,
          type: 'received'
        }));

    if (!this.loggedInUserId) return;
        // Load sent pending requests
        this.friendshipService.getSentPendingRequests(this.loggedInUserId).subscribe({
          next: (sentRequests) => {
            const sentWithType = sentRequests.map(request => ({
              ...request,
              type: 'sent'
            }));

            // Combine both arrays
            this.pendingRequests = [...receivedWithType, ...sentWithType];
            this.pendingRequestsCount = this.pendingRequests.length; // Update count
          },
          error: () => this.toastr.error('Error loading sent pending requests.', 'Error'),
        });

      },
      error: () => this.toastr.error('Error loading received pending requests.', 'Error'),

    });
  }

  sendFriendRequest(userId: number): void {
    if (!this.loggedInUserId) return;
    const request = { senderId: this.loggedInUserId, accepterId: userId };

    this.friendshipService.sendFriendRequest(request).subscribe({
      next: () => {
        this.toastr.success('Friend request sent successfully!', 'Success');
        this.emailSuggestions = this.emailSuggestions.filter((user) => user.id !== userId);
        this.loadPendingRequests();
        this.loadFriends();
      },
      error: () => this.toastr.error('Error sending friend request.', 'Error'),
    });
  }

  acceptRequest(requestId: number): void {
    this.friendshipService.acceptFriendRequest(requestId).subscribe({
      next: () => {
        this.toastr.success('Friend request accepted!', 'Success');
        this.loadFriends();
        this.loadPendingRequests();
      },
      error: () => this.toastr.error('Error accepting friend request.', 'Error'),
    });
  }

  denyRequest(requestId: number): void {
    this.friendshipService.denyFriendRequest(requestId).subscribe({
      next: () => {
        this.toastr.info('Friend request denied.', 'Info');
        this.loadPendingRequests();
        console.log('Denied request:', requestId);
        this.showConfirmDenyModal = false;
      },
      error: () => this.toastr.error('Error denying friend request.', 'Error'),
    });
  }

  confirmDenyRequest(requestId: number) {
    this.friendRequestIdToDelete = requestId;
    this.showConfirmDenyModal = true;
  }

  closeConfirmDenyModal() {
    this.showConfirmDenyModal = false;
 }

 cancelRequest(requestId: number): void {
  this.friendshipService.cancelFriendRequest(requestId).subscribe({
    next: () => {
      this.toastr.info('Friend request canceled.', 'Info');
      this.websocketService.send(JSON.stringify({
        type: 'FRIEND_REQUEST_CANCELLED',
        payload: { requestId }
      }));
      this.websocketService.send(JSON.stringify({
        type: 'FRIEND_REQUEST_CANCELLED',
        payload: { requestId }
      }));
      this.loadPendingRequests();
      console.log('Denied request:', requestId);
      this.showConfirmCancelModal = false;
    },
    error: () => this.toastr.error('Error cancelling friend request.', 'Error'),
  });
}

confirmCancelRequest(requestId: number) {
  this.friendRequestIdToDelete = requestId;
  this.showConfirmCancelModal = true;
}

closeConfirmCanelModal() {
  this.showConfirmCancelModal = false;
}

 unfriend(friendId: number): void {
  if (!this.loggedInUserId) return;
  this.currentFriendId = friendId;
  this.friendshipService.getFriendDetails(friendId).subscribe({
    next: (friend) => {
      const friendName = friend.name;
      this.friendshipService.unfriend(this.loggedInUserId!, friendId).subscribe({
        next: () => {
          this.toastr.success(`${friendName} has been removed from your friends list.`, 'Success');
          this.friends = this.friends.filter((friend) => friend.id !== friendId);
          this.loadFriends();
          console.log('Unfriended:', friendId);
          this.showConfirmUnfriendModal = false;
        },
        error: () => this.toastr.error('Error removing friend.', 'Error'),
      });
    },
    error: () => this.toastr.error('Error fetching friend details.', 'Error'),
    });
  }

  confirmUnfriend(friendId: number) {
    this.friendIdToDelete = friendId;
    this.showConfirmUnfriendModal = true;
  }

  closeConfirmUnfriendModal() {
    this.showConfirmUnfriendModal = false;
  }

  isAlreadyFriend(userId: number): boolean {
    return this.friendIds.has(userId);
  }
  // Check if a user has a pending friend request
  isPendingRequest(userId: number): boolean {
    return this.pendingRequests.some(
      (req) => req.senderId === userId || req.accepterId === userId
    );
  }



  private setupWebSocket(): void {
    this.websocketService.connect();

    this.websocketService.onMessage().subscribe((message) => {
      this.handleWebSocketMessage(message);
    });
  }

  openFriendModal(friendId: number): void {
    this.modalService.open(FriendDetailComponent, {
      modalClass: 'modal-md',
      data: { friendId },
    });
  }

  loadSelectedFriendProfile(): void {
    if (this.currentFriendId !== null) {
      this.friendshipService.getFriendDetails(this.currentFriendId).subscribe({
        next: (friend) => {
          this.selectedFriend = friend;
        },
        error: () => this.toastr.error('Error fetching friend details.', 'Error'),
      });
    }
  }

  getFriendImageUrl(profile: string | null): string {
    return profile
      ? this.userService.getImageUrl(profile)
      : '/images/default-avatar.png';
  }

  private handleWebSocketMessage(message: string): void {
    console.log('WebSocket update:', message);

    switch (message) {
      case 'FRIEND_REQUEST_RECEIVED':
        this.toastr.info('You have a new friend request!', 'Info');
        this.loadPendingRequests();
        break;
      case 'FRIEND_REQUEST_ACCEPTED':
        this.toastr.success('Your friend request was accepted!', 'Success');
        this.loadFriends();
        this.loadPendingRequests();
        this.loadPendingRequests();
        break;
      case 'FRIEND_REQUEST_DENIED':
        this.toastr.info('Your friend request was denied.', 'Info');
        this.loadPendingRequests();
        break;
      case 'FRIEND_REQUEST_CANCELLED':
        this.toastr.warning('A friend request sent to you was canceled.', 'Info');
        this.loadPendingRequests();
        break;
      case 'UNFRIENDED':
        console.log('Friend ID - ' , this.currentFriendId);
        if (this.currentFriendId !== null) {

          this.friendshipService.getFriendDetails(this.currentFriendId).subscribe({
            next: (friend) => {
              const friendName = friend.name;
              this.toastr.warning(`${friendName} has unfriended you.`, 'Info');
              this.loadFriends();
            },
            error: () => this.toastr.error('Error fetching friend details.', 'Error'),
          });
        } else {
          this.toastr.warning('You have been unfriended by someone.', 'Info');
          this.loadFriends();
        }

        break;
      default:
        console.warn('Unknown WebSocket message:', message);
    }
  }
}
