import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { UsedCoupon } from '../../../../models/coupon-validation';
import { CouponService } from '../../../../services/coupon/coupon.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-used-coupon',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './used-coupon.component.html',
  styleUrls: ['./used-coupon.component.css'],
})
export class UsedCouponComponent implements OnInit {
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  // For date filter
  startDate: string | null = null;
  endDate: string | null = null;

  // For specific date filter
  specificDate: string = '';

  // For sorting the coupons by date
  sortAscending: boolean = false;

  usedCoupons: UsedCoupon[] = [];
  filteredUsedCoupon: UsedCoupon[] = [];

  constructor(
    private couponService: CouponService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const shopId = +params['shopId']; // Assuming the route has a 'shopId' parameter
      if (shopId) {
        this.loadUsedCoupons(shopId);
      } else {
        console.error('shopId is missing in the route.');
      }
    });
  }

  // Fetch used coupons from the service and sort by date
  loadUsedCoupons(shopId: number): void {
    this.couponService.getUsedCoupon(shopId).subscribe(
      (data: UsedCoupon[]) => {
        this.usedCoupons = data;

        // Sort by the 'usedAt' date in descending order (latest first)
        this.usedCoupons.sort((a, b) => {
          const dateA = new Date(a.usedAt);
          const dateB = new Date(b.usedAt);
          return dateB.getTime() - dateA.getTime(); // For descending order (latest first)
        });

        this.filteredUsedCoupon = [...this.usedCoupons]; // Initialize filtered list
      },
      (error) => {
        console.error('Failed to fetch used coupons', error);
      }
    );
  }

  // Method to filter coupons based on search term and date range
  filterUsedCoupon() {
    const search = this.searchTerm.toLowerCase();
    const start = this.startDate ? this.resetTime(new Date(this.startDate)) : null;
    const end = this.endDate ? this.resetTime(new Date(this.endDate)) : null;

    this.filteredUsedCoupon = this.usedCoupons.filter((coupon) => {
      // Convert `usedAt` to a Date object if it's not already one
      const usedAt = new Date(coupon.usedAt);
      const normalizedUsedAt = this.resetTime(usedAt);

      // Ensure the date conversion is valid
      if (isNaN(normalizedUsedAt.getTime())) {
        console.error('Invalid date format for coupon.usedAt:', coupon.usedAt);
        return false;
      }

      // Extract matches for search
      const matchesSearch =
        coupon.userName.toLowerCase().includes(search) ||
        coupon.email.toLowerCase().includes(search) ||
        coupon.productName.toLowerCase().includes(search);

      // Date range comparison
      const matchesDateRange =
        (!start || normalizedUsedAt >= start) && (!end || normalizedUsedAt <= end);

      return matchesSearch && matchesDateRange;
    });
  }

  // Helper function to reset the time to midnight (00:00:00)
  resetTime(date: Date): Date {
    const reset = new Date(date);
    reset.setHours(0, 0, 0, 0); // Reset time to midnight
    return reset;
  }

  // Method to filter coupons by specific date
  filterUsedCouponBySpecificDate(): void {
    if (!this.specificDate) {
      // If no specific date is selected, reset the filtered list
      this.filteredUsedCoupon = [...this.usedCoupons];
      return;
    }

    const selectedDate = new Date(this.specificDate);

    this.filteredUsedCoupon = this.usedCoupons.filter((coupon) => {
      const usedAt = new Date(coupon.usedAt);

      if (isNaN(usedAt.getTime())) {
        console.error('Invalid date format for coupon.usedAt:', coupon.usedAt);
        return false;
      }

      // Compare dates (ignoring time component)
      return (
        usedAt.getFullYear() === selectedDate.getFullYear() &&
        usedAt.getMonth() === selectedDate.getMonth() &&
        usedAt.getDate() === selectedDate.getDate()
      );
    });
  }

  // Method to clear the search input
  clearSearch() {
    this.searchTerm = '';
    this.startDate = null; // Clear start date filter
    this.endDate = null;   // Clear end date filter
    this.filterUsedCoupon(); // Re-filter to reset the list
  }

  // Method to clear the specific date filter
  clearDateFilter() {
    this.specificDate = '';
    this.filterUsedCoupon(); // Re-filter to reset the list
  }

  // Method to sort coupons by date when clicking on the "Date" column
  sortByDate() {
    this.sortAscending = !this.sortAscending;
    this.usedCoupons.sort((a, b) => {
      const dateA = new Date(a.usedAt);
      const dateB = new Date(b.usedAt);
      return this.sortAscending
        ? dateA.getTime() - dateB.getTime() // Ascending order
        : dateB.getTime() - dateA.getTime(); // Descending order
    });
    this.filteredUsedCoupon = [...this.usedCoupons]; // Reapply filtered list after sorting
  }
}
