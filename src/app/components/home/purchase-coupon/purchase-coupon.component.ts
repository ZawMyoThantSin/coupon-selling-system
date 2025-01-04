import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PurchaseCouponService } from '../../../services/purchase-coupon/purchase-coupon.service';
import { purchaseCoupon } from '../../../models/purchase-coupon';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../../services/business/business.service';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
import { ProductService } from '../../../services/product/product.service';
@Component({
  selector: 'app-purchase-coupon',
  standalone: true,
  imports: [CommonModule,MatIconModule],
  templateUrl: './purchase-coupon.component.html',
  styleUrl: './purchase-coupon.component.css'
})
export class PurchaseCouponComponent implements OnInit {
  activeTab: string = 'available'; // Default active tab
  isModalOpen: boolean = false;
  selectedCoupon: any = null;
  innerTabs = [
    { id: 'available', name: 'Available' },
    { id: 'used', name: 'Used' },
    { id: 'expired', name: 'Expired' },
    { id: 'transferred', name: 'Transferred' }
  ];

  availableCoupons: purchaseCoupon[] = [];
  filteredAvailableCoupons: purchaseCoupon[] = [];
  filteredUsedCoupons: purchaseCoupon[] = [];
  filteredTransferredCoupons: purchaseCoupon[] = [];
  
  userId!: number;
  businessData: any; // Holds data fetched by userId
  token!: string | null;

  constructor(
    private purchaseCouponService: PurchaseCouponService,
    private productService: ProductService,
    private storageService: StorageService,
    private tokenService: JwtService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.token = this.storageService.getItem("token");
    if (this.token != null) {
      this.userId = this.tokenService.getUserId(this.token);
      this.loadCoupons(this.userId);
    }
  }

  loadCoupons(userId: number): void {
    this.purchaseCouponService.getAllCouponsByUserId(userId).subscribe(
      (coupons) => {
        this.availableCoupons = coupons;
        this.filterCoupons(); // Filter coupons based on their status
      },
      (error) => {
        console.error('Error fetching coupons:', error);
      }
    );
  }

  filterCoupons(): void {
    this.filteredAvailableCoupons = this.availableCoupons.filter(coupon => coupon.status === 0);
    this.filteredUsedCoupons = this.availableCoupons.filter(coupon => coupon.status === 1);
    this.filteredTransferredCoupons = this.availableCoupons.filter(coupon => coupon.status === 2);
  }

  getImageUrl(imagePath: string): any {
    return this.productService.getImageUrl(imagePath);
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }
  shareCoupon(coupon: any): void {
    const shareMessage = `Check out this coupon for ${coupon.productName} with a ${coupon.discount}% discount!`;
    // Logic to share the coupon (e.g., using a social sharing API or copying the text)
    console.log('Shared:', shareMessage);
  }
 

openModal(coupon: any): void {
  this.selectedCoupon = coupon;
  this.isModalOpen = true;
}

closeModal(): void {
  this.isModalOpen = false;
  this.selectedCoupon = null;
}
}
