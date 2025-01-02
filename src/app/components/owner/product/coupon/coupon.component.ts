import { Component, OnInit } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridOptions, Module } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CouponService } from '../../../../services/coupon/coupon.service';
import { ClientSideRowModelModule } from 'ag-grid-community';

import { Coupon } from '../../../../models/coupon.modal';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { GridApi } from 'ag-grid-community';

@Component({
  selector: 'app-coupon',
  standalone: true,
  imports: [CommonModule, RouterModule, AgGridModule, FormsModule],
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})
export class CouponComponent implements OnInit {
  businessId: number | null = null;
  allCoupons: Coupon[] = [];
  displayedCoupons: Coupon[] = [];
  currentPage = 1;
  totalPages = 10;

  pagination = true;
  paginationPageSize = 3;
  paginationPageSizeSelector = [3,5,10];

  


  columnDefs: ColDef[] = [
    { field: 'price', headerName: 'Price', valueFormatter: (params) => `${params.value} kyat`, filter: 'agNumberColumnFilter' },
    { field: 'couponCode', headerName: 'Coupon Code', filter: 'agTextColumnFilter' },
    { field: 'expiredDate', headerName: 'Expired Date', filter: 'agDateColumnFilter', valueFormatter: (params) => new Date(params.value).toLocaleString() },
    { field: 'quantity', headerName: 'Quantity', filter: 'agNumberColumnFilter' },
    { field: 'description', headerName: 'Description', filter: 'agTextColumnFilter' },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };

  modules: Module[] = [ClientSideRowModelModule];
  rowSelection: 'multiple' | 'single' = 'multiple';

  hasNextPage = false;
  hasPreviousPage = false;

  constructor(private couponService: CouponService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.businessId = +id;
        this.loadCoupons();
      } else {
        console.error('Error: Missing business ID in route.');
      }
    });
  }

  loadCoupons(): void {
    if (this.businessId !== null) {
      this.couponService.getAllCoupons(this.businessId).subscribe(
        (data) => {
          console.log('Coupons Data:', data);
          this.allCoupons = data;
          this.updatePagination();
        },
        (error) => {
          console.error('Error fetching coupons:', error);
        }
      );
    }
  }

  updatePagination(): void {
    const totalItems = this.allCoupons.length;
    this.totalPages = Math.ceil(totalItems / this.paginationPageSize);
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;

    // Display the coupons for the current page
    const startIndex = (this.currentPage - 1) * this.paginationPageSize;
    const endIndex = startIndex + this.paginationPageSize;
    this.displayedCoupons = this.allCoupons.slice(startIndex, endIndex);
  }

  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to the first page
    this.updatePagination();
  }

  onNextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.updatePagination();
    } else {
      console.log("Next page button error");
    }
  }

  onPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  onPaginationChanged(): void {
    this.updatePagination();
  }

  ngAfterViewInit(): void {
    // No longer need to check for gridOptions.api here
    console.log('Grid API not used here anymore');
  }
}
