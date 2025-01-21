import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { OrderDetail } from '../../../models/orderDetail';
import { ProductService } from '../../../services/product/product.service';
import { StorageService } from '../../../services/storage.service';
import { JwtService } from '../../../services/jwt.service';
import { OrderHistoryService } from '../../../services/user-order/order-history.service';
import { WebsocketService } from '../../../services/websocket/websocket.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit{
  order_id!: number;
  user_id!: number;
  orderHistory:OrderDetail[]=[];
  token:string | null = null;

  constructor(
    private orderHistoryService: OrderHistoryService,
    private productService:ProductService,
    private storageService: StorageService,
    private tokenService: JwtService,
    private websocketService: WebsocketService


  ) {}
  ngOnInit(): void {
    this.token = this.storageService.getItem("token");
    if(this.token !=null){
      this.user_id = this.tokenService.getUserId(this.token);
    }
    if(this.user_id != 0){
      console.log("REACh", this.user_id)
      this.loadOrders(this.user_id);
    }
    this.handleWebSocketMessages();

 }
 handleWebSocketMessages():void{
  this.websocketService.onMessage().subscribe((message) => {
    if(message =="ORDER_ACCEPTED"|| message == 'ORDER_REJECTED'){
      this.loadOrders(this.user_id);
    }
  });
}

loadOrders(userId: number){
  this.orderHistoryService.getByUserId(userId).subscribe(
    (response: OrderDetail[]) => {
      this.orderHistory = response;
      console.log('History', response);

      // Sort by status (Pending first) and then by order_date (descending)
      this.orderHistory.sort((a, b) => {
        // Sort by status: Pending (not 1) first, then Completed (1)
        if (a.status !== b.status) {
          return a.status - b.status; // Pending (status != 1) comes first
        }
        // If statuses are the same, sort by order_date (descending)
        return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
      });
    },
    (error) => {
      console.error('ERROR IN FETCHING: ', error);
    }
  );
}

    getProductImage(imagePath: string): string {
      return this.productService.getImageUrl(imagePath);
    }
}
