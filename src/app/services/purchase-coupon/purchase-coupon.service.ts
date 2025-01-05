import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseCoupon } from '../../models/purchase-coupon';

@Injectable({
  providedIn: 'root'
})
export class PurchaseCouponService {
  BASE_URL = "http://localhost:8080/api/sale-coupon";

  constructor(private http: HttpClient) {}

    getAllCouponsByUserId(userId: number): Observable<PurchaseCoupon[]> {
      return this.http.get<PurchaseCoupon[]>(`${this.BASE_URL}/user/${userId}`, {
          responseType: 'json'
      });
  }
}
