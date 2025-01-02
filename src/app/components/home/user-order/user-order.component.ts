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
import { ProductService } from '../../../services/product/product.service';

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
  previewUrl: string | null = null; // New property for image preview
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
    private productService:ProductService,
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
      this.selectedMethod = this.paymentMethods[0]; // Default selection

    });
      const state = history.state;
    if (state && state.cartData) {
      this.cartData = state.cartData;
      this.total = state.total;
      this.couponId = state.couponId || null;
    }
    if (state && state.action) {
      this.action = state.action; // "buy-now" or "add-to-cart"
    }
  
    if (this.action === 'add-to-cart' && state.cartData) {
      this.cartData = state.cartData;
      this.total = state.total;
      this.selectedCoupons = state.coupons || [];
    } else if (this.action === 'buy-now' && state.couponId) {
      this.cartData = [
        {
          name: state.cartData[0].productName,
          quantity: state.cartData[0].quantity,
          price: state.cartData[0].price
        }
      ];
      this.total = state.total;
      this.couponId = state.couponId;
    }

    this.token = this.storageService.getItem('token');
    this.userId = this.jwtService.getUserId(this.token);

  }

  // This method will update the selected payment method and its details
  onPaymentMethodChange(event: any): void {
    const methodValue = event.target.value;
    this.selectedMethod = this.paymentMethods.find(method => method.paymentType === methodValue) || this.paymentMethods[0];
  }

  getImageUrl(imagePath: any): string {
    return this.paymentService.getImageUrl(imagePath) ;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.screenshot = file;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result; // Set the preview URL
      };
      reader.readAsDataURL(file); // Read the file as a Data URL
    }
  }

  validatePhoneNumber(): boolean {
    return /^[0-9]{10}$/.test(this.phoneNumber);
  }

  isValidOrder(): boolean {
    return (
      this.cartData.length > 0
    );
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
  formData.append('quantity', this.quantity.toString());
  formData.append('screenshot', this.screenshot || '');


  if (this.action === 'add-to-cart') {
    console.log("Selected Coupons (before submit):", this.selectedCoupons);
    if (this.selectedCoupons && this.selectedCoupons.length > 0) {
      // Send an array of coupon IDs in JSON format
      const couponIdsJson = JSON.stringify(this.selectedCoupons.map((coupon: { id: number }) => coupon.id));
      console.log("Coupon IDs to be sent:", couponIdsJson);
      formData.append('coupon_ids', couponIdsJson);
    } else {
      // If no coupons are selected, append an empty array
      formData.append('coupon_ids', JSON.stringify([]));
    }
  } else if (this.action === 'buy-now') {
    if (this.couponId) {
      console.log("Coupon ID to be sent:", this.couponId);
      formData.append('coupon_ids', JSON.stringify([this.couponId]));
    } else {
      // If no coupon ID is provided, send an empty array or handle as needed
      formData.append('coupon_ids', JSON.stringify([]));
    }
  }

  

  this.userOrderService.submitOrder(formData).subscribe(
    (response) => {
      console.log('Server Response:', response);
      this.toastr.success('Order submitted successfully!', 'Success');
      // this.resetOrder();
    },
    (error) => {
      console.error('Error submitting order:', error);
      this.toastr.error('Failed to submit order. Please try again.', 'Error!');
    }
  );
 }
cancelOrder(): void {
    this.phoneNumber = '';
    this.userMessage = '';
    this.screenshot = null;
    this.previewUrl = null; // Reset the preview URL
    this.selectedMethod = this.paymentMethods[0];
    this.cartData = []; 
    this.total = 0;
    console.log('Order canceled and form reset.');
    this.location.back();
  }
  selectedProduct: any = null; // Holds the currently selected product

  showProductDetails(product: any): void {
    this.selectedProduct = product; // Assign the selected product
  }
  
  closeModal(event: Event): void {
    if ((<HTMLElement>event.target).classList.contains('modal')) {
      this.selectedProduct = null; // Close the modal if clicked outside the content
    }
  }
  getProductImageUrl(imagePath: any): string {
    if (!imagePath) {
      console.warn('Image path is undefined');
      return 'https://via.placeholder.com/150'; // Fallback placeholder
    }
    return this.productService.getImageUrl(imagePath);
  }
  
 
}
