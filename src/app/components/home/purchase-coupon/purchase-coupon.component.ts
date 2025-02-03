import { CUSTOM_ELEMENTS_SCHEMA, Component, OnDestroy, OnInit } from '@angular/core';
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
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-purchase-coupon',
  standalone: true,
  imports: [CommonModule, MatIconModule,MdbTooltipModule,RouterLink],
  templateUrl: './purchase-coupon.component.html',
  styleUrls: ['./purchase-coupon.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PurchaseCouponComponent implements OnInit {

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
  acceptedCoupons: any[] = [];
  transferData: any[] = [];
  filteredUsedCoupons: PurchaseCoupon[] = [];
  filteredTransferredCoupons: any[] = [];
  filteredExpiredCoupons: any[] = [];
  expiredAcceptedCoupons: any[] = [];
  userId!: number; // Holds user ID
  businessData: any; // Holds data fetched by userId
  token!: string | null; // JWT token
  isLoading: boolean = false; // Loading state
  apiCallsInProgress: number = 0; // Counter for API calls in progress

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
      this.isLoading = true;
      this.apiCallsInProgress = 2;
      this.loadCoupons(this.userId);
      this.loadAcceptCoupons();
    }
    this.setupWebSocket();
  }


  // Fetch all coupons by user ID
  loadCoupons(userId: number): void {
    this.isLoading= true;
    this.purchaseCouponService.getAllCouponsByUserId(userId).subscribe(
      async (coupons) => {
        // Wait for all `businessLocation` updates to complete
        const updatedCoupons = await Promise.all(
          coupons.map(async (coupon) => ({
            ...coupon,
            // businessLocation: await this.getLocationName(coupon.businessLocation),
          }))
        );
        this.isLoading = false;
        this.availableCoupons = updatedCoupons; // Assign enriched coupons to the array
        // console.log("Updated Coupons with Business Location:", this.availableCoupons);

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

          // console.log("Enriched Transferred Coupons:", this.filteredTransferredCoupons);
          this.checkLoadingStatus();
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
        this.checkLoadingStatus();
      }
    );
  }
   // Fetch accepted coupons
   loadAcceptCoupons(): void {
    // Fetch accepted coupons
    this.isLoading = true;
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
          async (coupons) => {
            const currentDate = new Date();

            // Enrich coupons with senderName and businessLocation
            const enrichedCoupons = await Promise.all(
              coupons.map(async (coupon, index) => ({
                ...coupon,
                senderName: this.transferData[index]?.senderName || '', // Populate senderName
                // businessLocation: await this.getLocationName(coupon.businessLocation), // Add businessLocation
              }))
            );
          // (coupons) => {
          //   const currentDate = new Date();

          //   // Enrich coupons with senderName
          //   const enrichedCoupons = coupons.map((coupon, index) => ({
          //     ...coupon,
          //     senderName: this.transferData[index]?.senderName || '', // Populate senderName

          //   }));

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
            this.checkLoadingStatus();
          },
          (error) => {
            console.error('Error fetching SaleCoupon data:', error);
          }
        );

      },
      (error) => {
        console.error('Error fetching accepted coupons:', error);
        this.checkLoadingStatus();
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
        this.loadAcceptCoupons();
        break;

      default:
        console.warn('Unknown WebSocket message:', message);
    }
  }

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
    this.isLoading = false;
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

  // async getLocationName(location: string): Promise<string> {
  //   const trimmedInput = location.trim();

  //   if (/^\d/.test(trimmedInput)) {
  //     const [lat, lon] = location.split(',').map(coord => parseFloat(coord.trim()));
  //     const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

  //     try {
  //       const response = await fetch(url);
  //       const data = await response.json();
  //       return data.display_name || location; // Return fetched location name or original value if not found
  //     } catch (error) {
  //       console.error('Error fetching location name:', error);
  //       return location; // Return original location in case of error
  //     }
  //   } else {
  //     return location; // Return as-is if already a name
  //   }
  // }

  checkLoadingStatus(): void {
    this.apiCallsInProgress--;
    if (this.apiCallsInProgress === 0) {
        this.isLoading = false;
    }
  }
}
