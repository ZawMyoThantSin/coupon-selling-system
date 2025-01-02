import { Component } from '@angular/core';
import { AdminOrderService, Order } from '../../../../services/admin-orders/admin-order.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
  orders: Order[] = []; // Original order list from the server
  filteredOrders: Order[] = []; // Filtered and displayed orders
  searchTerm: string = ''; // User's search term
  statusFilter: string = ''; // Current status filter

  constructor(
    private adminOrderService: AdminOrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.adminOrderService.getOrders().subscribe((data) => {
      this.orders = data;
      this.filteredOrders = data; // Initialize filteredOrders with all orders
    });
  }

  viewOrderDetails(orderId: string) {
    this.router.navigate(['/d/order', orderId]);
  }

  acceptOrder(orderId: string) {
    this.adminOrderService
      .updateOrderStatus(orderId, 'accepted')
      .subscribe((updatedOrder) => {
        this.orders = this.orders.map((order) =>
          order.id === orderId ? updatedOrder : order
        );
        this.filterOrders(); // Reapply filters after status change
      });
  }

  rejectOrder(orderId: string) {
    this.adminOrderService
      .updateOrderStatus(orderId, 'rejected')
      .subscribe((updatedOrder) => {
        this.orders = this.orders.map((order) =>
          order.id === orderId ? updatedOrder : order
        );
        this.filterOrders(); // Reapply filters after status change
      });
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter((order) => {
      const matchesSearchTerm =
        order.id.toString().includes(this.searchTerm) ||
        order.customerName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.statusFilter === '' || order.status === this.statusFilter;

      return matchesSearchTerm && matchesStatus;
    });
  }
}
