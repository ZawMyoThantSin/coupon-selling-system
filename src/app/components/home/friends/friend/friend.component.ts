import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple'; // MDBootstrap ripple effect
import { CommonModule } from '@angular/common';
import { FriendsService } from '../../../../services/user/friends.service';
import { StorageService } from '../../../../services/storage.service';
import { UserService } from '../../../../services/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { Output,EventEmitter } from '@angular/core';
import { TransferResponse } from '../../../../models/transfer.models';
import { SharedService } from '../../../../services/shared/shared.service';
import { TransferService } from '../../../../services/transfer/transfer.service';
import { WebsocketService } from '../../../../services/websocket/websocket.service';

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
  friends: any[] = [];
  searchQuery: string = '';
  searchResults: any[] = [];
  emailSuggestions: any[] = [];
  isLoading = false;
  filteredFriends: any[] = [];
  pendingRequests: any[] = [];
  loggedInUserEmail: string | any = '';
  loggedInUserId: number | null = null;
  searchTimeout: any;
  friendIds: Set<number> = new Set();
  pendingRequestsCount: number = 0;
  @Output() updateFriendRequestsCount = new EventEmitter<void>();


  incomingTransfers: TransferResponse[] = [];
  transferHistory: TransferResponse[] = [];
  selectedCouponId: number | null = null;


  constructor(private friendshipService: FriendsService,
              private storageService: StorageService,
              private userService: UserService,
              private toastr: ToastrService,
              private sharedService: SharedService,
              private transferService: TransferService,
              private webSocketService: WebsocketService,
  ) {}

  ngOnInit(): void {
    this.loadFriends();
    this.loadPendingRequests();
    this.getLoggedInUserInfo();
    this.sharedService.pendingRequestsCount$.subscribe((count) => {
      this.pendingRequestsCount = count;
    });

    // Subscribe to friend updates
    this.webSocketService.getFriendUpdates().subscribe((update) => {
      if (update) {
        this.handleFriendUpdate(update);
      }
    });

    // // Subscribe to transfer updates
    // this.webSocketService.getTransferUpdates().subscribe((update) => {
    //   if (update) {
    //     this.handleTransferUpdate(update);
    //   }
    // });
  }

  handleFriendUpdate(update: any): void {
    // Example: Handle friend added, friend removed, etc.
    if (update.type === 'FRIEND_ADDED') {
      this.toastr.success(`${update.senderName} accepted your friend request!`, 'Friend Added');
      this.loadFriends(); // Refresh the friend list
    } else if (update.type === 'REQUEST_RECEIVED') {
      this.toastr.info(`New friend request from ${update.senderName}`, 'Friend Request');
      this.loadPendingRequests(); // Refresh pending requests
    } else if (update.type === 'FRIEND_REMOVED') {
      this.toastr.warning(`${update.senderName} unfriended you.`, 'Friend Removed');
      this.loadFriends(); // Refresh the friend list
    }
  }

  // handleTransferUpdate(update: any): void {
  //   // Example: Handle incoming coupon transfer updates
  //   if (update.type === 'COUPON_RECEIVED') {
  //     this.toastr.success(`You received a coupon from ${update.senderName}!`, 'Coupon Received');
  //     this.loadTransferHistory(); // Refresh transfer history
  //   } else if (update.type === 'TRANSFER_ACCEPTED') {
  //     this.toastr.info(`Your transfer was accepted by ${update.accepterName}.`, 'Transfer Accepted');
  //   }
  // }


  getLoggedInUserInfo(): void {
    this.userService.getUserInfo().subscribe({
      next: (user) => {
        this.loggedInUserEmail = user.email;
        this.loggedInUserId = user.id;
        this.loadFriends();
        this.loadPendingRequests();
        console.log('Logged-in user info:', user);
      },
      error: (err) => {
        console.error('Error fetching logged-in user info:', err);
      },
    });
  }

  onInput(): void {
    if (this.searchQuery.trim().length > 1) {
      // Debounce API calls to avoid flooding the server
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.friendshipService.searchUsersByEmail(this.searchQuery).subscribe({
          next: (results) => {
            if (this.loggedInUserEmail) {
              this.emailSuggestions = results
              .filter(user => user.email !== this.loggedInUserEmail) // Exclude logged-in user
              .filter(user => !this.friendIds.has(user.id)) // Exclude already friends
              .filter(user => !this.pendingRequests.some(req => req.senderId === user.id || req.accepterId === user.id)); // Exclude pending requests
            }
          },
          error: (err) => {
            this.toastr.error('Error fetching email suggestions.', 'Error');
          },
        });
      }, 300); // Wait 300ms before making the API call
    } else {
      this.emailSuggestions = [];
    }
  }

  searchFriends(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.isLoading = true;
    this.friendshipService.searchUsersByEmail(this.searchQuery).subscribe({
      next: (results) => {
        // Filter out the logged-in user's email
      if (this.loggedInUserEmail) {
        this.searchResults = results
        .filter(user => user.email !== this.loggedInUserEmail) // Exclude logged-in user
        .filter(user => !this.friendIds.has(user.id)) // Exclude already friends
        .filter(user => !this.pendingRequests.some(req => req.senderId === user.id || req.accepterId === user.id)); // Exclude pending requests
      }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching search results:', err);
        this.isLoading = false;
      },
    });
  }

  loadFriends() {

    if (!this.loggedInUserId) {
      console.error('Logged-in user ID is missing. Cannot load friends.');
      return;
    }

    this.friendshipService.getFriends(this.loggedInUserId).subscribe({
    next: (data) => {
      this.friends = data;
      this.friendIds = new Set(data.map(friend => friend.id));
      console.log('Friends loaded:', this.friends);
    },
    error: (err) => {
      console.error('Error fetching friends:', err);
    },
  });
  }

  loadPendingRequests() {
    if (!this.loggedInUserId) {
      console.error('Logged-in user ID is missing. Cannot load pending requests.');
      return;
    }

    this.friendshipService.getPendingRequests(this.loggedInUserId).subscribe({
    next: (data) => {
      this.pendingRequests = data;
      this.pendingRequestsCount = data.length;
      console.log('Pending requests loaded:', this.pendingRequests);
    },
    error: (err) => {
      console.error('Error fetching pending requests:', err);
    },
  });
  }

  sendFriendRequest(userId: number): void {
    if (!this.loggedInUserEmail) {
    this.toastr.error('Logged-in user email not found!', 'Error');
      return;
    }
  if (!this.loggedInUserId || !userId) {
    this.toastr.error('Sender or Accepter ID is missing', 'Error');
    return;
  }
    const request = { senderId: this.loggedInUserId, accepterId: userId, message: 'Hi, let’s connect!' };

    this.friendshipService.sendFriendRequest(request).subscribe({
      next: (response) => {
        this.toastr.success('Friend request sent successfully!', 'Success');
        console.log('Friend Request Sent:', response);
        this.emailSuggestions = this.emailSuggestions.filter(user => user.id !== userId);
      },
      error: (err) => {
        this.toastr.error('Error sending friend request.', 'Error');
        console.error('Error sending friend request:', err);
      }
    });
  }

  addFriend(friendName: string): void {
    console.log(`Send a friend request to ${friendName}`);
  }


  acceptRequest(requestId: number): void {
    this.friendshipService.acceptFriendRequest(requestId).subscribe({
      next: (response) => {
        this.toastr.success('Friend request accepted!', 'Success');
        this.loadPendingRequests();
        this.updateFriendRequestsCount.emit();
        console.log('Friend request accepted:', response);
        const acceptedRequest = this.pendingRequests.find(req => req.id === requestId);
        if (acceptedRequest) {
          this.friends.push({ friendName: acceptedRequest.senderName, id: acceptedRequest.senderId });
          this.pendingRequests = this.pendingRequests.filter(req => req.id !== requestId);
        }
      },
      error: (err) => {
        this.toastr.error('Error accepting friend request.', 'Error');
      },
    });
  }

  denyRequest(requestId: number): void {
    this.friendshipService.denyFriendRequest(requestId).subscribe({
      next: (response) => {
        this.toastr.info('Friend request denied.', 'Info');
        this.updateFriendRequestsCount.emit();
        console.log('Friend request denied:', response);
        this.pendingRequests = this.pendingRequests.filter(req => req.id !== requestId);
      },
      error: (err) => {
        this.toastr.error('Error denying friend request.', 'Error');
      },
    });
  }

  unfriend(friendId: number): void {
  if (!this.loggedInUserId) {
    this.toastr.error('Logged-in user ID not found!', 'Error');
    return;
  }

  this.friendshipService.unfriend(this.loggedInUserId, friendId).subscribe({
    next: () => {
      this.toastr.success('Friend removed successfully!', 'Success');
      this.friends = this.friends.filter(friend => friend.friendId !== friendId);
      this.friendIds.delete(friendId);
      console.log(`User with ID ${friendId} unfriended.`);
    },
    error: (err) => {
      this.toastr.error('Error removing friend.', 'Error');
      console.error('Error unfriending user:', err);
    },
  });
}


  isAlreadyFriend(userId: number): boolean {
    return this.friendIds.has(userId);
  }

  sendCoupon(friendId: number): void {
    if (this.selectedCouponId == null) {
      this.toastr.error('Please select a coupon to send.', 'Error');
      return;
    }

    if (!this.isAlreadyFriend(friendId)) {
      this.toastr.error('You can only send coupons to friends.', 'Error');
      return;
    }

    const transferRequest = {
      senderId: this.loggedInUserId!,
      accepterId: friendId,
      saleCouponId: this.selectedCouponId,
      status: 0, // Pending
    };

    this.transferService.transferCoupon(transferRequest).subscribe({
      next: (response) => {
        this.toastr.success('Coupon sent successfully!', 'Success');
        this.loadTransferHistory(); // Refresh transfer history
      },
      error: (err) => {
        this.toastr.error('Error sending coupon.', 'Error');
        console.error('Error sending coupon:', err);
      },
    });
  }

  acceptTransfer(transferId: number): void {
    this.transferService.acceptTransfer(transferId).subscribe({
      next: (response) => {
        this.toastr.success('Transfer accepted!', 'Success');
        this.loadIncomingTransfers(); // Refresh incoming transfers
      },
      error: (err) => {
        this.toastr.error('Error accepting transfer.', 'Error');
        console.error('Error accepting transfer:', err);
      },
    });
  }

  denyTransfer(transferId: number): void {
    this.transferService.denyTransfer(transferId).subscribe({
      next: (response) => {
        this.toastr.info('Transfer denied.', 'Info');
        this.loadIncomingTransfers(); // Refresh incoming transfers
      },
      error: (err) => {
        this.toastr.error('Error denying transfer.', 'Error');
        console.error('Error denying transfer:', err);
      },
    });
  }

  loadTransferHistory(): void {
    if (!this.loggedInUserId) {
      console.error('Logged-in user ID is missing. Cannot load transfer history.');
      return;
    }

    this.transferService.getTransferHistory(this.loggedInUserId).subscribe({
      next: (data) => {
        this.transferHistory = data;
        console.log('Transfer history loaded:', this.transferHistory);
      },
      error: (err) => {
        console.error('Error fetching transfer history:', err);
      },
    });
  }

  loadIncomingTransfers(): void {
    if (!this.loggedInUserId) {
      console.error('Logged-in user ID is missing. Cannot load incoming transfers.');
      return;
    }

    this.transferService.getTransferHistory(this.loggedInUserId).subscribe({
      next: (data) => {
        this.incomingTransfers = data.filter(transfer => transfer.status === 0); // Pending transfers
        console.log('Incoming transfers loaded:', this.incomingTransfers);
      },
      error: (err) => {
        console.error('Error fetching incoming transfers:', err);
      },
    });
  }


}
