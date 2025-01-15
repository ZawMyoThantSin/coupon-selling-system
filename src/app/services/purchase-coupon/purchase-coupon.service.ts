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
  transferCoupon(saleCouponId:number, acceptorId: number):Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/transfer/${saleCouponId}/${acceptorId}`, {
      responseType: 'json'
  });
  }
  getTransferCouponDataByAccepter(accepterId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/transfer/couponAcepter/${accepterId}`, {
      responseType: 'json'
    });
  }
  getTransferCouponDataBySender(senderId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/transfer/couponSender/${senderId}`, {
      responseType: 'json'
    });
  }
  getSaleCouponById(saleCouponId: number): Observable<PurchaseCoupon> {
    return this.http.get<PurchaseCoupon>(`${this.BASE_URL}/${saleCouponId}`);
}

}
