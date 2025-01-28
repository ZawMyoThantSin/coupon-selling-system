import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { PurchaseCoupon } from '../../../models/purchase-coupon';
import { ProductService } from '../../../services/product/product.service';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { getDefaultAppConfig } from '../../../models/appConfig';
import { EncodingUtils } from '../../../services/encoding-utils';

@Component({
  selector: 'app-qr-code-modal',
  standalone: true,
  imports: [QRCodeModule,CommonModule,MdbTooltipModule],
  template: `
  <div class="modal-header  px-5">
  <h5 class="modal-title" id="qrCodeModalLabel">Redeem Promotion</h5>
  <div class="d-flex justify-content-center align-items-center py-2">
    <button class="btn btn-sm btn-primary me-2" (click)="toggleCode()">
      {{ isCodeVisible ? 'Show QR Code' : 'Get Code' }}
    </button>
    <button
      type="button"
      class="btn-close "
      aria-label="Close"
      (click)="close()"
    ></button>
  </div>
</div>

<div class="modal-body text-center">
  <div>
    <!-- Promotion Details -->
    <h6 class="text-primary">{{ coupon.productName }}</h6>
    <p class="text-danger mb-0 fw-bold">Big Savings {{ coupon.discount }}% OFF</p>
    <p class="mb-0">Valid until {{ coupon.expiryDate | date }}.</p>
  </div>

  <!-- QR Code -->
  <div class="w-100">
  <div *ngIf="!isCodeVisible">
      <!-- QR Code -->
      <div *ngIf="!isLoading && !error">
        <qrcode
          #qrCanvas
          [qrdata]="qrData"
          [elementType]="'canvas'"
          [width]="230"
          [colorDark]="'#000000'"
          [errorCorrectionLevel]="'M'">
        </qrcode>
      </div>
  </div>
  <div *ngIf="isCodeVisible" class="encoded-code-card my-3">
      <p class="text-dark">Enter this Code: <span class="text-primary fw-bold">{{ encodedCode }}</span></p>
  </div>

    <!-- Business Details -->
    <h4>
      <i class="fas fa-store me-2 fs-6"></i> <!-- Icon for business -->
      {{ coupon.businessName }}
    </h4>
    <h4>
      <i class="fas fa-map-marker-alt me-2 fs-6"></i> <!-- Icon for location -->
      {{ coupon.businessLocation }}
    </h4>

    <!-- Save QR Code -->
    <div>
      <span
        (click)="saveQrCode()"
        mdbTooltip="Save To Device"
        class="btn btn-outline-secondary rounded rounded-pill">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666">
          <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
        </svg>
      </span>
    </div>
</div>



  <!-- Error State -->
  <div *ngIf="error" class="text-danger mt-3">
    {{ error }}
  </div>

  <!-- Loading Spinner -->
  <div *ngIf="isLoading" class="d-flex justify-content-center mt-3">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>



  `,
  styleUrl: './qr-code-modal.component.css'
})
export class QrCodeModalComponent {
  @Input() coupon!: PurchaseCoupon;
  qrId: number = 0;
  isCodeVisible:boolean = false;
  encodedCode:string = '';
  saleCouponId!: number;
  qrData: string = '';
  isLoading: boolean = true;
  error: string | null = null;

  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(public modalRef: MdbModalRef<QrCodeModalComponent>,
              private http: HttpClient,
              private  productService: ProductService
            ) {}

  ngOnInit(): void {
    this.saleCouponId = this.coupon.saleCouponId;
    this.fetchQrData(this.saleCouponId);
  }

  fetchQrData(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.http.get<any>(`${getDefaultAppConfig().backendHost}/api/sale-coupon/qr/${id}`, { responseType: 'json' })
      .subscribe(
        (res) => {
          this.qrData = res.qrcode;
          this.qrId = res.id;
          // console.log('QR Code data fetched:', res);
          this.isLoading = false;
        },
        (err) => {
          console.error('Error fetching QR Code data:', err);
          this.error = 'Failed to fetch QR Code. Please try again later.';
          this.isLoading = false;
        }
      );
  }

  toggleCode(): void {
    if (this.isCodeVisible) {
      this.isCodeVisible = false; // Show QR code
    } else {
      this.isLoading = true;
      this.error = '';

      // Simulate async operation to generate encoded code
      setTimeout(() => {
        // Generate the encoded code
        this.encodedCode = EncodingUtils.encode(this.qrData);
        console.log("Encoded: ", this.encodedCode)
        this.http.get<any>(`${getDefaultAppConfig().backendHost}/api/qrcode/${this.qrId}/${this.encodedCode}`, { responseType: 'json' })
        .subscribe(
          (res) => {
            this.isLoading = false;
          },
          (err) => {
            console.error('Error fetching QR Code data:', err);
            this.error = 'Failed to fetch QR Code. Please try again later.';
            this.isLoading = false;
          }
        );
        this.isCodeVisible = true; // Show encoded code
        this.isLoading = false;
      }, 1000); // Simulate 1 second delay
    }
  }


  saveQrCode(): void {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        console.error('Failed to get canvas context');
        return;
    }

    // Set canvas dimensions
    const canvasWidth = 400; // Customize as needed
    const canvasHeight = 600; // Customize as needed
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Fill background color
    context.fillStyle = '#ffffff'; // White background
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    // Set the left margin for all texts and images
    const leftMargin = 50; // Left margin for alignment
    const textSpacing = 30; // Vertical spacing between elements
    const extraSpaceBetweenSections = 50; // Extra space between center-aligned and left-aligned sections

    // Draw QR code onto the canvas
    const qrCanvas = document.querySelector('qrcode canvas') as HTMLCanvasElement;
    if (qrCanvas) {
        // Center the QR code horizontally and place it at the top
        context.drawImage(qrCanvas, (canvasWidth - qrCanvas.width) / 2, 50);
    } else {
        console.error('QR Code canvas not found!');
        return;
    }

    // Add text below the QR code
    let currentYPosition = qrCanvas.height + 60; // 60px below QR code

    // Product name - Centered horizontally under QR code
    context.textAlign = 'center';
    context.fillStyle = '#0000ff'; // Blue for product name
    context.font = '20px Arial';
    context.fillText(this.coupon.productName, canvasWidth / 2, currentYPosition);
    currentYPosition += textSpacing; // Update position for next element

    // Discount - Centered horizontally under QR code
    context.fillStyle = '#ff0000'; // Red for discount
    context.font = '18px Arial';
    context.fillText(`Big Savings ${this.coupon.discount}% OFF`, canvasWidth / 2, currentYPosition);
    currentYPosition += textSpacing; // Update position for next element

    // Expiry date - Centered horizontally under QR code
    context.fillStyle = '#000000'; // Black for expiry date
    context.font = '16px Arial';
    context.fillText(`Valid until ${new Date(this.coupon.expiryDate).toLocaleDateString()}`, canvasWidth / 2, currentYPosition);
    currentYPosition += textSpacing; // Update position for next element

    // Add extra space before the left-aligned section
    currentYPosition += extraSpaceBetweenSections;

    // Add shop name and location with shop image
    const shopImage = new Image();
    shopImage.src = '/images/product/shop image.jpg'; // Provide the path to your shop image

    shopImage.onload = () => {
        const shopIconSize = 30; // Size of the shop icon
        const shopTextY = currentYPosition; // Y position for shop name and location

        // Left-align business name and location with shop image
        context.textAlign = 'left';

        // Draw shop image to the left of the business name
        context.drawImage(shopImage, leftMargin, shopTextY - shopIconSize / 2, shopIconSize, shopIconSize);

        // Draw business name next to the shop image
        context.fillStyle = '#000000'; // Black for shop name text
        context.font = '18px Arial';
        context.fillText(this.coupon.businessName, leftMargin + shopIconSize + 10, shopTextY);
        currentYPosition = shopTextY + textSpacing; // Update position for next element

        // Add location icon and text
        const locationIcon = new Image();
        locationIcon.src = '/images/product/map2.png'; // Provide the path to your location icon image
        locationIcon.onload = () => {
          const iconSize = 20; // Size of the location icon
          const locationY = currentYPosition; // Y position for location text

          // Draw location icon below the business name
          context.drawImage(locationIcon, leftMargin, locationY - iconSize / 2, iconSize, iconSize);

          // Wrap and draw location text
          const maxTextWidth = canvasWidth - leftMargin - 20; // Allow padding on the right
          const lineHeight = 20; // Height between lines
          let lines = [];
          let words = this.coupon.businessLocation.split(' ');
          let currentLine = '';

          for (let word of words) {
              let testLine = currentLine + word + ' ';
              if (context.measureText(testLine).width > maxTextWidth) {
                  lines.push(currentLine);
                  currentLine = word + ' ';
              } else {
                  currentLine = testLine;
              }
          }
          lines.push(currentLine); // Push the remaining line

          context.fillStyle = '#666666'; // Gray for location text
          context.textAlign = 'left';
          for (let i = 0; i < lines.length; i++) {
              context.fillText(lines[i], leftMargin + iconSize + 10, locationY + lineHeight * i);
          }

          // Save the canvas as an image
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'coupon.png';
          link.click();
      };

      locationIcon.onerror = () => {
          console.error('Failed to load location icon image');
      };
  };

  shopImage.onerror = () => {
      console.error('Failed to load shop image');
  };
}


getProductImageUrl(imagePath: string): any {
  return this.productService.getImageUrl(imagePath);
}

close(): void {
  this.modalRef?.close();
}
}
