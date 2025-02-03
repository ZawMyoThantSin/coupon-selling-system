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
import { BusinessService } from '../../../services/business/business.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';

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
  business_id: number | null = null;
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
      private businessService: BusinessService,
       private productService:ProductService,
       private toastr: ToastrService
    ) {}

    ngOnInit(): void {
      this.businessService.businessId$.subscribe((id)=>{
        this.business_id = id;
        this.ownerOrderService.getOrderByBusinessId(this.business_id).subscribe(

          (response) => {
            this.ownerOrder = response;
            this.filteredOrders = [...this.ownerOrder]; // Initialize filtered orders
             console.log('Owner Order',this.ownerOrder)
          },
          (error) => {
            console.error('ERROR IN FETCHING: ', error);
          }
        );
      })
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

  clearDateFilter() {
    this.dateFilterStart = '';  // Clear the start date filter
    this.dateFilterEnd = '';    // Clear the end date filter
    this.applyDateFilter();     // Reapply the filter to reset the list
  }




  // Export Orders as PDF
  exportAsPDF(): void {
    if (this.filteredOrders.length === 0) {
      this.toastr.warning("No data available.", "Warning");  // Toast instead of alert
      return;
    }

    const doc = new jsPDF();
    doc.text("Orders Report", 12, 10);

    const tableData = this.filteredOrders.map((order, index) => [
      index + 1,
      order.userName,
      order.userEmail,
      order.productName,
      order.quantity,
      order.totalPrice.toFixed(2),
      order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ""
    ]);

    (doc as any).autoTable({
    head: [["#", "User Name", "Email", "Product", "Quantity", "Total Price", "Order Date"]],
    body: tableData,
    startY: 20, // Start table below title
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 35 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 }
    },
    styles: { fontSize: 10, cellPadding: 3 },
  });

    const finalY = (doc as any).autoTable.previous.finalY || 20;
    doc.text(`Total Earnings: ${this.getTotalPriceForBusiness().toFixed(2)} MMK`, 10, finalY + 10);
    doc.save("orders_report.pdf");
  }

  // Export Orders as Excel
  exportAsExcel(): void {
    if (this.filteredOrders.length === 0) {
      this.toastr.warning("No data available.", "Warning");  // Toast instead of alert
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      this.filteredOrders.map((order, index) => ({
        "#": index + 1,
        "User Name": order.userName,
        "Email": order.userEmail,
        "Product": order.productName,
        "Quantity": order.quantity,
        "Total Price": order.totalPrice.toFixed(2),
        "Order Date": order.orderDate
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders Report");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "orders_report.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  }


