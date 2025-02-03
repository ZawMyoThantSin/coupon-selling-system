import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { UsedCoupon } from '../../../../models/coupon-validation';
import { CouponService } from '../../../../services/coupon/coupon.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BusinessService } from '../../../../services/business/business.service';

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

  error: string | null = null;
  pdfSrc: SafeResourceUrl | null = null;
  excelSrc: SafeResourceUrl | null = null;
      // isPdfDropdownOpen: boolean = false;
      // isExcelDropdownOpen: boolean = false;
  loading: boolean = false;
  pdfTitle: string = '';
  currentParentReportType: string = '';
  currentReportType:'used_coupon_weekly' | 'used_coupon_monthly'  |'used_coupon' | "remain_coupon"= 'used_coupon'; // Corrected the type
  showPreview: boolean = false;
  businessId: number = 0;
  constructor(
    private couponService: CouponService,
    private route: ActivatedRoute,
    private businessService: BusinessService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const shopId = +params['shopId']; // Assuming the route has a 'shopId' parameter
      if (shopId) {
        this.businessId = shopId;
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
    let start = this.startDate ? this.resetTime(new Date(this.startDate)) : null;
    let end = this.endDate ? this.resetTime(new Date(this.endDate)) : null;

    // Swap start and end if startDate is later than endDate
    if (start && end && start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    this.filteredUsedCoupon = this.usedCoupons.filter((coupon) => {
      const usedAt = new Date(coupon.usedAt);
      const normalizedUsedAt = this.resetTime(usedAt);

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
    this.generateReport('pdf', this.currentReportType, this.businessId);
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
    this.filteredUsedCoupon = [...this.usedCoupons]; // Reset to original list
  } else {
    const selectedDate = new Date(this.specificDate);

    this.filteredUsedCoupon = this.usedCoupons.filter((coupon) => {
      const usedAt = new Date(coupon.usedAt);

      if (isNaN(usedAt.getTime())) {
        console.error('Invalid date format for coupon.usedAt:', coupon.usedAt);
        return false;
      }

      return (
        usedAt.getFullYear() === selectedDate.getFullYear() &&
        usedAt.getMonth() === selectedDate.getMonth() &&
        usedAt.getDate() === selectedDate.getDate()
      );
    });
  }

  // Regenerate report after filtering by specific date
  this.generateReport('pdf', this.currentReportType, this.businessId);
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
  onReportTypeChange(reportType?: string) {
    if (reportType) {
      this.currentParentReportType = this.currentParentReportType === reportType ? '' : reportType;
      this.currentReportType = 'used_coupon';
    }
    if (this.currentParentReportType && this.currentReportType) {
      this.generateReport('pdf', this.currentReportType, this.businessId);
    }
  }



  generateReport(
    type: 'pdf' | 'excel',
    reportType: 'used_coupon_weekly' | 'used_coupon_monthly' | 'used_coupon'| "remain_coupon",
    businessId: number = this.businessId
  ) {
    this.loading = true;
    this.error = null;
    this.currentReportType = reportType;
    this.showPreview = false;

    const params = {
      startDate: this.startDate ? `${this.startDate}T00:00:00.000Z` : '',
      endDate: this.endDate ? `${this.endDate}T23:59:59.999Z` : '',
    };



    let service;
    switch (reportType) {
      case 'used_coupon_weekly':
        service = this.businessService.usedCouponReportForWeekly.bind(this.businessService);
        break;
      case 'used_coupon_monthly':
        service = this.businessService.usedCouponReportForMonthly.bind(this.businessService);
        break;
        case 'used_coupon':
        service = this.businessService.usedCouponReport.bind(this.businessService);
        break;
        case 'remain_coupon':
        service = this.businessService.reaminCouponReport.bind(this.businessService);
        break;
      default:
        this.error = 'Invalid report type.';
        this.loading = false;
        return;
    }


    service(type, businessId,params).subscribe({
      next: (data: Blob) => {
        const url = URL.createObjectURL(data);
        if (type === 'pdf') {
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.excelSrc = null;
        } else {
          this.excelSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.pdfSrc = null;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.error = 'An error occurred while generating the report. Please try again.';
        this.loading = false;
      },
    });
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  downloadReport(type: 'pdf' | 'excel', businessId: number = this.businessId) {
    this.loading = true;
    this.error = null;

    let service;
    switch (this.currentReportType) {
      case 'used_coupon_weekly':
        service = this.businessService.usedCouponReportForWeekly.bind(this.businessService);
        break;
      case 'used_coupon_monthly':
        service = this.businessService.usedCouponReportForMonthly.bind(this.businessService);
        break;
        case 'used_coupon':
        service = this.businessService.usedCouponReport.bind(this.businessService);
        break;
        case 'remain_coupon':
        service = this.businessService.reaminCouponReport.bind(this.businessService);
        break;
      default:
        this.error = 'Invalid report type.';
        this.loading = false;
        return;
    }

    const params = {
      startDate: this.startDate ? `${this.startDate}T00:00:00.000Z` : '',
      endDate: this.endDate ? `${this.endDate}T23:59:59.999Z` : '',
    };



    service(type, businessId,params).subscribe({
      next: (data: Blob) => {
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        const extension = type === 'pdf' ? 'pdf' : 'xlsx';
        const reportTypeName = this.currentReportType.replace('_', ' ');
        link.download = `${reportTypeName}_report_${businessId}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        this.error = 'An error occurred while downloading the report. Please try again.';
        this.loading = false;
      },
    });
  }
}
