import { Component,OnInit } from '@angular/core';
import { UserPayment } from '../../../models/userpayment';
import { UserOrderService } from '../../../services/user-order/user-order.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-user-order',
  templateUrl: './user-order.component.html',
  styleUrl: './user-order.component.css'
})
export class UserOrderComponent implements OnInit {
  paymentMethods: UserPayment[] = [];
  selectedMethod: UserPayment | undefined;
  //add-to-cart
  action = '';
  cartData: any[] = [];
  total = 0;
  
  //Buy
  
  productName = '';
  quantity = 1;
  totalPrice = 0;
  constructor(private userOrderService: UserOrderService,
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
  
  }

  // This method will update the selected payment method and its details
  onPaymentMethodChange(event: any): void {
    const methodValue = event.target.value;
    this.selectedMethod = this.paymentMethods.find(method => method.paymentType === methodValue) || this.paymentMethods[0];
    
  }
}
