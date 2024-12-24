import { Injectable } from '@angular/core';
import { Coupon } from '../../models/coupon.modal';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartData } from '../../models/cartData';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private BASE_URL = "http://localhost:8080/api/cart";

  constructor(private http: HttpClient){}
  private coupons: Coupon[] = [
    {
      id: 1,
      code: 'DISCOUNT10',
      discount: 10,
      price: 20.00,
      quantity: '1',
      expDate: '2024-12-31'
    },
    {
      id: 2,
      code: 'SALE20',
      discount: 20,
      price: 50.00,
      quantity: '1',
      expDate:'2024-11-30',
    },
    {
      id: 3,
      code: 'BLACKFRIDAY',
      discount: 30,
      price: 100.00,
      quantity: '1',
      expDate: '2024-11-25',
    },
    {
      id: 4,
      code: 'BLACKFRIDAY',
      discount: 30,
      price: 100.00,
      quantity: '1',
      expDate: '2024-11-25',
    },
    {
      id: 5,
      code: 'BLACKFRIDAY',
      discount: 30,
      price: 100.00,
      quantity: '1',
      expDate: '2024-11-25',
    },
    {
      id: 6,
      code: 'BLACKFRIDAY',
      discount: 30,
      price: 100.00,
      quantity: '1',
      expDate: '2024-11-25',
    },
  ];

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
