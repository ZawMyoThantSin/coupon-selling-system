import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Order } from '../../models/order';
import { OrderDetail } from '../../models/orderDetail';


@Injectable({
  providedIn: 'root',
})
export class AdminOrderService {
  private BASE_URL = "http://localhost:8080/api/";

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<any>(this.BASE_URL + 'orders', {
      responseType: 'json'
    });
  }

  getByOrderId(id: number): Observable<OrderDetail[]> {
    return this.http.get<any[]>(this.BASE_URL + 'orders/o/'+id, {
      responseType: 'json'
    });
  }

  acceptOrder(id: number): Observable<boolean> {
    return this.http.get<any>(this.BASE_URL + 'orders/accept/'+id, {
      responseType: 'json'
    });
  }

  rejectOrder(id: number): Observable<boolean> {
    return this.http.get<any>(this.BASE_URL + 'orders/reject/'+id, {
      responseType: 'json'
    });
  }


  getImageUrl(imagePath: string): string {
    return `http://localhost:8080/public/orders/${imagePath}`;
  }

}


