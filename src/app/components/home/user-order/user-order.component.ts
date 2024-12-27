import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserOrderService } from '../../../services/user-order/user-order.service';
import { UserPayment } from '../../../models/userpayment';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/payment/payment.service';

@Component({
  selector: 'app-user-order',
  standalone: true,
  imports: [CommonModule],
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
<<<<<<< HEAD
  
  //Buy
  
=======

  //Buy

>>>>>>> f5e11067ea1bc0a5c1f9f11bdfe642a839d95469
  productName = '';
  quantity = 1;
  totalPrice = 0;
  constructor(private userOrderService: UserOrderService,
<<<<<<< HEAD
=======
    private paymentService: PaymentService,
>>>>>>> f5e11067ea1bc0a5c1f9f11bdfe642a839d95469
    private route: ActivatedRoute
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
    }
<<<<<<< HEAD
  

  console.log("Retrieved Cart Data: ", this.cartData);
  console.log("Retrieved Total Price: ", this.total);
     // Retrieving the state data passed via router navigation
    //  const state = history.state;
    //  if (state) {
    //    this.productName = state.productName || '';
    //    this.quantity = state.quantity || 0;
    //    this.totalPrice = state.totalPrice || 0;
    //  }
   
    

    
    // const state = history.state;

    // if (state) {
    //   this.action = state.action || '';
      
    //   if (this.action === 'checkout') {
    //     this.cartData = state.cartData || [];
    //     this.total = state.total || 0;
    //   }

    //   if (this.action === 'buy') {
    //     this.productName = state.productName || '';
    //     this.quantity = state.quantity || 1;
    //     this.totalPrice = state.totalPrice || 0;
    //   }
    // }
  
=======
  // console.log("Retrieved Cart Data: ", this.cartData);
  // console.log("Retrieved Total Price: ", this.total);

>>>>>>> f5e11067ea1bc0a5c1f9f11bdfe642a839d95469
  }

  // This method will update the selected payment method and its details
  onPaymentMethodChange(event: any): void {
    const methodValue = event.target.value;
    this.selectedMethod = this.paymentMethods.find(method => method.paymentType === methodValue) || this.paymentMethods[0];
<<<<<<< HEAD
    
=======
  }

  getImageUrl(imagePath: any): string {
    return this.paymentService.getImageUrl(imagePath) ;
>>>>>>> f5e11067ea1bc0a5c1f9f11bdfe642a839d95469
  }
}
