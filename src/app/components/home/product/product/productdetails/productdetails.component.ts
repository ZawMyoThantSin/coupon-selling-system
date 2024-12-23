import { Component } from '@angular/core';
import { ProductService } from '../../../../../services/product/product.service';
import { ActivatedRoute} from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CouponService } from '../../../../../services/coupon/coupon.service';


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
  ) {}

    product:any;
    quantity: number = 1;
    couponPrices: { [key: number]: number } = {};
    couponDescriptions: { [key: number]: string } = {};
    couponIds: { [key: number]: number } = {};
    ngOnInit(): void {
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
      console.log("des"+coupon.description);
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
      
      const productId=this.product.id;
      const couponId = this.couponIds[this.product.id];
    const couponPrice = this.couponPrices[this.product.id];
    const quantity = this.quantity;
    console.log(`Added ${quantity} item(s) of coupon ID ${couponId} to the cart.`);
    console.log(`Coupon Price for product ID ${productId}: ${couponPrice}Ks`);

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
    Buy(){

    }
    
}
