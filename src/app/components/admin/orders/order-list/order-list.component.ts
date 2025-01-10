import { Component } from '@angular/core';
import { AdminOrderService } from '../../../../services/admin-orders/admin-order.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Order } from '../../../../models/order';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule,NgxPaginationModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
  orders: Order[] = []; // Original order list from the server
  filteredOrders: Order[] = []; // Filtered and displayed orders
  searchTerm: string = ''; // User's search term
  statusFilter: string = ''; // Current status filter

  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private adminOrderService: AdminOrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.adminOrderService.getAllOrders().subscribe((data) => {
      this.orders = data;
      this.filteredOrders = data; // Initialize filteredOrders with all orders
    });
  }

  viewOrderDetails(orderId: number) {
    this.router.navigate(['/d/order', orderId]);
  }

  // acceptOrder(orderId: string) {
  //   this.adminOrderService
  //     .updateOrderStatus(orderId, 'accepted')
  //     .subscribe((updatedOrder) => {
  //       this.orders = this.orders.map((order) =>
  //         order.id === orderId ? updatedOrder : order
  //       );
  //       this.filterOrders(); // Reapply filters after status change
  //     });
  // }

  // rejectOrder(orderId: string) {
  //   this.adminOrderService
  //     .updateOrderStatus(orderId, 'rejected')
  //     .subscribe((updatedOrder) => {
  //       this.orders = this.orders.map((order) =>
  //         order.id === orderId ? updatedOrder : order
  //       );
  //       this.filterOrders(); // Reapply filters after status change
  //     });
  // }
  // Map status strings to numeric values
  statusMap: { [key: string]: number } = {
    pending: 0,
    accepted: 1,
    rejected: 2
  };

  statusFilterText(status: number): string {
    const statusText: { [key: number]: string } = {
      0: 'Pending',
      1: 'Accepted',
      2: 'Rejected'
    };
    return statusText[status] || 'Unknown';
  }

  filterOrders(): void {
    const search = this.searchTerm.toLowerCase().trim();
    const status = this.statusFilter ? this.statusMap[this.statusFilter] : null;

    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch =
        order.order_id.toString().includes(search) ||
        order.userName.toLowerCase().includes(search);
      const matchesStatus =
        status === null || order.status === status;

      return matchesSearch && matchesStatus;
    });
  }
}
