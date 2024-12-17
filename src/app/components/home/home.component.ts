import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { JwtService } from '../../services/jwt.service';
import { HomeCarouselComponent } from './home-carousel/home-carousel.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true,
  imports:[HomeCarouselComponent, RouterLink, CommonModule, RouterOutlet],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  sidebarOpen: boolean = false; // Flag to control the sidebar visibility
  activeRoute:any = '';
  isLoggedIn: boolean = false;
  decodedToken!:string;
  token!:any;


  notifications: Array<{ id: number; message: string; link: string; read: boolean }> = [];
  unreadNotifications: number = 0;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private storageService: StorageService,
              private jwtService: JwtService
              ) {
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url; // Get the active URL
    });
  }


  ngOnInit(): void {
    this.token = this.storageService.getItem("token");
    if (this.token == '' || this.token ==  null) {
      console.log('Token is not defined or is invalid.');
      this.isLoggedIn= false;
    }else{
      this.isLoggedIn = true
    }

    // this.decodedToken = this.jwtService.decodeToken(this.token)
    // if(this.token != null && this.token != ''){
    //   console.log("DECODED:: "+this.decodedToken);
    //   this.isLoggedIn = true;
    // }else this.isLoggedIn= false;

  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen; // Toggle the sidebar visibility
  }

  // Load notifications (simulating API call)
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

}
