import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from 'express';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
import { AdminOrderService } from '../../../services/admin-orders/admin-order.service';
import { CommonModule } from '@angular/common';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductService } from '../../../services/product/product.service';
import { FormsModule } from '@angular/forms';


interface ownerOrder{

  user_id:number;
  business_id:number;
  userName:String;
  userEmail:String;
  productName:String;
  totalPrice:number;
  orderDate:string;
  productPhoto:string;
  quantity:number


}
@Component({
  selector: 'app-owner-order',
  standalone: true,
  imports: [MdbTooltipModule, MdbRippleModule, CommonModule,NgxPaginationModule,FormsModule],
  templateUrl: './owner-order.component.html',
  styleUrl: './owner-order.component.css'
})

export class OwnerOrderComponent {
  ownerOrder:ownerOrder[]=[];
  business_id!: number;
  user_id!: number;
  // token:any;

  filteredOrders: ownerOrder[] = [];
  dateFilterStart: string = ''; // Start Date for filtering
  dateFilterEnd: string = ''; // End Date for filtering
  // For Pagination
  currentPage = 1;
  itemsPerPage = 4;

    


    constructor(
      private ownerOrderService:AdminOrderService,
       private productService:ProductService
    ) {}
  
    ngOnInit(): void {
      // Get businessId from route parameters
      // this.route.paramMap.subscribe((params) => {
      //   this.business_id = Number(params.get('id'));
      //   this.token = this.storageService.getItem('token');
        
      this.ownerOrderService.getOrderByBusinessId(1).subscribe(

        (response) => {
          this.ownerOrder = response;
          this.filteredOrders = [...this.ownerOrder]; // Initialize filtered orders
           console.log('Owner Order',this.ownerOrder)
        },
        (error) => {
          console.error('ERROR IN FETCHING: ', error);
        }
      );
    };

    getProductImage(imagePath: string): string {
      return this.productService.getImageUrl(imagePath);
    }

    applyDateFilter(): void {
      if (this.dateFilterStart || this.dateFilterEnd) {
        const startDate = this.dateFilterStart ? new Date(this.dateFilterStart + 'T00:00:00Z') : null;
        const endDate = this.dateFilterEnd ? new Date(this.dateFilterEnd + 'T23:59:59Z') : null;
    
        if (startDate && endDate && startDate > endDate) {
          alert('Start Date cannot be after End Date.');
          return;
        }
    
        this.filteredOrders = this.ownerOrder.filter((order) => {
          const orderDate = new Date(order.orderDate);
          if (startDate && endDate) {
            return orderDate >= startDate && orderDate <= endDate;
          } else if (startDate) {
            return orderDate >= startDate;
          } else if (endDate) {
            return orderDate <= endDate;
          }
          return true;
        });
      } else {
        this.filteredOrders = [...this.ownerOrder];
      }
    }
    
    getTotalPriceForBusiness(): number {
      return this.filteredOrders.reduce((total, order) => total + order.totalPrice, 0);
    }
    
  /// Filter orders based on date range
  // filterOrdersByDate(): void {
  //   const startDate = this.dateFilterStart ? new Date(this.dateFilterStart) : null;
  //   const endDate = this.dateFilterEnd ? new Date(this.dateFilterEnd) : null;

  //   this.ownerOrder = this.ownerOrder.filter(order => {
  //     const orderDate = new Date(order.orderDate);
  //     return (
  //       (!startDate || orderDate >= startDate) &&
  //       (!endDate || orderDate <= endDate)
  //     );
  //   });
  // }
  }


