import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { PurchaseCoupon } from '../../../models/purchase-coupon';
import { ProductService } from '../../../services/product/product.service';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';

@Component({
  selector: 'app-qr-code-modal',
  standalone: true,
  imports: [QRCodeModule,CommonModule,MdbTooltipModule],
  template: `
  <div class="modal-header  px-5">
  <h5 class="modal-title" id="qrCodeModalLabel">Redeem Promotion</h5>
  <button
    type="button"
    class="btn-close"
    aria-label="Close"
    (click)="close()"
  ></button>
</div>

<div class="modal-body text-center">

  <div>
  <img
    [src]="getProductImageUrl(coupon.imageUrl)"
    alt="Promotion"
    class="img-fluid rounded mb-3 border"
    style="width: 50%; max-width: 150px; height: auto;"
  />


  <h6 class="text-primary">{{coupon.productName}}</h6>
  <p class="text-danger mb-0 fw-bold">Big Savings {{coupon.discount}}% OFF</p>
  <p class="mb-0">Valid until {{ coupon.expiryDate | date}}.</p>

  </div>
  <!-- QR Code -->
  <div class="w-100">
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
    <div>
    <span
      (click)="saveQrCode()"
      mdbTooltip="Save To Device"
      class="btn btn-outline-secondary rounded rounded-pill"
      >
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
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
</div>


  `,
  styleUrl: './qr-code-modal.component.css'
})
export class QrCodeModalComponent {
  @Input() coupon!: PurchaseCoupon;

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

    this.http.get<any>(`http://localhost:8080/api/sale-coupon/qr/${id}`, { responseType: 'json' })
      .subscribe(
        (res) => {
          this.qrData = res.qrcode;
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

  saveQrCode(): void {
    const canvas = document.querySelector('qrcode canvas') as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'qr-code.png';
      link.click();
    } else {
      console.error('QR Code canvas not found!');
    }
  }

  getProductImageUrl(imagePath: string): any {
    return this.productService.getImageUrl(imagePath);
  }

  close(): void {
    this.modalRef?.close();
  }
}
