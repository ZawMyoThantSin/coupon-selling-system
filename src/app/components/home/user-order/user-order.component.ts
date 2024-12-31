import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserOrderService } from '../../../services/user-order/user-order.service';
import { UserPayment } from '../../../models/userpayment';
import { CommonModule, Location } from '@angular/common';
import { PaymentService } from '../../../services/payment/payment.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';

@Component({
  selector: 'app-user-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-order.component.html',
  styleUrl: './user-order.component.css'
})
export class UserOrderComponent {
  paymentMethods: UserPayment[] = [];
  selectedMethod: UserPayment | undefined;

  //add-to-cart
  action = '';
  cartData: any[] = [];
  total = 0;
  userMessage = '';
  phoneNumber = '';
  screenshot: File | null = null;
  couponId: number | null = null;

  selectedCoupons : any;



  //Buy

  productName = '';
  quantity = 1;
  totalPrice = 0;

  userId:any;
  token:any;
  constructor(private userOrderService: UserOrderService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private location: Location,
    private storageService : StorageService,
    private jwtService : JwtService
  ) {}

  ngOnInit(): void {
    // Fetch payment methods from the service
    this.userOrderService.getPaymentMethods().subscribe((methods: UserPayment[]) => {
      this.paymentMethods = methods;
      this.selectedMethod = this.paymentMethods[0];

    });
      const state = history.state;
    if (state && state.action) {
      this.action = state.action;
    }

    if (this.action === 'add-to-cart' && state.cartData) {
      this.cartData = state.cartData;
      this.cartData.map(d => console.log("Id",d.couponId))
      this.total = state.total;
      this.selectedCoupons = state.coupons || [];
    } else if (this.action === 'buy-now' && state.couponId) {
      this.cartData = state.cartData;
      this.total = state.total;
      this.couponId = state.couponId;
      console.log('Buy Now Cart Data:', this.cartData);
    }

    this.token = this.storageService.getItem('token');
    this.userId = this.jwtService.getUserId(this.token);

  }



  submitOrder(): void {
    if (!this.userId) {
      this.toastr.error('User ID is missing. Please log in again.', 'Error!');
      return;
    }

    if (!this.selectedMethod?.id) {
      this.toastr.error('Please select a payment method.', 'Error!');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', this.userId.toString());
    formData.append('payment_id', String(this.selectedMethod?.id));
    formData.append('phoneNumber', this.phoneNumber);
    formData.append('totalPrice', this.total.toString());
    formData.append('screenshot', this.screenshot || '');

    // Handle both actions ("add-to-cart" and "buy-now") consistently
    if (this.action === 'add-to-cart' || this.action === 'buy-now') {
      // Prepare `cartData` for "buy-now" if not already populated
      if (this.action === 'buy-now' && this.couponId) {
        this.cartData =this.cartData.map(item => ({
          couponId: this.couponId,
          quantity: item.quantity, // Use the correct quantity from cartData
        }));
      }

      console.log("Cart Data (before processing):", this.cartData);

      // Extract quantities and coupon IDs from cartData
      const quantities = this.cartData.map((item: { quantity: number }) => item.quantity);

      const couponIds = this.cartData
        .map((item: { couponId: number | null }) => item.couponId)
        .filter((id: number | null) => id !== null) as number[];

      console.log("Quantities to be sent:", quantities);
      console.log("Coupon IDs to be sent:", couponIds);

      // Append coupon IDs and quantities to the form data
      if (couponIds.length > 0) {
        formData.append('coupon_ids', JSON.stringify(couponIds));
      } else {
        formData.append('coupon_ids', JSON.stringify([]));
      }

      if (quantities.length > 0) {
        formData.append('quantities', JSON.stringify(quantities));
      } else {
        formData.append('quantities', JSON.stringify([]));
      }
    }

    this.userOrderService.submitOrder(formData).subscribe(
      (response) => {
        console.log('Server Response:', response);
        this.toastr.success('Order submitted successfully!', 'Success');
        // Optionally reset the form or UI state here
      },
      (error) => {
        console.error('Error submitting order:', error);
        this.toastr.error('Failed to submit order. Please try again.', 'Error!');
      }
    );
  }

  onPaymentMethodChange(event: any): void {
    const methodValue = event.target.value;
    this.selectedMethod = this.paymentMethods.find(method => method.paymentType === methodValue) || this.paymentMethods[0];
  }

  getImageUrl(imagePath: any): string {
    return this.paymentService.getImageUrl(imagePath) ;
  }

  onFileChange(event: any): void {
    this.screenshot = event.target.files[0];
  }

  validatePhoneNumber(): boolean {
    return /^[0-9]{10}$/.test(this.phoneNumber);
  }

  isValidOrder(): boolean {
    return (
      this.cartData.length > 0
    );
  }


  cancelOrder(): void {
    this.phoneNumber = '';
    this.userMessage = '';
    this.screenshot = null;
    this.selectedMethod = this.paymentMethods[0];
    this.cartData = [];
    this.total = 0;
    console.log('Order canceled and form reset.');
    this.location.back();
  }

}
