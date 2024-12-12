import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
import { Business } from '../../../models/business';
import { BusinessService } from '../../../services/business/business.service';

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private jwtService: JwtService,
    private businessService: BusinessService
  ) {
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url; // Get the active URL
    });
  }

  ngOnInit(): void {
    this.token = this.storageService.getItem('token');
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

      this.businessService.getAllBusiness().subscribe(
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
}
