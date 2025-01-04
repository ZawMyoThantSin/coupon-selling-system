import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { StorageService } from '../storage.service';
import { purchaseCoupon } from '../../models/purchase-coupon';
@Injectable({
  providedIn: 'root'
})
export class PurchaseCouponService {
  BASE_URL = "http://localhost:8080/salecoupon";
  public token: any;
  constructor(private http: HttpClient) {
    
    }
   
    getAllCouponsByUserId(userId: number): Observable<purchaseCoupon[]> {
      return this.http.get<purchaseCoupon[]>(`${this.BASE_URL}/user/${userId}`, {

          responseType: 'json'
      });
  }
      
}
