import { Injectable } from '@angular/core';
import { Coupon } from '../../models/coupon.modal';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartData } from '../../models/cartData';
import { getDefaultAppConfig } from '../../models/appConfig';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private BASE_URL = `${getDefaultAppConfig().backendHost}/api/cart`;

  constructor(private http: HttpClient){}


  addToCart(data:any):Observable<any> {
    return this.http.post(`${this.BASE_URL}/add`, data);
  }

  getCartData(id:number):Observable<any>{
    return this.http.get(`${this.BASE_URL}/${id}`);
  }

  clearCart(id:number):Observable<any> {
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }
  updateQuantity(id: number, quantity: number): Observable<any> {
    return this.http.post(
      `${this.BASE_URL}/qty/${id}`,
      {"qty": quantity}
    );
  }

}
