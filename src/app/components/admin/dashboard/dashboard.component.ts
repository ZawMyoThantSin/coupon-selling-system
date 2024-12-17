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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  sidebarOpen: boolean = false; // Flag to control the sidebar visibility
  activeRoute: any = '';
  isLoggedIn: boolean = false;
  businesses: Business[] = []; // Array to store fetched businesses
  isBusinessCollapsed: boolean = true; // Tracks if the business section is collapsed
  token!: any;
  loading: boolean = false; // Flag to track if data is being fetched
  userInfo!:UserResponse;
  userId:any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private businessService: BusinessService,
    private userService: UserService,
    private jwtService: JwtService
  ) {
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url; // Get the active URL
    });
  }

  ngOnInit(): void {
    this.token = this.storageService.getItem('token');
    this.userId = this.jwtService.getUserId(this.token);

    this.userService.getUserInfo().subscribe((response)=>{
      console.log("UserInfo: ",response)
      this.userInfo = response;
    },error => console.log('Error in Fetching UserInfo', error));


    console.log();
    if (this.token == '' || this.token == null) {
      console.log('Token is not defined or is invalid.');
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }
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

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen; // Toggle the sidebar visibility
  }

  logoutButton(): void{
    this.storageService.removeItem("token");
    this.router.navigate(['login']);
  }
}
