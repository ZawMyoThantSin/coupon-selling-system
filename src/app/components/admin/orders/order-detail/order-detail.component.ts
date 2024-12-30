import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AdminOrderService, Order } from '../../../../services/admin-orders/admin-order.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent {
  order!: Order | null;

  constructor(
    private adminOrderService: AdminOrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.adminOrderService.getOrders().subscribe(orders => {
        this.order = orders.find(order => order.id === orderId) || null;
      });
    }
  }

  updateStatus(orderId: string, status: 'accepted' | 'rejected') {
    this.adminOrderService.updateOrderStatus(orderId, status).subscribe(updatedOrder => {
      this.order = updatedOrder;
      this.router.navigate(['/admin/orders']);
    });
  }
}
