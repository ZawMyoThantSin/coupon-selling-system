import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet, UrlSegment } from '@angular/router';
import { Business } from '../../../../models/business';
import { BusinessService } from '../../../../services/business/business.service';
// import { ProductComponent } from '../../product/product.component';
import { CommonModule, NgStyle } from '@angular/common';
import { ProductService } from '../../../../services/product/product.service';
import { Product } from '../../../../models/product';
import { Coupon } from '../../../../models/coupon.modal';
import { CouponService } from '../../../../services/coupon/coupon.service';

@Component({
  standalone:true,
  imports:[CommonModule,RouterOutlet,RouterLink,RouterLinkActive],
  selector: 'app-business-detail',
  template: `


<div class="business-detail-page container py-4" *ngIf="business; else loading">
  <!-- Business Header Section with Photo Banner -->
  <div class="business-header rounded mb-4 position-relative overflow-hidden">
    <img
      [src]="getImageUrl(business.photo)"
      alt="Business Banner"
      class="img-fluid w-100 rounded"
    />
    <div class="business-info-overlay position-absolute text-white p-3">
      <h2 class="business-name mb-1">{{ business.name }}</h2>
      <p class="business-category mb-0">
        <i class="fas fa-tags me-2"></i>{{ business.category }}
      </p>
    </div>
  </div>

  <!-- Business Information Section -->
  <div class="row">
    <div class="col-md-8">
      <!-- About the Business Section -->
      <div class="business-description bg-light rounded p-3 mb-4">
        <h5 class="mb-3">About the Business</h5>
        <p>{{ business.description }}</p>

        <!-- Rating Below the Description -->
        <!-- <div class="rating mt-2">
          <ng-container *ngFor="let star of [1, 2, 3, 4, 5]; let i = index">
            <i
              class="fas"
              [class.fa-star]="i < Math.floor(business.rating)"
              [class.fa-star-half-alt]="
                i === Math.floor(business.rating) &&
                business.rating % 1 !== 0
              "
              [class.fa-star-o]="i >= business.rating"
            ></i>
          </ng-container>
          <span class="ms-2">({{ business.rating }} / 5)</span>
        </div> -->
      </div>

      <!-- Stream Section -->
      <!-- <div class="business-stream bg-white rounded p-3">
        <h5 class="mb-3">
          <i class="fas fa-stream me-2"></i>Recent Updates
        </h5>
        <ul class="list-unstyled">
          <li *ngFor="let post of business.posts" class="mb-3">
            <div class="post-header d-flex align-items-center mb-2">
              <i class="fas fa-user-circle fa-2x me-3 text-primary"></i>
              <div>
                <p class="mb-0 fw-bold">{{ post.author }}</p>
                <small class="text-muted">{{
                  post.date | date: "short"
                }}</small>
              </div>
            </div>
            <p class="post-content">{{ post.content }}</p>
          </li>
        </ul>
      </div> -->
    </div>

    <div class="col-md-4">
      <!-- Contact and Location Section -->
      <div class="business-info bg-white rounded p-3 mb-4">
        <h5 class="mb-3">
          <i class="fas fa-info-circle me-2"></i>Details
        </h5>
        <ul class="list-unstyled">
          <li><strong>Location:</strong> {{ business.location }}</li>
          <li><strong>Contact:</strong> {{ business.contactNumber }}</li>
        </ul>
      </div>

      <!-- Call-to-Action Buttons -->
      <div class="actions">
        <button class="btn btn-primary w-100 mb-2">
          <i class="fas fa-phone-alt me-2"></i>Contact
        </button>
        <button class="btn btn-outline-secondary w-100">
          <i class="fas fa-map-marker-alt me-2"></i>Get Directions
        </button>
      </div>
    </div>
    <div class="row">
  <div class="col-md-4">
    <div class="radio-inputs bg-light p-3 rounded mb-3 shadow-sm">
     <!-- Product List Button -->
<label class="radio me-3">
  <input
    type="radio"
    name="viewToggle"
    [checked]="showProduct"
    (click)="toggleView('product')"
  />
  <span
    class="name"
    routerLinkActive="active"
    [routerLinkActiveOptions]="{ exact: true }"
    [routerLink]="['/d/b/detail', currentBusinessId]">
    Product List
  </span>
</label>

<!-- Coupon List Button -->
<label class="radio">
  <input
    type="radio"
    name="viewToggle"
    [checked]="!showProduct"
    (click)="toggleView('coupon')"
    [routerLink]="['/d/b/detail', currentBusinessId, 'coupon']"
  />
  <span
    class="name"
    routerLinkActive="active"
    [routerLinkActiveOptions]="{ exact: true }">
    Coupon List
  </span>
</label>
      </div>
      </div>
    </div>
    <router-outlet></router-outlet>
  </div>
</div>

<ng-template #loading class="loading-spinner">
    <i class="fas fa-spinner fa-spin me-2"></i> Loading...
</ng-template>




  `,
  styleUrl: './business-detail.component.scss'
})
export class BusinessDetailComponent implements OnInit {
  currentBusinessId!: number;

  showProduct: boolean = true;
  business!: Business;
  businessId:any;
  products!:Product[];
  coupons!:Coupon[];
  constructor(private route: ActivatedRoute,
              private businessService: BusinessService,
              private productService: ProductService,
              private couponService: CouponService,
              private router: Router
  ) {}

  ngOnInit(): void {

    // Route Change Subscription
    this.route.url.subscribe((urlSegments: UrlSegment[]) => {
      const lastSegment = urlSegments[urlSegments.length - 1]?.path || '';
      this.showProduct = lastSegment !== 'coupon'; // Set based on route
    });

    // Param Change Subscription
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id !== this.currentBusinessId) {
        this.currentBusinessId = id;
        this.getBusinessDetail(id); // Fetch relevant business details
      }
    });
  }

  fetchBusinessAndProducts(businessId: number): void {
    // Fetch business details
    this.businessService.getById(businessId).subscribe(
      business => (this.business = business),
      error => console.error('Error fetching business details:', error)
    );

    // Fetch products for the business
    this.productService.getAllProducts(businessId).subscribe(
      products => {this.products = products
        console.log(products)
      },
      error => console.error('Error fetching products:', error)

    );

    this.couponService.getAllCoupons(businessId).subscribe(
      coupons => {
        this.coupons = coupons;
        console.log('Coupons:', this.coupons);
      },
      error => console.error('Error fetching coupons:', error)
    );

  }

  getBusinessDetail(id: number): void {
    this.businessService.getById(id).subscribe(
      response => {
        this.business = response;
        console.log('Business details:', this.business);
      },
      error => {
        console.error('Error in fetching business details:', error);
        this.business= this.business; // Handle the error case gracefully
      }
    );
  }
  // toggle buttons
  // onViewToggle(view: string): void {
  //   if (view === 'coupon') {
  //     this.showProduct = false;
  //     this.router.navigate(['coupon'], { relativeTo: this.route });
  //   } else {
  //     this.showProduct = true;
  //     this.router.navigate([''], { relativeTo: this.route });
  //   }
  // }
  toggleView(view: string): void {
    if (view === 'product') {
      this.router.navigate(['.'], { relativeTo: this.route });
    } else if (view === 'coupon') {
      this.router.navigate(['coupon'], { relativeTo: this.route });
    }
  }
  // end

  // Expose Math for use in templates
  Math = Math;
  getImageUrl(imagePath: string): string {
    return this.businessService.getImageUrl(imagePath);
  }

}
