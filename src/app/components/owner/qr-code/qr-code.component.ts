import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { QRCodeComponent, QRCodeModule  } from 'angularx-qrcode';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { getDefaultAppConfig } from '../../../models/appConfig';


@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [QRCodeModule, CommonModule],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.css'
})
export class QrTEstModalComponent {
  @Input() saleCouponId!: number;
  qrData: string = '';
  isLoading: boolean = true;
  error: string | null = null;

  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(public modalRef: MdbModalRef<QrTEstModalComponent>, private http: HttpClient) {}

  ngOnInit(): void {
    console.log('Sale Coupon ID in modal:', this.saleCouponId);
    this.fetchQrData(this.saleCouponId);
  }

  fetchQrData(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.http.get<any>(`${getDefaultAppConfig().backendHost}/api/orders/sale/${id}`, { responseType: 'json' })
      .subscribe(
        (res) => {
          this.qrData = res.qrcode;
          console.log('QR Code data fetched:', res);
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

  close(): void {
    this.modalRef?.close();
  }
}
