import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  payments: any[] = [];
  filteredPayments: any[] = [];  // Payments filtered based on the filter criteria
  pendingRequests: any[] = [];
  filteredRequests: any[] = [];  // Pending requests filtered based on the filter criteria
  businesses: string[] = [];
  selectedBusiness: string = '';
  selectedDate: string = '';

  ngOnInit() {
    // Sample data mimicking the backend response
    this.payments = [
      {
        id: 1,
        coupon: { name: 'Discount Coupon' },
        business: { name: 'Business A' },
        user: { name: 'John Doe' },
        paymentMethod: 'Credit Card',
        quantity: 2,
        totalPrice: 500,
        purchaseAt: new Date()
      },
      {
        id: 2,
        coupon: { name: 'Holiday Sale' },
        business: { name: 'Business B' },
        user: { name: 'Jane Smith' },
        paymentMethod: 'PayPal',
        quantity: 1,
        totalPrice: 300,
        purchaseAt: new Date()
      }
    ];

    // Sample data for pending requests
    this.pendingRequests = [
      {
        id: 101,
        coupon: { name: 'Spring Discount' },
        user: { name: 'Alice Brown' },
        business: { name: 'Business C' },
        quantity: 3,
        status: 0, // Pending
        totalPrice: 900,
        buyDate: new Date(),
        expiredDate: new Date(new Date().setDate(new Date().getDate() + 30))
      },
      {
        id: 102,
        coupon: { name: 'Summer Sale' },
        user: { name: 'Bob Green' },
        business: { name: 'Business D' },
        quantity: 1,
        status: 0, // Pending
        totalPrice: 100,
        buyDate: new Date(),
        expiredDate: new Date(new Date().setDate(new Date().getDate() + 30))
      }
    ];

    // Populate businesses for filter
    this.businesses = [...new Set(this.pendingRequests.map(req => req.business.name))];

    // Initialize filtered lists
    this.filterRequests();
  }

  generateQRCode(id: number): string {
    return `https://api.qrserver.com/v1/create-qr-code/?data=PaymentRequest-${id}&size=100x100`;
  }

  acceptRequest(id: number): void {
    const request = this.pendingRequests.find(req => req.id === id);
    if (request) {
      request.status = 1; // Approved
      alert(`Request ${id} has been accepted.`);
      this.filterRequests();
    }
  }

  denyRequest(id: number): void {
    this.pendingRequests = this.pendingRequests.filter(req => req.id !== id);
    alert(`Request ${id} has been denied.`);
    this.filterRequests();
  }

  filterRequests(): void {
    // Filter Payments
    this.filteredPayments = this.payments.filter(payment => {
      const matchesBusiness =
        !this.selectedBusiness || payment.business.name === this.selectedBusiness;
      const matchesDate =
        !this.selectedDate || new Date(payment.purchaseAt).toDateString() === new Date(this.selectedDate).toDateString();
      return matchesBusiness && matchesDate;
    });

    // Filter Pending Requests
    this.filteredRequests = this.pendingRequests.filter(req => {
      const matchesBusiness =
        !this.selectedBusiness || req.business.name === this.selectedBusiness;
      const matchesDate =
        !this.selectedDate || new Date(req.buyDate).toDateString() === new Date(this.selectedDate).toDateString();
      return matchesBusiness && matchesDate;
    });
  }
}
