import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet, UrlSegment } from '@angular/router';
import { Business } from '../../../models/business';
import { Product } from '../../../models/product';
import { Coupon } from '../../../models/coupon.modal';
import { BusinessService } from '../../../services/business/business.service';
import { ProductService } from '../../../services/product/product.service';
import { CouponService } from '../../../services/coupon/coupon.service';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { CreateShopComponent } from './create-shop/create-shop.component';
import { UserResponse } from '../../../models/user-response.models';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  modalRef: MdbModalRef<CreateShopComponent> | null = null;//

  businessId!: number;

  showProduct: boolean = true;
  business!: Business;
  products!:Product[];
  coupons!:Coupon[];

  shopExist: boolean =false;
  activeRoute: any = '';
  isLoggedIn: boolean = false;
  isBusinessCollapsed: boolean = true; // Tracks if the business section is collapsed
  token!: any;
  loading: boolean = false; // Flag to track if data is being fetched
  seeAll = false;
  userInfo!:UserResponse;
  userId:any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private tokenService: JwtService,
    private toastr: ToastrService,
    private businessService: BusinessService,
    private userService: UserService,
    private modalService: MdbModalService
  ) {
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url; // Get the active URL
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.businessId = Number(params.get('id'));
      this.fetchBusinessInfo(this.businessId);
      // this.productService.getAllProducts(this.businessId).subscribe((data: Product[]) => {
      //   this.products = data;
      //   this.products = data.filter(product => product.status );
      // });

      //  // Fetch all coupons
      //  this.couponService.getAllCoupons(this.businessId).subscribe((data: Coupon[]) => {
      //   this.coupons = data;
      // });
    });

  }

  private fetchBusinessInfo(businessId: number){
    this.loading =true;
    this.businessService.getById(businessId).subscribe(
      (response) => {
        this.business = response;
        this.shopExist = this.business.id != null ? true : false;//data is null the shop isn't created yet!
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching businesses:', error);
        this.loading = false;
      }
    );
  }
// create business


  // fetchBusinessAndProducts(businessId: number): void {
  //   // Fetch business details
  //   this.businessService.getById(30).subscribe(
  //     business => (this.business = business),
  //     error => console.error('Error fetching business details:', error)
  //   );

  //   // Fetch products for the business
  //   this.productService.getAllProducts(30).subscribe(
  //     products => {this.products = products
  //       console.log(products)
  //     },
  //     error => console.error('Error fetching products:', error)

  //   );

  //   this.couponService.getAllCoupons(businessId).subscribe(
  //     coupons => {
  //       this.coupons = coupons;
  //       console.log('Coupons:', this.coupons);
  //     },
  //     error => console.error('Error fetching coupons:', error)
  //   );

  // }

  // getBusinessDetail(id: number): void {
  //   this.businessService.getById(id).subscribe(
  //     response => {
  //       this.business = response;
  //       console.log('Business details:', this.business);
  //     },
  //     error => {
  //       console.error('Error in fetching business details:', error);
  //       this.business= this.business; // Handle the error case gracefully
  //     }
  //   );
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
