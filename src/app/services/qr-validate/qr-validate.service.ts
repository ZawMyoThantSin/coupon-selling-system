import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseCoupon } from '../../models/purchase-coupon';
import { getDefaultAppConfig } from '../../models/appConfig';

@Injectable({
  providedIn: 'root'
})
export class QrValidateService {
  BASE_URL = `${getDefaultAppConfig().backendHost}/api/qrcode/`;
  constructor(private http: HttpClient) {

  }
  getQrCodeData(qrCode: string): Observable<any> {
    return this.http.get<any>(this.BASE_URL + 'code/'+qrCode, {
         responseType: 'json'
       });
  }

  getSaleCouponData(id:number): Observable<PurchaseCoupon> {
    return this.http.get<PurchaseCoupon>(`${getDefaultAppConfig().backendHost}/api/sale-coupon/`+id, {
         responseType: 'json'
       });
  }

  validateTheCoupon(id:number): Observable<Boolean> {
    return this.http.get<Boolean>(this.BASE_URL + 'validate/'+id, {
         responseType: 'json'
    });
  }
}
