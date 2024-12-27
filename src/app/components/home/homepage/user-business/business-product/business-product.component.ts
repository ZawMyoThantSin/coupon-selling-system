import { Component, OnInit } from '@angular/core';
import { Product } from '../../../../../models/product';
import { Business } from '../../../../../models/business';
import { BusinessService } from '../../../../../services/business/business.service';
import { ProductService } from '../../../../../services/product/product.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { CouponService } from '../../../../../services/coupon/coupon.service';

@Component({
  selector: 'app-business-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-product.component.html',
  styleUrl: './business-product.component.css',
  providers:[DatePipe]
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
              private couponService:CouponService,
              private route: ActivatedRoute,
              private datePipe:DatePipe,
              private router: Router

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
    // Fetch coupon prices and populate the map
  this.couponService.getAllUserCoupons().subscribe(
    (coupons: any) => {
      console.log('Coupons:', coupons); // Check the expDate field here
      coupons.forEach((coupon:any) => {

        this.couponPrices[coupon.productId] = coupon.price;  // Map productId to discount price
        // console.log("DATE",coupon.expiredDate )
        this.couponCreateDates[coupon.productId]= new Date(coupon.createdDate)
        this.couponExpDates[coupon.productId] = new Date(coupon.expiredDate);
      });

    },
    (error) => {
      console.error('Error fetching coupons:', error);
    }
  );


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

  getProductImageUrl(imagePath: string): any {
    return this.pService.getImageUrl(imagePath);
  }
  getCouponPrice(productId: number): number {
    return this.couponPrices[productId] || 0; // Default to 0 if no coupon price is available
  }
  getCouponValidity(productId: number): string {
    const createDate = this.datePipe.transform(this.couponCreateDates[productId], 'MMM d EEE');
    const expDate = this.datePipe.transform(this.couponExpDates[productId], 'MMM d EEE');
    return createDate && expDate ? `${createDate} ~ ${expDate}` : '';
  }
  viewProductDetails(id: number) {
    this.router.navigate(['/homepage/p', id]);
  }

}
