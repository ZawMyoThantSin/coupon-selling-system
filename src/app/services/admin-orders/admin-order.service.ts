import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Order } from '../../models/order';
import { OrderDetail } from '../../models/orderDetail';
import { getDefaultAppConfig } from '../../models/appConfig';


@Injectable({
  providedIn: 'root',
})
export class AdminOrderService {
  private BASE_URL = getDefaultAppConfig().backendHost;

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<any>(this.BASE_URL + '/api/orders', {
      responseType: 'json'
    });
  }

  getByOrderId(id: number): Observable<OrderDetail[]> {
    return this.http.get<any[]>(this.BASE_URL + '/api/orders/o/'+id, {
      responseType: 'json'
    });
  }

  acceptOrder(id: number): Observable<boolean> {
    return this.http.get<any>(this.BASE_URL + '/api/orders/accept/'+id, {
      responseType: 'json'
    });
  }

  rejectOrder(id: number): Observable<boolean> {
    return this.http.get<any>(this.BASE_URL + '/api/orders/reject/'+id, {
      responseType: 'json'
    });
  }


  getImageUrl(imagePath: string): string {
    return `${this.BASE_URL}/public/orders/${imagePath}`;
  }



  getOrderByBusinessId(id: any): Observable<any[]> {
    return this.http.get<any[]>(this.BASE_URL + '/api/orders/business/'+id, {
      responseType: 'json'
    });
  }


}


