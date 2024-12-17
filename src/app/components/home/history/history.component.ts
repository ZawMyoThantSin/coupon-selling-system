import { Component, OnInit } from '@angular/core';
import { CouponHistory } from '../../../models/coupon-history.models';
import { CouponHistoryService } from '../../../services/history/coupon-history.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  couponHistory: CouponHistory[] = [];
  totalCoupons: number = 0;
  usedCoupons: number = 0;
  remainingCoupons: number = 0;

  constructor(private couponHistoryService: CouponHistoryService) {}

  ngOnInit(): void {
    this.loadCouponHistory();
  }

  loadCouponHistory(): void {
    // Fetching the coupon history from the backend
    this.couponHistoryService.getCouponHistory().subscribe((data) => {
      this.couponHistory = data;
      this.calculateStatistics(data);
    });
  }

  calculateStatistics(history: CouponHistory[]): void {
    this.totalCoupons = history.length; // Assuming each record represents a purchased coupon
    this.usedCoupons = history.filter(item => item.usedAt).length; // Count the used coupons
    this.remainingCoupons = this.totalCoupons - this.usedCoupons; // Remaining coupons
  }
}
