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
    }else{
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
  saveOrderAsImage(orderId: number): void {
    const order = this.orderHistory.find(o => o.order_id === orderId);
    if (!order) {
      console.error("Order not found");
      return;
    }

    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400 + order.orderItems.length * 60;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }

    // Background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = "#000";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Order Receipt", 220, 40);

    // Order Details
    ctx.font = "16px Arial";
    ctx.fillText(`Order ID: ${order.order_id}`, 20, 80);
    ctx.fillText(`Order Date: ${new Date(order.order_date).toLocaleString()}`, 20, 110);
    ctx.fillText(`Account Name: ${order.paymentInfo.accountName} `, 20, 140);
    ctx.fillText(`Account Number: ${order.paymentInfo.accountNumber} `, 20, 170);
    ctx.fillText(`Payment Type: ${order.paymentInfo.paymentType} `, 20, 200);

    // Items Header
    ctx.fillText("Items:", 20, 230);

    // Load images and draw order items
    let yPosition = 260;
    let loadedImages = 0;

    order.orderItems.forEach((item, index) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';  // Set the crossOrigin property
      img.src = this.getProductImage(item.imagePath);

      img.onload = () => {
        ctx.drawImage(img, 20, yPosition, 50, 50);
        ctx.fillText(`${item.name} - Qty: ${item.quantity} - Ks ${item.unitPrice}`, 80, yPosition + 30);
        yPosition += 60;
        loadedImages++;

        // Once all images are loaded, save the image
        if (loadedImages === order.orderItems.length) {
          saveCanvasAsImage(canvas, order.order_id);
        }
      };

      img.onerror = () => {
        console.error("Error loading image for:", item.name);
        loadedImages++;
        if (loadedImages === order.orderItems.length) {
          saveCanvasAsImage(canvas, order.order_id);
        }
      };
      ctx.fillText(`Total Price:  ${order.totalPrice}MMK`, 20, 500);
    });



  // Function to save the canvas as an image
  function saveCanvasAsImage(canvas: HTMLCanvasElement, orderId: number) {
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `order_${orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  }
}
