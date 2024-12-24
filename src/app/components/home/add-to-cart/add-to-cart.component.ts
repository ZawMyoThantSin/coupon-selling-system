import { Component } from '@angular/core';
import { Coupon } from '../../../models/coupon.modal';
import { CartService } from '../../../services/cart/cart.service';
import { CommonModule } from '@angular/common';
import { CartData } from '../../../models/cartData';
import { error } from 'console';
import { Product } from '../../../models/product';
import { ProductService } from '../../../services/product/product.service';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-to-cart',
  standalone: true,
  imports: [CommonModule,MatIconModule],
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.css'
})
export class AddToCartComponent {
    userId:number = 0;
    cartData:CartData[] = [];
    coupons:Coupon[]=[];
    totalPrice: number = 0;
    shipping: number = 1500;

     constructor(private cartService: CartService,
                 private productService: ProductService,
                 private toastr: ToastrService,
                 private storageService: StorageService,
                 private tokenService: JwtService
     ) {}

     ngOnInit(): void {
      const token = this.storageService.getItem("token");
      if(token){
        this.userId = this.tokenService.getUserId(token);
        this.getCartData(this.userId);
      }

    }

    getCartData(id: number): void {
      this.cartService.getCartData(id).subscribe(
        (res: CartData[]) => {
          this.cartData = res;
          this.totalPrice = this.calculateSubtotal(); // Calculate initial total
        },
        (error) => console.error("Error fetching cart data: ", error)
      );
    }
    updateQuantity(id: number, operation: 'increment' | 'decrement'): void {
      console.log("OP: " , operation);
      const cartItem = this.cartData.find((item) => item.cartId === id);

      if (cartItem) {
        const cardId= cartItem.cartId;
        let currentQuantity = cartItem.quantity;
        console.log("CurQTY:", currentQuantity)
        const unitPrice = cartItem.price;

        // Increment logic
        if(operation == 'increment' && currentQuantity<10){
          currentQuantity++;
          this.totalPrice = currentQuantity * unitPrice;
          this.updateCartQuantity(cardId,currentQuantity)
        }

        // Decrement logic
        if (operation == 'decrement' && currentQuantity>0) {
          currentQuantity--; // Decrement the quantity
          this.totalPrice = currentQuantity * unitPrice;
          this.updateCartQuantity(cardId,currentQuantity)
        }
        // Update the cart item's quantity and total price
        cartItem.quantity = currentQuantity;
      }
    }
    updateCartQuantity(cardId: number, quantity:number){
      this.cartService.updateQuantity(cardId,quantity).subscribe(
        res=> console.log(res),
        err=> console.log("Error in update Cart")
      );
    }

    calculateSubtotal(): number {
      return this.cartData.reduce((subtotal, item) => {
        return subtotal + item.price * item.quantity; // Add item's total price to the subtotal
      }, 0);
    }

    calculateTotal(): number {
      return this.calculateSubtotal() + this.shipping;
    }

    clearCart(id:number): void{
      this.cartService.clearCart(id).subscribe(
        response => {
          const cartItem = this.cartData.find((item) => item.cartId === id);
          this.toastr.success("Delete Successfully!",  "Success" )
        },
        err=> {
          this.toastr.error("Erorr")
        }
      );
    }

     getImageUrl(imagePath: string): string | null{
      return this.productService.getImageUrl(imagePath);
    }

}


     // calculateTotal(): void {
     //   this.totalAmount = this.coupons.reduce(
     //     (sum, item) => sum + item.totalPrice,
     //     0
     //   );
     // }

     // clearCart(): void {
     //   this.cartcartService.clearCart();
     //   this.coupons = [];
     //   this.totalAmount = 0;
     // }

