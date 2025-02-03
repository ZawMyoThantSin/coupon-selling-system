import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/notification/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebsocketService } from '../../../services/websocket/websocket.service';
import { JwtService } from '../../../services/jwt.service';
import { StorageService } from '../../../services/storage.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-user-noti',
  standalone: true,
  imports: [CommonModule,
      RouterModule,
      MatCardModule,
      MatButtonModule,
      MatIconModule,
      MatListModule,
      MatDividerModule,],
  templateUrl: './user-noti.component.html',
  styleUrl: './user-noti.component.css'
})
export class UserNotiComponent implements OnInit {
  notifications: any[] = []; // All notifications
  filteredNotifications: any[] = []; // Filtered notifications
  filter: string = 'all'; // Current filter ('all', 'unread', 'read')
  unreadCount: number = 0;
  token!: any;
  userId!: number;

  constructor(private notificationService: NotificationService,
              private snackBar: MatSnackBar,
              private websocketService: WebsocketService,
              private jwtService: JwtService,
              private storageService: StorageService,
              private router: Router,
             ) {}

  ngOnInit(): void {
    this.token = this.storageService.getItem('token');
    this.userId = this.jwtService.getUserId(this.token);
    this.loadNotifications();
    this.loadUnreadCount();
    this.handleWebSocketMessages();
  }

  handleWebSocketMessages():void{

    this.websocketService.onMessage().subscribe((message) => {
      console.log("MSG", message)
      if(message =="ORDER_ACCEPTED"){
        this.ngOnInit();
      }
      if(message =="ORDER_REJECTED"){
        this.ngOnInit();
      }
    });
  }

  // Load notifications from the backend
  loadNotifications(): void {
    let receiverId = 1; // Replace with the actual receiver ID (e.g., from auth service)
    let token: string | null = this.storageService.getItem("token");
    if(token != null){
      receiverId = this.jwtService.getUserId(token);
    }

    if(receiverId != 0){
      this.notificationService.getNotificationsByReceiver(receiverId).subscribe({
        next: (data) => {
          this.notifications = data;
          this.applyFilter(this.filter); // Apply default filter
        },
        error: (err) => {
          this.snackBar.open('Failed to load notifications', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  // Load unread notification count
  loadUnreadCount(): void {
    const receiverId = this.userId;
    this.notificationService.getUnreadCount(receiverId).subscribe({
      next: (count) => {
        this.unreadCount = count;
      },
      error: (err) => {
        this.snackBar.open('Failed to load unread count', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  // Apply filter based on selected option
  applyFilter(filter: string): void {
    this.filter = filter;
    switch (filter) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter((n) => !n.isRead);
        break;
      case 'read':
        this.filteredNotifications = this.notifications.filter((n) => n.isRead);
        break;
      default:
        this.filteredNotifications = this.notifications;
        break;
    }
  }

  // Mark a notification as read
  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find((n) => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          this.unreadCount--;
          this.applyFilter(this.filter); // Reapply filter
        }
      },
      error: (err) => {
        this.snackBar.open('Failed to mark notification as read', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  deleteNotification(notificationId: number): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((n) => n.id !== notificationId);
        this.applyFilter(this.filter); // Reapply filter
        this.snackBar.open('Notification deleted', 'Close', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.snackBar.open('Failed to delete notification', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

}
