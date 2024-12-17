import { Injectable } from '@angular/core';
import { CouponHistory } from '../../models/coupon-history.models';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CouponHistoryService {

  constructor() {}

  // Simulate a backend response
  getCouponHistory(): Observable<CouponHistory[]> {
    const mockData: CouponHistory[] = [
      { id: 1, couponName: '20% Off on Shoes', shopName: 'Shoe Store', purchasedAt: new Date('2023-10-12'), usedAt: new Date('2023-11-01') },
      { id: 2, couponName: '10% Off on Electronics', shopName: 'Electronics Hub', purchasedAt: new Date('2023-11-10'), usedAt: null },
      { id: 3, couponName: 'Buy 1 Get 1 Free', shopName: 'Grocery Shop', purchasedAt: new Date('2023-09-20'), usedAt: new Date('2023-09-25') },
    ];

    return of(mockData);
  }
}