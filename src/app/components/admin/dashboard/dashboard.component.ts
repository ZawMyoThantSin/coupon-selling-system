import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
import { Business } from '../../../models/business';
import { BusinessService } from '../../../services/business/business.service';
import { UserResponse } from '../../../models/user-response.models';
import { UserService } from '../../../services/user/user.service';
import { response } from 'express';
import { error } from 'console';
import { WebsocketService } from '../../../services/websocket/websocket.service';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../services/notification/notification.service';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { ChangePasswordComponent } from '../../change-password/change-password.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  isCollapsed: boolean = false;
  sidebarOpen: boolean = true; // Flag to control the sidebar visibility
  activeRoute: any = '';
  isLoggedIn: boolean = false;
  businesses: Business[] = []; // Array to store fetched businesses
  isBusinessCollapsed: boolean = true; // Tracks if the business section is collapsed
  token!: any;
  loading: boolean = false; // Flag to track if data is being fetched
  seeAll = false;
  userInfo!:UserResponse;
  userId:any;
  notifications: { id:number; message: string; route: string; isRead: number; type:string }[] = [];
  unreadCount: number = 0;
  changePasswordModalRef: MdbModalRef<ChangePasswordComponent> | null = null;


  constructor(
    private toastr: ToastrService,
    private router: Router,
    private storageService: StorageService,
    private businessService: BusinessService,
    private userService: UserService,
    private jwtService: JwtService,
    private websocketService: WebsocketService,
    private notificationService: NotificationService,
    private modalService: MdbModalService
  ) {
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url; // Get the active URL
    });
  }

  handleWebSocketMessages():void{
    this.websocketService.connect();

    this.websocketService.onMessage().subscribe((message) => {
      console.log("MSG", message)
      if(message =="ORDER_CREATED"){
        const notification = {
          id: 0,
          message: 'New order arrived! Click to view details.',
          route: '/d/order',
          type: 'NEW_ORDER',
          isRead: 1,
        };

        this.notifications.unshift(notification); // Add to the notification list
        this.unreadCount++;
        this.toastr.info("New order is arrived! | Go to check ","Alert");
        this.ngOnInit();
      }
    });
  }

  ngOnInit(): void {
    this.token = this.storageService.getItem('token');
    this.userId = this.jwtService.getUserId(this.token);

    this.userService.getUserInfo().subscribe((response)=>{
      this.userInfo = response;
      this.isLoggedIn = true;
    },error => console.log('Error in Fetching UserInfo', error));

    this.handleWebSocketMessages();
      this.getNotifications();
  }

  // Fetch business names and toggle collapse
  toggleBusinessCollapse(): void {
    this.isBusinessCollapsed = !this.isBusinessCollapsed;

    if (!this.isBusinessCollapsed && this.businesses.length === 0) {
      // Start loading spinner
      this.loading = true;

      this.businessService.getAllBusiness(this.userId).subscribe(
        (response) => {
          this.businesses = response; // Populate the businesses array
          this.loading = false; // Stop loading spinner
        },
        (error) => {
          console.error('Error fetching businesses:', error);
          this.loading = false; // Stop loading spinner even if there is an error
        }
      );
    }
  }


  logoutButton(): void{
    this.websocketService.disconnect();
    this.storageService.removeItem("token");
    this.router.navigate(['login']);
  }
  getUserProfile(imagePath: string): string {
    return this.userService.getImageUrl(imagePath);
  }
  getImageUrl(imagePath: string): string {
    return this.businessService.getImageUrl(imagePath);
  }

  markAllAsRead(): void {
    console.log('User ID:', this.userId);
    this.notificationService.markAllAsRead(this.userId).subscribe(() => {
        this.notifications.forEach((n) => (n.isRead = 1));
        this.unreadCount = 0;
      },
      (error) => console.error('Error marking all as read:', error)
    );
    this.ngOnInit();
  }
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
  getNotifications(): void {
    this.notificationService.getNotificationsByReceiver(this.userId).subscribe(
      (notifications) => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter((n) => n.isRead === 0).length;
      },
      (error) => console.error('Error fetching notifications:', error)
    );
  }
  markNotificationAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe(
      () => {
        // Remove the notification from the list or mark it as read locally
        const notification  = this.notifications.find((n) => n.id === notificationId);
        if (notification) {
          notification.isRead = 1; // Mark as read
        }
        this.unreadCount = this.notifications.filter((n) => n.isRead === 0).length;
        this.ngOnInit(); // Refresh the notifications
      },
      (error) => console.error('Error marking notification as read:', error)
    );
  }

  getSortedNotifications(): any[] {
    return this.notifications.sort((a, b) => a.isRead - b.isRead);
  }

  openChangePasswordModal() {
    this.changePasswordModalRef = this.modalService.open(ChangePasswordComponent, {
      modalClass: 'modal-lg',
    });

    this.changePasswordModalRef.onClose.subscribe(() => {
      console.log('Change password modal closed');

    });
  }

  isSidebarCollapsed = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
