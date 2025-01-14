import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { ShareCouponModalComponent } from '../share-coupon-modal/share-coupon-modal.component';
import { WebsocketService } from '../../../services/websocket/websocket.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-purchase-coupon',
  standalone: true,
  imports: [CommonModule, MatIconModule,MdbTooltipModule,RouterLink],
  templateUrl: './purchase-coupon.component.html',
  styleUrls: ['./purchase-coupon.component.css'],
})
export class PurchaseCouponComponent implements OnInit,OnDestroy {

  modalRef: MdbModalRef<QrCodeModalComponent> | null = null;//
  modalRefShareCoupon: MdbModalRef<ShareCouponModalComponent> | null = null;

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
  acceptedCoupons: PurchaseCoupon[] = [];
  transferData: any[] = [];
  filteredUsedCoupons: PurchaseCoupon[] = [];
  filteredTransferredCoupons: PurchaseCoupon[] = [];
  filteredExpiredCoupons: PurchaseCoupon[] = [];

  userId!: number; // Holds user ID
  businessData: any; // Holds data fetched by userId
  token!: string | null; // JWT token

  constructor(
    private purchaseCouponService: PurchaseCouponService,
    private productService: ProductService,
    private storageService: StorageService,
    private tokenService: JwtService,
    private modalService: MdbModalService,
    private websocketService: WebsocketService,
    private toastr: ToastrService
    ) {}

  ngOnInit(): void {
    this.token = this.storageService.getItem('token');
    if (this.token != null) {
      this.userId = this.tokenService.getUserId(this.token);
      const accepterId = this.userId;
      this.loadCoupons(this.userId);
      this.loadAcceptedCoupons();
    }
     // Fetch accepted coupons
    //  this.purchaseCouponService.getTransferCouponDataByAccepter(this.userId).subscribe(
    //   (response) => {
    //     console.log('Response:', response); // Log the whole response object
    //     this.transferData = response;
    //     this.transferData.forEach(arr => console.log("Array", arr.saleCouponId));
    //     // Fetch SaleCoupon data for each transfer (based on saleCouponId)
    //     console.log("transferdata", this.transferData);
    //     this.transferData.forEach((c) => {
    //       console.log('Sale Coupon Data:', c.saleCouponId);
    //       this.purchaseCouponService.getSaleCouponById(c.saleCouponId).subscribe(
    //         (couponData) => {
    //           this.acceptedCoupons.push(couponData);  // Use push to add it to the array
    //           console.log('Sale Coupon Data:', couponData);
    //         },
    //         (error) => {
    //           console.error('Error fetching SaleCoupon data:', error);
    //         }
    //       );
    //     });
    //   },
    //   (error) => {
    //     console.error('Error fetching accepted coupons:', error);
    //   }
    // );
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
  }
  // Fetch all coupons by user ID
  loadCoupons(userId: number): void {
    this.purchaseCouponService.getAllCouponsByUserId(userId).subscribe(
      (coupons) => {
        this.availableCoupons = coupons;
        // console.log('Available Coupons:', this.availableCoupons);
        this.filterCoupons(); // Filter coupons by status
        setTimeout(() => {}, 0);
      },
      (error) => {
        console.error('Error fetching coupons:', error);
      }
    );
  }
   // Fetch accepted coupons
   loadAcceptedCoupons(): void {
    this.acceptedCoupons = []; // Clear the array before reloading
    this.purchaseCouponService.getTransferCouponDataByAccepter(this.userId).subscribe(
      (response) => {
        console.log('Accepted Coupons Response:', response);
        this.transferData = response;
        this.transferData.forEach((transfer) => {
          this.purchaseCouponService.getSaleCouponById(transfer.saleCouponId).subscribe(
            (couponData) => {
              this.acceptedCoupons.push(couponData);
              console.log('Fetched Sale Coupon:', couponData);
            },
            (error) => {
              console.error('Error fetching SaleCoupon data:', error);
            }
          );
        });
      },
      (error) => {
        console.error('Error fetching accepted coupons:', error);
      }
    );
  }
  private setupWebSocket(): void {
    this.websocketService.connect();

    this.websocketService.onMessage().subscribe((message) => {
      this.handleWebSocketMessage(message);
    });
  }

  private handleWebSocketMessage(message: string): void {
    console.log('WebSocket message:', message);

    switch (message) {
      case 'COUPON_TRANSFER_TRANSFERRED':
        console.log('Coupon transfer message received.' , message);
        console.log('User Id : ', this.userId);
        this.loadCoupons(this.userId);
        this.loadAcceptedCoupons();
        break;

      default:
        console.warn('Unknown WebSocket message:', message);
    }
  }

  // Filter coupons based on status
  filterCoupons(): void {
    const currentDate = new Date();
    this.filteredAvailableCoupons = this.availableCoupons.filter(
      (coupon) => coupon.status === 0 && new Date(coupon.expiryDate) > currentDate
    );
    this.filteredUsedCoupons = this.availableCoupons.filter((coupon) => coupon.status === 1);
    this.filteredTransferredCoupons = this.availableCoupons.filter((coupon) => coupon.status === 2);
    this.filteredExpiredCoupons = this.availableCoupons.filter(
      (coupon) => coupon.status !== 1 && new Date(coupon.expiryDate) < currentDate
    );
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
    this.modalRefShareCoupon = this.modalService.open(ShareCouponModalComponent, {
      modalClass: 'modal-md',
      data: { coupon: coupon },
    });

    this.modalRefShareCoupon.onClose.subscribe((data) => {
      if (data) {
        this.loadCoupons(this.userId);
      }
    });
  }

  // Open modal with coupon details
  openQrModal(coupon: any) {
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
