import { Component, Input, OnInit } from '@angular/core';
import { BusinessService } from '../../../../../services/business/business.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdbModalModule, MdbModalRef } from 'mdb-angular-ui-kit/modal';

@Component({
  selector: 'app-payment-history-modal',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './payment-history-modal.component.html',
  styleUrl: './payment-history-modal.component.css',
})
export class PaymentHistoryModalComponent implements OnInit {
  @Input() businessId!: number;
  @Input() businessName!: string;// ID of the business to fetch history for
  paymentHistory: any[] = [];
  loading = true;

  constructor(public modalRef: MdbModalRef<PaymentHistoryModalComponent>,
              private businessService: BusinessService,) {}

  ngOnInit(): void {
    if (this.businessId) {
      this.fetchPaymentHistory();
    }
  }

  fetchPaymentHistory(): void {
    this.loading = true; // Show loader
    this.businessService.getPaidHistory(this.businessId).subscribe({
      next: (history) => {
        this.paymentHistory = history;
        this.loading = false; // Hide loader once data is fetched
      },
      error: (error) => {
        console.error(
          `Failed to fetch payment history for business ID ${this.businessId}:`,
          error
        );
      },
    });
  }
  closeModal(): void {
    this.modalRef.close();
  }

  downloadReport(type: 'pdf' | 'excel', businessId: number = this.businessId) {
    this.loading = true;

    this.businessService.ownerProfitReport(type, businessId).subscribe(
      (response: Blob) => {
        this.loading = false;
        this.downloadFile(response, type);
      },
      (error) => {
        this.loading = false;
        console.error('Error downloading report:', error);
      }
    );
  }

  downloadFile(response: Blob, type: 'pdf' | 'excel') {
    const blob = new Blob([response], { type: type === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel' });
    const link = document.createElement('a');

    // Dynamically set the file name and extension
    const fileName = `payment_history_for_${this.businessName}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;

    // Create a URL for the Blob and set it as the download link
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    // Trigger the download
    link.click();
  }





}
