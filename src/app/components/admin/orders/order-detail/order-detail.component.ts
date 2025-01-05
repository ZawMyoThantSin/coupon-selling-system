import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AdminOrderService } from '../../../../services/admin-orders/admin-order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderDetail } from '../../../../models/orderDetail';
import { ProductService } from '../../../../services/product/product.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent {
  order!: OrderDetail;

  constructor(
    private productService: ProductService,
    private adminOrderService: AdminOrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.adminOrderService.getByOrderId(Number(orderId)).subscribe((response)=>{
        this.order = response[0];
      },error=> console.log("ERROR: ", error))
    }
  }


  acceptOrder(orderId: number){
    this.adminOrderService.acceptOrder(orderId).subscribe((res)=>{
      if(res){
        this.router.navigate(['d/order']);
      }
    })
  }
  rejectOrder(orderId: number){
    this.adminOrderService.rejectOrder(orderId).subscribe((res)=>{
      if(res){
        this.router.navigate(['d/order']);
      }
   })
  }

  getProductImage(imagePath: string): string {
    return this.productService.getImageUrl(imagePath);
  }

  getOrderImage(imagePath: string): string {
    return this.adminOrderService.getImageUrl(imagePath);
  }

}
