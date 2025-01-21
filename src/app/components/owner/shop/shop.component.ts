import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet, UrlSegment } from '@angular/router';
import { Business } from '../../../models/business';
import { Product } from '../../../models/product';
import { Coupon } from '../../../models/coupon.modal';
import { BusinessService } from '../../../services/business/business.service';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { CreateShopComponent } from './create-shop/create-shop.component';
import { UserResponse } from '../../../models/user-response.models';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user/user.service';
import { BusinessReviewService } from '../../../services/business-review/business-review.service';
import { BusinessReview } from '../../../models/business-review';
import { RatingModalComponent } from './rating-modal/rating-modal.component';
@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  

  businessId!: number;

  showProduct: boolean = true;
  business!: Business;
  products!:Product[];
  coupons!:Coupon[];

  shopExist: boolean =false;
  activeRoute: any = '';
  isLoggedIn: boolean = false;
  isBusinessCollapsed: boolean = true; // Tracks if the business section is collapsed
  token!: string | null;
  loading: boolean = false; // Flag to track if data is being fetched
  seeAll = false;
  userInfo!:UserResponse;
  userId!:number;
  rating:BusinessReview[]=[];
  ratingCount: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  totalRatings: number = 0;
  showModal = false; // To control the modal visibility
  visibleReviews: number = 3; // Number of reviews to show initially
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private tokenService: JwtService,
    private toastr: ToastrService,
    private businessService: BusinessService,
    private userService: UserService,
    private modalService: MdbModalService,
    private businessReviewService: BusinessReviewService,
  ) {

  }

  ngOnInit(): void {
    this.token = this.storageService.getItem("token");
    if(this.token !=null){
      this.userId = this.tokenService.getUserId(this.token);
      this.route.paramMap.subscribe(params => {
        this.businessId = Number(params.get('id'));
        this.fetchBusinessInfo(this.businessId, this.userId);
      });
    }


     // Fetch all ratings and then sort
     
     this.businessReviewService.getAllRating(this.businessId).subscribe(
      (response) => {
        this.rating = response;
        this.calculateRatingCounts(); // Calculate rating counts after fetching
        this.sortReviews(); // Sort reviews after fetching
      },
      (error) => {
        console.error("ERROR IN FETCHING: ", error);
      }
    );
  }

  private fetchBusinessInfo(businessId: number, userId: number){
    this.loading =true;
    this.businessService.getById(businessId).subscribe(
      (response) => {
        if(this.userId == response.userId){
          this.business = response;
          this.shopExist = this.business.id != null ? true : false;//data is null the shop isn't created yet!
          this.loading = false;
        }else{
          this.router.navigate(['/access-denied']);
        }

      },
      (error) => {
        console.error('Error fetching businesses:', error);
        this.loading = false;
      }
    );
  }

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
  editBusiness(): void {
    this.router.navigate(['/o/edit-shop', this.businessId]); // Navigate to the route
  }
  

  sortReviews() {
    this.rating = this.rating.sort((a, b) => {
      if (a.user_id === this.userId) return -1;
      if (b.user_id === this.userId) return 1;
      return 0;
    });
  }

  calculateRatingCounts(): void {
    this.ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.totalRatings = this.rating.length;
    this.rating.forEach((review) => {
      if (review.count >= 1 && review.count <= 5) {
        this.ratingCount[review.count]++;
      }
    });
  }
  openRatingModal(event: MouseEvent): void {
    event.preventDefault(); // Prevent default navigation behavior
  
    // Open the modal and pass data using the `data` property
    const modalRef = this.modalService.open(RatingModalComponent, {
      data: { ratingList: this.rating } // Pass the rating data
    });
  
    // Optional: handle the result when the modal is closed
    modalRef.onClose.subscribe((result: any) => {
      console.log('Modal closed with result:', result);
    });
  }
  
  
  

  closeModal() {
    this.showModal = false; // Close the modal
  }
}
