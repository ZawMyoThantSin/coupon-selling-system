import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PurchaseCoupon } from '../../models/purchase-coupon';
import { getDefaultAppConfig } from '../../models/appConfig';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class PurchaseCouponService {
  BASE_URL = `${getDefaultAppConfig().backendHost}/api/sale-coupon`;

  constructor(private http: HttpClient,
    private websocketService: WebsocketService
) {}



connectWebSocket(): void {
this.websocketService.connect();
}

disconnectWebSocket(): void {
this.websocketService.disconnect();
}

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
      return this.http.get<any>(`${getDefaultAppConfig().backendHost}/transfer/couponAcepter/${accepterId}`, {
        responseType: 'json'
      });
    }
    getTransferCouponDataBySender(senderId: number): Observable<any> {
      return this.http.get<any>(`${getDefaultAppConfig().backendHost}/transfer/couponSender/${senderId}`, {
        responseType: 'json'
      });
    }

    getSaleCouponById(saleCouponId: number): Observable<any> {
      return this.http.get<any>(`${this.BASE_URL}/${saleCouponId}`);
    }

    getCurrentMonthEarnings(id: number): Observable<number> {
      return this.http.get<number>(this.BASE_URL + '/business-earnings/monthly/'+id, {
        responseType: 'json'
      });
    }

    getCurrentYearEarnings(id: number): Observable<number> {
      return this.http.get<number>(this.BASE_URL + '/business-earnings/yearly/'+id, {
        responseType: 'json'
      });
    }


    getEarnings(): Observable<any> {
      return this.http.get<any>(`${this.BASE_URL}/business-earnings`, { responseType: 'json' });
    }

    // Get available months with their earnings
getAvailableMonths(id: number): Observable<{ [month: string]: number }> {
  if (!id) {
    console.error("Invalid business ID for fetching months.");
    return of({});
  }
  return this.http.get<{ [month: string]: number }>(`${this.BASE_URL}/months/${id}`);
}

    // Get earnings for a specific month
    getEarningsForMonth(id: number, year: number, month: number): Observable<number> {
      if (!id) {
        console.error("Invalid business ID for fetching earnings.");
        return of(0); // Return 0 if no valid ID
      }
      return this.http.get<number>(`${this.BASE_URL}/business-earnings/${id}/${year}/${month}`);
    }
}
