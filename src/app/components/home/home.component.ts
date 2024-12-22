import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { JwtService } from '../../services/jwt.service';
import { UserService } from '../../services/user/user.service';
import { UserResponse } from '../../models/user-response.models';
import { FriendsService } from '../../services/user/friends.service';
import { SharedService } from '../../services/shared/shared.service';
import { CommonModule } from '@angular/common';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { UserWalletComponent } from './user-wallet/user-wallet.component';

@Component({
  standalone:true,
  imports:[CommonModule,RouterLink,RouterOutlet,MdbDropdownModule,UserWalletComponent ],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  sidebarOpen: boolean = false; // Flag to control the sidebar visibility
  activeRoute:any = '';
  isLoggedIn: boolean = false;
  decodedToken!:string;
  userInfo!:UserResponse;
  pendingFriendRequestsCount: number = 0;

  token!:any;

  notifications: Array<{ id: number; message: string; link: string; read: boolean }> = [];
  unreadNotifications: number = 0;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private storageService: StorageService,
              private jwtService: JwtService,
              private userService: UserService,
              private sharedService: SharedService,
              private friendService: FriendsService
              ) {
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url; // Get the active URL
    });
  }


  ngOnInit(): void {
    this.userService.getUserInfo().subscribe((response)=>{
      console.log("UserInfo: ",response)
      this.userInfo = response;
      this.loadPendingFriendRequestsCount();
    },error => console.log('Error in Fetching UserInfo', error));

    this.token = this.storageService.getItem('token');
    if (this.token == '' || this.token == null) {
      console.log('Token is not defined or is invalid.');
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen; // Toggle the sidebar visibility
  }

  loadNotifications() {
    // Example data; replace with a service call to fetch notifications
    this.notifications = [
      { id: 1, message: 'Your coupon is expiring soon!', link: '/homepage/coupons', read: false },
      { id: 2, message: 'New coupon added in your area!', link: '/homepage/coupons', read: false },
      { id: 3, message: 'Welcome to Coupon Sell System!', link: '/homepage/aboutus', read: true }
    ];

    // Calculate unread notifications
    this.updateUnreadCount();
  }

  getImageUrl(imagePath: string): string {
    return this.userService.getImageUrl(imagePath);
  }
  // Mark notification as read
  markAsRead(notificationId: number) {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.updateUnreadCount();
    }
  }

  // Update unread notifications count
  updateUnreadCount() {
    this.unreadNotifications = this.notifications.filter((n) => !n.read).length;
  }

  loadPendingFriendRequestsCount() {
    const loggedInUserId = this.userInfo?.id;
    if (!loggedInUserId) {
      console.error('Logged-in user ID is missing.');
      return;
    }

    this.friendService.getPendingRequests(loggedInUserId).subscribe({
      next: (requests) => {

        this.pendingFriendRequestsCount = requests.length;
        this.sharedService.setPendingRequestsCount(this.pendingFriendRequestsCount);
      },
      error: (err) => {
        console.error('Error fetching pending friend requests:', err);
      },
    });
  }

  logoutButton(): void{
    this.storageService.removeItem("token");
    this.router.navigate(['login']);
  }

}
