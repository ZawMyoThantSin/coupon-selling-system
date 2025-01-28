import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdbModalModule, MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { BusinessService } from '../../../../services/business/business.service';

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
}
