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
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-to-cart',
  standalone: true,
  imports: [CommonModule,MatIconModule,RouterLink,],
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.css'
})
export class AddToCartComponent {

    userId:number = 0;
    cartData:CartData[] = [];
    coupons:Coupon[]=[];
    totalPrice: number = 0;
    shipping: number = 1500;
    loading :boolean = false;

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
          console.log("cart",this.cartData)
          
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
    clearCart(id: number): void {
      this.loading = true;
      this.cartService.clearCart(id).subscribe(
        response => {
          const index = this.cartData.findIndex((item) => item.cartId === id);
          if (index !== -1) {
            this.cartData.splice(index, 1);
            this.totalPrice = this.calculateSubtotal();
            this.toastr.success("Item removed successfully!", "Success");
          }
          this.loading = false;
        },
        err => {
          this.toastr.error("Error removing item", "Error");
          this.loading = false;
        }
      );
    }

    // clearCart(id:number): void{
    //   this.cartService.clearCart(id).subscribe(
    //     response => {
    //       const cartItem = this.cartData.find((item) => item.cartId === id);
    //       this.toastr.success("Delete Successfully!",  "Success" )
    //     },
    //     err=> {
    //       this.toastr.error("Erorr")
    //     }
    //   );
    // }

     getImageUrl(imagePath: string): string | null{
      return this.productService.getImageUrl(imagePath);
    }

}

