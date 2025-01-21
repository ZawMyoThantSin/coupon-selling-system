import { CUSTOM_ELEMENTS_SCHEMA, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { JwtService } from '../../services/jwt.service';
import { UserService } from '../../services/user/user.service';
import { UserResponse } from '../../models/user-response.models';
import { FriendsService } from '../../services/user/friends.service';
import { SharedService } from '../../services/shared/shared.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { ToastrService } from 'ngx-toastr';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone:true,
  imports:[CommonModule,RouterLink,RouterLinkActive,RouterOutlet,MdbDropdownModule,MatIconModule,MatIconModule, MatButtonModule, MatListModule, ],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit{
  isMenuOpen: boolean = false; // Flag to control the sidebar visibility
  isDesktop = false;
  activeRoute:any = '';
  isLoggedIn: boolean = false;
  decodedToken!:string;
  userInfo!:UserResponse;
  pendingFriendRequestsCount: number = 0;

  token!:any;

  notifications: Array<{ id: number; message: string; link: string; read: boolean }> = [];
  unreadNotifications: number = 0;
  changePasswordModalRef: MdbModalRef<ChangePasswordComponent> | null = null;


  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private router: Router,
              private toastr: ToastrService,
              private storageService: StorageService,
              private userService: UserService,
              private sharedService: SharedService,
              private friendService: FriendsService,
              private websocketService: WebsocketService,
              private modalService: MdbModalService
              ) {
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url; // Get the active URL
    });
    if (isPlatformBrowser(this.platformId)) {
      this.isDesktop = window.innerWidth >= 992;
      window.addEventListener('resize', () => {
        if (isPlatformBrowser(this.platformId)) {
          this.isDesktop = window.innerWidth >= 992;
          if (this.isDesktop) {
            this.isMenuOpen = false;
          }
        }
      });
    }
  }

  private setupWebSocket(): void {
    this.websocketService.connect();

    this.websocketService.onMessage().subscribe((message) => {
      this.handleWebSocketMessage(message);
    });
  }

  private handleWebSocketMessage(message: string): void {
    console.log('WebSocket update:', message);
    switch (message) {
      case 'FRIEND_REQUEST_RECEIVED':
        this.toastr.info('You have a new friend request!', 'Info');
        break;
      case 'FRIEND_REQUEST_ACCEPTED':
        this.toastr.success('Your friend request was accepted!', 'Success');
        break;
      case 'FRIEND_REQUEST_DENIED':
        this.toastr.info('Your friend request was denied.', 'Info');
        break;
      case 'FRIEND_REQUEST_CANCELLED':
        this.toastr.warning('A friend request sent to you was canceled.', 'Info');
        break;
      case 'UNFRIENDED':
          this.toastr.warning('You have been unfriended by someone.', 'Info');
        break;
        case 'COUPON_TRANSFER_TRANSFERRED':
          this.toastr.info('You have a new coupon transfer request!', 'Coupon Transfer');
          break;
        case 'ORDER_ACCEPTED':
          this.toastr.info("Your Order has finished! | Go to check ","Alert");
          break;
        case 'ORDER_REJECTED':
          this.toastr.warning("Oops! Your Order has rejected | Go to check ","Alert");
          break;
      default:
        console.warn('Unknown WebSocket message:', message);
    }
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

    this.setupWebSocket();
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
  openChangePasswordModal() {
    this.changePasswordModalRef = this.modalService.open(ChangePasswordComponent, {
      modalClass: 'modal-lg',
    });

    this.changePasswordModalRef.onClose.subscribe(() => {
      console.log('Change password modal closed');

    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
