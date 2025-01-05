import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PurchaseCouponService } from '../../../services/purchase-coupon/purchase-coupon.service';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../../services/business/business.service';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
import { ProductService } from '../../../services/product/product.service';
import { PurchaseCoupon } from '../../../models/purchase-coupon';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { QrCodeModalComponent } from '../qr-code-modal/qr-code-modal.component';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';

@Component({
  selector: 'app-purchase-coupon',
  standalone: true,
  imports: [CommonModule, MatIconModule,MdbTooltipModule],
  templateUrl: './purchase-coupon.component.html',
  styleUrl: './purchase-coupon.component.css',
})
export class PurchaseCouponComponent implements OnInit {

  modalRef: MdbModalRef<QrCodeModalComponent> | null = null;//

  activeTab: string = 'available'; // Default active tab
  isModalOpen: boolean = false; // Modal state
  selectedCoupon: any = null; // Selected coupon details for modal
  innerTabs = [
    { id: 'available', name: 'Available' },
    { id: 'used', name: 'Used' },
    { id: 'expired', name: 'Expired' },
    { id: 'transferred', name: 'Transferred' },
  ];

  availableCoupons: PurchaseCoupon[] = [];
  filteredAvailableCoupons: PurchaseCoupon[] = [];
  filteredUsedCoupons: PurchaseCoupon[] = [];
  filteredTransferredCoupons: PurchaseCoupon[] = [];
  filteredExpiredCoupons: PurchaseCoupon[] = []; // Added filtering for expired coupons

  userId!: number; // Holds user ID
  businessData: any; // Holds data fetched by userId
  token!: string | null; // JWT token

  constructor(
    private purchaseCouponService: PurchaseCouponService,
    private productService: ProductService,
    private storageService: StorageService,
    private tokenService: JwtService,
    private modalService: MdbModalService
  ) {}

  ngOnInit(): void {
    this.token = this.storageService.getItem('token');
    if (this.token != null) {
      this.userId = this.tokenService.getUserId(this.token);
      this.loadCoupons(this.userId);
    }
  }

  // Fetch all coupons by user ID
  loadCoupons(userId: number): void {
    this.purchaseCouponService.getAllCouponsByUserId(userId).subscribe(
      (coupons) => {
        this.availableCoupons = coupons;
        // console.log('Available Coupons:', this.availableCoupons);
        this.filterCoupons(); // Filter coupons by status
      },
      (error) => {
        console.error('Error fetching coupons:', error);
      }
    );
  }

  // Filter coupons based on status
  filterCoupons(): void {
    this.filteredAvailableCoupons = this.availableCoupons.filter((coupon) => coupon.status === 0);
    this.filteredUsedCoupons = this.availableCoupons.filter((coupon) => coupon.status === 1);
    this.filteredTransferredCoupons = this.availableCoupons.filter((coupon) => coupon.status === 2);
    this.filteredExpiredCoupons = this.availableCoupons.filter((coupon) => coupon.status === 3); // Handling expired coupons
  }

  // Generate image URL for the product
  getImageUrl(imagePath: string): any {
    return this.productService.getImageUrl(imagePath);
  }

  // Switch tabs and display corresponding coupons
  selectTab(tabId: string): void {
    this.activeTab = tabId;
  }

  // Share coupon logic
  shareCoupon(coupon: any): void {
    const shareMessage = `Check out this coupon for ${coupon.productName} with a ${coupon.discount}% discount!`;
    console.log('Shared:', shareMessage);
  }

  // Open modal with coupon details
  openQrModal(coupon: any) {
    console.log("C", coupon)
      this.modalRef = this.modalService.open(QrCodeModalComponent, {
      modalClass: 'modal-md',
      data: {  coupon: coupon },
    });
  }

  // Close modal
  closeModal(): void {
    this.modalRef?.close();
  }

  // Get filtered coupons for the active tab
  getFilteredCoupons(): PurchaseCoupon[] {
    switch (this.activeTab) {
      case 'available':
        return this.filteredAvailableCoupons;
      case 'used':
        return this.filteredUsedCoupons;
      case 'transferred':
        return this.filteredTransferredCoupons;
      case 'expired':
        return this.filteredExpiredCoupons;
      default:
        return [];
    }
  }
}
