import { Component, OnInit } from '@angular/core';
import { Product } from '../../../../../models/product';
import { Business } from '../../../../../models/business';
import { BusinessService } from '../../../../../services/business/business.service';
import { ProductService } from '../../../../../services/product/product.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-business-product',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './business-product.component.html',
  styleUrl: './business-product.component.css'
})
export class BusinessProductComponent implements OnInit{

  business!: Business;
  businessId: any;

  products!: Product[];
  couponPrices: { [key: number]: number } = {};
  couponCreateDates: { [key: number]: Date } = {}; 
  couponExpDates: { [key: number]: Date } = {};  


  constructor(private bService: BusinessService,
              private pService: ProductService,
              private route: ActivatedRoute,
             
  ){}


  ngOnInit(): void {
    // Fetch business data on route parameter change
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id !== this.businessId) { 
        this.businessId = id;
        this.fetchProducts(id);
      }
    });
      
  }

  fetchProducts(businessId: number): void {

    // Fetch products for the business
    this.pService.getAllProducts(businessId).subscribe(
      products => {this.products = products
        console.log(products)
      },
      error => console.error('Error fetching products:', error)
    );
  }

  getImageUrl(imagePath: string): any {
    return this.pService.getImageUrl(imagePath);
  }
  getCouponPrice(productId: number): number {
    return this.couponPrices[productId] || 0; // Default to 0 if no coupon price is available
  }
  // getCouponValidity(productId: number): string {
  //   const createDate = this.datePipe.transform(this.couponCreateDates[productId], 'MMM d EEE');
  //   const expDate = this.datePipe.transform(this.couponExpDates[productId], 'MMM d EEE');
  //   return createDate && expDate ? `${createDate} ~ ${expDate}` : '';
  // }


}
