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
    couponPrices: { [key: number]: number } = {};
    couponDescriptions: { [key: number]: string } = {};
    couponIds: { [key: number]: number } = {};
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
    console.log('Coupons:', coupons); // Check the expDate field here
    coupons.forEach((coupon:any) => {
      console.log(coupon);

      this.couponPrices[coupon.productId] = coupon.price;  // Map productId to discount price
      this.couponDescriptions[coupon.productId] = coupon.description;
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
      const cartDataToSend = {
        "userId":this.userId,
        "couponId":couponId,
        "quantity":quantity
      }
    this.cartService.addToCart(cartDataToSend).subscribe((res)=> {
      this.toastr.success("Add To Cart Successfully", "Success");
    },err => console.log("Error in add to Cart")
    );

    }
    goBack(){
      this.router.navigate(['/homepage']);
    }
    updateQuantity(action: 'increment' | 'decrement'): void {
      if (action === 'increment') {
        this.quantity += 1;
      } else if (action === 'decrement' && this.quantity > 1) {
        this.quantity -= 1;
      }
    }
    getImageUrl(imagePath: string): string {
      return this.productService.getImageUrl(imagePath);
    }
    getCouponPrice(productId: number): number {
      return this.couponPrices[productId] || 0; // Default to 0 if no coupon price is available
    }
    getCouponDescription(productId: number): string {
      return this.couponDescriptions[productId] || '';  // Ensure full description is returned
    }

    Buy(productName: string, quantity: number, totalPrice: number,price:number): void {
      const cartData = [
        {
          productName: productName,
          quantity: quantity,
          totalPrice: totalPrice,
          price:price
        },
      ];

      // console.log("Cart Data being passed: ", cartData);

      this.router.navigate(['/homepage/order'], {
        state: { cartData: cartData, total: totalPrice },
      });
    }
  

  }