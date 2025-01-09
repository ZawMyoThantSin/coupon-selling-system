import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseCoupon } from '../../models/purchase-coupon';

@Injectable({
  providedIn: 'root'
})
export class QrValidateService {
  BASE_URL = "http://localhost:8080/api/qrcode/";
  constructor(private http: HttpClient) {

  }
  getQrCodeData(qrCode: string): Observable<any> {
    return this.http.get<any>(this.BASE_URL + 'code/'+qrCode, {
         responseType: 'json'
       });
  }

  getSaleCouponData(id:number): Observable<PurchaseCoupon> {
    return this.http.get<PurchaseCoupon>('http://localhost:8080/api/sale-coupon/'+id, {
         responseType: 'json'
       });
  }
}
