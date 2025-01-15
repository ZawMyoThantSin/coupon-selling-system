import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PurchaseCouponService } from '../../../services/purchase-coupon/purchase-coupon.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BusinessService } from '../../../services/business/business.service';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
import { ProductService } from '../../../services/product/product.service';
import { PurchaseCoupon } from '../../../models/purchase-coupon';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { QrCodeModalComponent } from '../qr-code-modal/qr-code-modal.component';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { ShareCouponModelComponent } from '../share-coupon-model/share-coupon-model.component';
import { forkJoin } from 'rxjs';
import { response } from 'express';
@Component({
  selector: 'app-purchase-coupon',
  standalone: true,
  imports: [CommonModule, MatIconModule, MdbTooltipModule,RouterLink],
  templateUrl: './purchase-coupon.component.html',
  styleUrls: ['./purchase-coupon.component.css'],
})
export class PurchaseCouponComponent implements OnInit {

  modalRef: MdbModalRef<QrCodeModalComponent> | null = null;
  modalRefShareCoupon: MdbModalRef<ShareCouponModelComponent> | null = null;

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
  acceptedCoupons: any[] = [];
  transferData: any[] = [];
  filteredUsedCoupons: PurchaseCoupon[] = [];
  filteredTransferredCoupons: any[] = [];
  filteredExpiredCoupons: any[] = [];
  expiredAcceptedCoupons: any[] = [];
  
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
    const accepterId = this.userId;
    this.loadCoupons(this.userId);
    this.loadAcceptCoupons();
    
  }
}

loadAcceptCoupons(): void {
  // Fetch accepted coupons
  this.purchaseCouponService.getTransferCouponDataByAccepter(this.userId).subscribe(
    (response) => {
      console.log('Response:', response);
      this.transferData = response;

      // Create an array of observables for all SaleCoupon fetch calls
      const saleCouponObservables = this.transferData.map((c) =>
        this.purchaseCouponService.getSaleCouponById(c.saleCouponId)
      );

      // Wait for all SaleCoupon fetch calls to complete
      forkJoin(saleCouponObservables).subscribe(
        (coupons) => {
          const currentDate = new Date();
      
          // Enrich coupons with senderName
          const enrichedCoupons = coupons.map((coupon, index) => ({
            ...coupon,
            senderName: this.transferData[index]?.senderName || '', // Populate senderName
            
          }));
          console.log('TEE',enrichedCoupons)
      
          // Separate accepted and expired coupons using enriched data
          this.acceptedCoupons = enrichedCoupons.filter(
            (coupon) => new Date(coupon.expiryDate) > currentDate
          );
      
          this.expiredAcceptedCoupons = enrichedCoupons.filter(
            (coupon) => new Date(coupon.expiryDate) <= currentDate
          );
      
          console.log('Accepted Coupons:', this.acceptedCoupons);
          console.log('Expired Accepted Coupons:', this.expiredAcceptedCoupons);
      
          // Combine all coupons and filter
          this.availableCoupons = [...this.availableCoupons, ...this.acceptedCoupons];
          // this.filterCoupons();
        },
        (error) => {
          console.error('Error fetching SaleCoupon data:', error);
        }
      );
      
    },
    (error) => {
      console.error('Error fetching accepted coupons:', error);
    }
  );
}
  // loadCoupons(userId: number): void {
  //   this.purchaseCouponService.getAllCouponsByUserId(userId).subscribe(
  //     (coupons) => {
  //       this.availableCoupons = coupons;
  //       console.log("jjjj",this.availableCoupons)
  //       this.filterCoupons(); // Filter coupons by status
        
  //     },
  //     (error) => {
  //       console.error('Error fetching coupons:', error);
  //     }
  //   );
  // }
  loadCoupons(userId: number): void {
  this.purchaseCouponService.getAllCouponsByUserId(userId).subscribe(
    (coupons) => {
      this.availableCoupons = coupons;
      console.log("jjjj", this.availableCoupons);
      this.filterCoupons(); // Filter coupons by status

     
      // Fetch transferred coupons from the sender
this.purchaseCouponService.getTransferCouponDataBySender(userId).subscribe(
  (transferredCoupons) => {
    let transferarray: any[] = transferredCoupons;

    // Create an array of observables for all SaleCoupon fetch calls
    const saleCouponObservables = transferarray.map((coupon) =>
      this.purchaseCouponService.getSaleCouponById(coupon.saleCouponId)
    );

    // Wait for all SaleCoupon fetch calls to complete
    forkJoin(saleCouponObservables).subscribe(
      (saleCoupons) => {
        // Enrich transferred coupons with their corresponding SaleCoupon data
        const enrichedCoupons = saleCoupons.map((saleCoupon, index) => ({
          ...transferarray[index], // Retain the transferred coupon data
          saleCouponData: saleCoupon, // Add SaleCoupon data
        }));

        // Assign the enriched data to filteredTransferredCoupons
        this.filteredTransferredCoupons = enrichedCoupons;

        console.log("Enriched Transferred Coupons:", this.filteredTransferredCoupons);
      },
      (error) => {
        console.error("Error fetching SaleCoupon data:", error);
      }
    );
  },
  (error) => {
    console.error("Error fetching transferred coupons:", error);
  }
);

    },
    (error) => {
      console.error('Error fetching coupons:', error);
    }
  );
}

  
  // Filter coupons based on status
  filterCoupons(): void {
    const currentDate = new Date();
    this.filteredAvailableCoupons = this.availableCoupons.filter(
      (coupon) => coupon.status === 0 && new Date(coupon.expiryDate) > currentDate
    );
    this.filteredUsedCoupons = this.availableCoupons.filter((coupon) => coupon.status === 1);
    // this.filteredTransferredCoupons = this.availableCoupons.filter((coupon) => coupon.status === 2);
    // console.log("TTTT",this.filteredTransferredCoupons)
    this.filteredExpiredCoupons = [
      ...this.availableCoupons.filter(
        (coupon) => coupon.status !== 1 && coupon.status !== 2 && new Date(coupon.expiryDate) <= currentDate
      ),
      ...this.expiredAcceptedCoupons,
    ];
    
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
    this.modalRefShareCoupon = this.modalService.open(ShareCouponModelComponent, {
      modalClass: 'modal-md',
      data: { coupon: coupon },
    });

    this.modalRefShareCoupon.onClose.subscribe((data) => {
      if (data) {
        this.loadCoupons(this.userId);
      }
    });
  }
  // isNearExpiry(expiryDate: string): boolean {
  //   const now = new Date();
  //   const expiry = new Date(expiryDate);
  //   const timeDiff = expiry.getTime() - now.getTime();
  //   const daysRemaining = timeDiff / (1000 * 3600 * 24);
  //   return daysRemaining <= 3 && daysRemaining >= 0;
    
  // }
  isNearExpiry(expiryDate: string): boolean {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expiry = new Date(
      new Date(expiryDate).getFullYear(),
      new Date(expiryDate).getMonth(),
      new Date(expiryDate).getDate()
    );
  
    const timeDiff = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysRemaining <= 3 && daysRemaining >= 0;
  }
  
  getExpiryMessage(expiryDate: string): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expiry = new Date(
      new Date(expiryDate).getFullYear(),
      new Date(expiryDate).getMonth(),
      new Date(expiryDate).getDate()
    );
  
    const timeDiff = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
    if (daysRemaining > 0) {
      return `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`;
    } else if (daysRemaining === 0) {
      return 'Expires today';
    } else {
      return 'Expired';
    }
  }
  
  // Open modal with coupon details
  openQrModal(coupon: any) {
    console.log("C", coupon);
    this.modalRef = this.modalService.open(QrCodeModalComponent, {
      modalClass: 'modal-md',
      data: { coupon: coupon },
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
