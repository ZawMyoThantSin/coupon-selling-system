import { Component } from '@angular/core';
import { AdminOrderService, Order, OrderItem } from '../../../services/admin-orders/admin-order.service';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  searchTerm = '';
  statusFilter: 'all' | 'pending' | 'accepted' | 'rejected' = 'all';

  constructor(private orderService: AdminOrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filterOrders();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = this.matchesSearchTerm(order);
      const matchesStatus = this.matchesStatusFilter(order);
      return matchesSearch && matchesStatus;
    });
  }

  matchesSearchTerm(order: Order): boolean {
    const lowerSearchTerm = this.searchTerm.toLowerCase();
    return (
      order.customerName.toLowerCase().includes(lowerSearchTerm) ||
      order.id.toLowerCase().includes(lowerSearchTerm)
    );
  }

  matchesStatusFilter(order: Order): boolean {
    return this.statusFilter === 'all' || order.status === this.statusFilter;
  }

  updateStatus(orderId: string, status: 'accepted' | 'rejected'): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe(() => {
      this.loadOrders();
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'accepted':
        return 'badge bg-success text-white'; // Bootstrap/MDB styles
      case 'rejected':
        return 'badge bg-danger text-white';
      default:
        return 'badge bg-warning text-white';
    }
  }

  openImageInNewTab(url: string): void {
    window.open(url, '_blank');
  }

  trackByItemId(index: number, item: OrderItem): string {
    return item.id;
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }



}
