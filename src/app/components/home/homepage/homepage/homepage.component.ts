import { Component,OnInit,AfterViewInit } from '@angular/core';
import { BusinessService } from '../../../../services/business/business.service';
import { Business } from '../../../../models/business';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../services/product/product.service';
import { Product } from '../../../../models/product';
import { NO_ERRORS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
  schemas: [NO_ERRORS_SCHEMA]
})
export class HomepageComponent implements OnInit, AfterViewInit {
  
  businesses: Business[] = []; 
  errorMessage: string = '';   
  products: Product[] = [];



  constructor(private businessService: BusinessService,
              private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadBusinesses();
    this.loadProduct();
  }

  ngAfterViewInit(): void {
    this.initializeBusinessesSwiper();
    this.initializeProductsSwiper();
  }

  loadBusinesses(): void {
    this.businessService.getAllBusinesses().subscribe({
      next: (data) => {
        console.log('Businesses fetched:', data);
        this.businesses = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load businesses.';
        console.error(err);
      }
    });
  }

  loadProduct(): void {
    this.productService.getEveryProducts().subscribe({
      next: (data) => {
        console.log('Products fetched:', data); 
        this.products = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load products.';
        console.error(err);
      }
    });
  }

  private initializeBusinessesSwiper(): void {
    const Swiper = (window as any).Swiper;
    new Swiper('.businesses-swiper', {
      slidesPerView: 3,
      spaceBetween: 20,
      loop: this.businesses.length > 3,
      pagination: {
        el: '.businesses-pagination',
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        480: {
          slidesPerView: 1,
        },
      },
    });
  }

  private initializeProductsSwiper(): void {
    const Swiper = (window as any).Swiper;
    new Swiper('.products-swiper', {
      slidesPerView: 3,
      spaceBetween: 20,
      loop: this.products.length > 3,
      pagination: {
        el: '.products-pagination',
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        480: {
          slidesPerView: 1,
        },
      },
    });
  }

}
