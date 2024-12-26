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

  //Buy

  productName = '';
  quantity = 1;
  totalPrice = 0;
  constructor(private userOrderService: UserOrderService,
    private paymentService: PaymentService,
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
  // console.log("Retrieved Cart Data: ", this.cartData);
  // console.log("Retrieved Total Price: ", this.total);

  }

  // This method will update the selected payment method and its details
  onPaymentMethodChange(event: any): void {
    const methodValue = event.target.value;
    this.selectedMethod = this.paymentMethods.find(method => method.paymentType === methodValue) || this.paymentMethods[0];
  }

  getImageUrl(imagePath: any): string {
    return this.paymentService.getImageUrl(imagePath) ;
  }
}
