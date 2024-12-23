import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../services/product/product.service';
import { Product } from '../../../../models/product';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonEngine } from '@angular/ssr';
import { CommonModule,DatePipe } from '@angular/common';
import { CouponService } from '../../../../services/coupon/coupon.service';
import { Coupon } from '../../../../models/coupon.modal';

@Component({
  selector: 'app-coupon-card',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './coupon-card.component.html',
  styleUrl: './coupon-card.component.css'
})
export class CouponCardComponent implements OnInit{

  products:Product[]=[];
  filteredProducts: Product[] = [];
  searchQuery: string = '';
  couponPrices: { [key: number]: number } = {};
  couponCreateDates: { [key: number]: Date } = {}; 
  couponExpDates: { [key: number]: Date } = {};  
  
  alphabet: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
  constructor(private productService:ProductService,
    private couponService:CouponService,
    private datePipe: DatePipe,
    private router: Router){}
  
  
    ngOnInit() {
      // Fetch all products
      this.productService.getEveryProducts().subscribe(
        (data) => {
          console.log('Products data:', data);
          this.products = data;
          this.filteredProducts = [...this.products];
        },
        (error) => {
          console.error('Error fetching products:', error);
        }
      );
  // Fetch coupon prices and populate the map
  this.couponService.getAllUserCoupons().subscribe(
    (coupons: any) => {
      console.log('Coupons:', coupons); // Check the expDate field here
      coupons.forEach((coupon:any) => {
        console.log(coupon);
        
        this.couponPrices[coupon.productId] = coupon.price;  // Map productId to discount price
        console.log("DATE",coupon.expiredDate )
        this.couponCreateDates[coupon.productId]= new Date(coupon.createdDate)
        this.couponExpDates[coupon.productId] = new Date(coupon.expiredDate); 
      });
    
    },
    (error) => {
      console.error('Error fetching coupons:', error);
    }
  );
  }
  viewProductDetails(id: number) {
    this.router.navigate(['/homepage/p', id]);
  }
  // filterProducts(query: string): void {
  //   this.filteredProducts = this.products.filter(product =>
  //     product.name.toLowerCase().includes(query.toLowerCase())
  //   );
  // }
  filterProducts(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(query)
      );
    } else {
      this.filteredProducts = [...this.products];
    }
  }
  filterByCharacter(char: string): void {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().startsWith(char.toLowerCase())
    );
  }
  
  getImageUrl(imagePath: string): any {
    return this.productService.getImageUrl(imagePath);
  }
  getCouponPrice(productId: number): number {
    return this.couponPrices[productId] || 0; // Default to 0 if no coupon price is available
  }
  // getCouponValidity(productId: number): string {
  //   const createDate = this.datePipe.transform(this.couponCreateDates[productId], 'MMM d EEE');
  //   const expDate = this.datePipe.transform(this.couponExpDates[productId], 'MMM d EEE');
  //   return createDate && expDate ? `${createDate} ~ ${expDate}` : '';
  // }
  // getCouponExpDate(productId: number): any {
  //   return this.couponExpDates[productId] ;
  // }
  getCouponCreateDate(productId: number): any {
    return this.couponCreateDates[productId] ;
  }
  // getCouponExpDate(productId: number): void {
  //   this.couponService.getCouponExpDateByProductId(productId).subscribe({
  //     next: (expDate: string) => {
  //       this.couponExpDates[productId] = new Date(expDate);  // Store the fetched expiration date
  //     },
  //     error: (error) => {
  //       console.error('Error fetching coupon expiration date:', error);
  //     }
  //   });
  // }
  
  
  }
