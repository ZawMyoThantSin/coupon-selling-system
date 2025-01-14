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
  token!: string | null;
  loading: boolean = false; // Flag to track if data is being fetched
  seeAll = false;
  userInfo!:UserResponse;
  userId!:number;

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
}
