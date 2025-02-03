import { Component } from '@angular/core';
import { ProductService } from '../../../../../services/product/product.service';
import { ActivatedRoute} from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CouponService } from '../../../../../services/coupon/coupon.service';
import { CartService } from '../../../../../services/cart/cart.service';
import { JwtService } from '../../../../../services/jwt.service';
import { StorageService } from '../../../../../services/storage.service';
import { ToastrService } from 'ngx-toastr';
import { CartData } from '../../../../../models/cartData';


@Component({
  standalone:true,
  imports:[FormsModule,CommonModule],
  selector: 'app-productdetails',
  templateUrl: './productdetails.component.html',
  styleUrl: './productdetails.component.css'
})
export class ProductdetailsComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private couponService: CouponService,
    private cartService: CartService,
    private tokenService: JwtService,
    private storageService: StorageService,
    private toastr: ToastrService
  ) {}
    cartData!:CartData;
    userId: number = 0;
    product:any;
    quantity: number = 1;
    couponExpDates: { [key: number]: Date } = {};
    couponPrices: { [key: number]: number } = {};
    couponDescriptions: { [key: number]: string } = {};
    couponIds: { [key: number]: number } = {};
    couponRemain: { [key: number]: number } = {};
    ngOnInit(): void {
      const token = this.storageService.getItem("token");
      if(token){
        this.userId = this.tokenService.getUserId(token);
      }

      const productId = this.route.snapshot.params['id'];
      this.productService.getProductById(productId).subscribe((data) => {
        this.product = data;
  });
  // Fetch coupon prices and populate the map
this.couponService.getAllUserCoupons().subscribe(
  (coupons: any) => {
    // console.log('Coupons:', coupons); // Check the expDate field here
    coupons.forEach((coupon:any) => {
      // console.log(coupon);
      this.couponRemain[coupon.productId] = coupon.quantity;
      this.couponPrices[coupon.productId] = coupon.price;  // Map productId to discount price
      this.couponDescriptions[coupon.productId] = coupon.description;
      this.couponExpDates[coupon.productId] = new Date(coupon.expiredDate);
      this.couponIds[coupon.productId] = coupon.id;
    });

  },
  (error) => {
    console.log('couponIds:', this.couponIds);
    console.error('Error fetching coupons:', error);
  }
);

    }
    addToCart() {
      const couponId = this.couponIds[this.product.id];
      const quantity = this.quantity;
      const remainingCouponQuantity = this.couponRemain[this.product.id];

      // Check if quantity is less than or equal to the remaining coupon quantity
      if (quantity <= remainingCouponQuantity) {
      const cartDataToSend = {
        "userId":this.userId,
        "couponId":couponId,
        "quantity":quantity
      }
    this.cartService.addToCart(cartDataToSend).subscribe((res)=> {
      this.toastr.success("Add To Cart Successfully", "Success");
      // Update the remaining quantity after successful add
      this.couponRemain[this.product.id] -= quantity;

    },err => console.log("Error in add to Cart")
    );
    }
    else {
      // Show error if quantity exceeds the available coupon quantity
      this.toastr.error("Not enough stock available for the coupon", "Error");
    }
  }
    goBack(){
      history.back();
    }
    updateQuantity(action: 'increment' | 'decrement', productId: number): void {
      const couponRemain = this.getCouponRemain(productId);

      if (action === 'increment') {
        // Allow increment only if couponRemain > 0 and quantity <= couponRemain and <= 10
        if (this.quantity < couponRemain && this.quantity < 10) {
          this.quantity += 1;
        } else if (this.quantity >= 10) {
          console.warn('Maximum quantity limit reached (10).');
        } else if (this.quantity >= couponRemain) {
          console.warn('Quantity exceeds available coupons.');
        }
      } else if (action === 'decrement' && this.quantity > 1) {
        this.quantity -= 1;
      }
    }

    canIncrement(productId: number): boolean {
      const couponRemain = this.getCouponRemain(productId);
      return this.quantity < couponRemain && this.quantity < 10;
    }
    getImageUrl(imagePath: string): string {
      return this.productService.getImageUrl(imagePath);
    }
    getCouponPrice(productId: number): number {
      return this.couponPrices[productId] || 0; // Default to 0 if no coupon price is available
    }
    getCouponRemain(productId: number): number {
      return this.couponRemain[productId] || 0; // Default to 0 if no coupon price is available
    }
    getCouponDescription(productId: number): string {
      return this.couponDescriptions[productId] || '';  // Ensure full description is returned
    }
    showWarning(id:number):boolean {
      return this.couponRemain[id] <= 5;
    }

    Buy(productName: string,imagePath:string, quantity: number, totalPrice: number,price:number): void {
      const couponId = this.couponIds[this.product.id] || null;
      const cartData = [
        {
          productName: productName,
          productImage:imagePath,
          quantity: quantity,
          totalPrice: totalPrice,
          price:price
        },
      ];

      // console.log("Cart Data being passed: ", cartData);

      this.router.navigate(['/homepage/order'], {
        state: { action: 'buy-now', cartData: cartData, total: totalPrice, couponId: couponId },
      });
    }


  }
