import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BusinessService } from '../../../../services/business/business.service';
import { CommonModule } from '@angular/common';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { QRCodeModule } from 'angularx-qrcode';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sale-coupon-report',
  standalone: true,
  imports: [CommonModule,FormsModule,QRCodeModule],
  templateUrl: './sale-coupon-report.component.html',
  styleUrl: './sale-coupon-report.component.css'
})
export class SaleCouponReportComponent implements OnInit{
  error: string | null = null;
  pdfSrc: SafeResourceUrl | null = null;
  excelSrc: SafeResourceUrl | null = null;
  // isPdfDropdownOpen: boolean = false;
  // isExcelDropdownOpen: boolean = false;
  loading: boolean = false;
  businessId: number = 0; // Default business ID
  pdfTitle: string = '';
  startDate: string | null = null;
  endDate: string | null = null;
  currentParentReportType: string = '';
  currentReportType: 'sale_coupon_weekly' | 'sale_coupon_monthly' | 'product' |'used_coupon_weekly' | 'used_coupon_monthly' | 'coupon' |'used_coupon'|'sale_coupon' |'remain_coupon'|'expired_coupon' |'all_products' | 'best_products' | ''= '';
  showPreview: boolean = false;
  qrCodeUrl: string | null = null;
  constructor(
    private businessService: BusinessService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.businessId = +params['id'];
      console.log('Business ID:', this.businessId);
    });
  }

  reports = [
    { id: 'couponReport', value: 'coupon', label: 'All Coupon' },
    { id: 'saleCoupon', value: 'sale_coupon', label: 'Sale Coupon' },
    { id: 'usedCoupon', value: 'used_coupon', label: 'Used Coupon' },
    { id: 'remaincoupon', value: 'remain_coupon', label: 'Remain Coupon' },
    { id: 'expiredcoupon', value: 'expired_coupon', label: 'Expired Coupon' },
    { id: 'productReport', value: 'all_products', label: 'Products' }
  ];

  onReportTypeChange() {
    if (this.currentReportType) {
      this.startDate = '';
      this.endDate = '';

      if (['sale_coupon', 'used_coupon'].includes(this.currentReportType)) {
        this.currentParentReportType = this.currentReportType;
      } else {
        this.currentParentReportType = ''; // Reset if not in sale/used category
      }

      this.generateReport('pdf', this.currentReportType, this.businessId);
    }
  }

  onDateChange() {
    if (this.currentReportType) {
      this.generateReport('pdf', this.currentReportType, this.businessId);
    }
  }

  generateReport(
    type: 'pdf' | 'excel',
    reportType: 'sale_coupon_weekly' | 'sale_coupon_monthly' | 'product'|'used_coupon_weekly' | 'used_coupon_monthly' | 'coupon' |'used_coupon'|'sale_coupon' |'remain_coupon'|'expired_coupon' |'all_products' | 'best_products',
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
      case 'sale_coupon_weekly':
        service = this.businessService.saleCouponReportForWeekly.bind(this.businessService);
        break;
      case 'sale_coupon_monthly':
        service = this.businessService.saleCouponReportForMonthly.bind(this.businessService);
        break;
        case 'used_coupon_weekly':
          service = this.businessService.usedCouponReportForWeekly.bind(this.businessService);
          break;
        case 'used_coupon_monthly':
          service = this.businessService.usedCouponReportForMonthly.bind(this.businessService);
          break;
      case 'product':
        service = this.businessService.productReport.bind(this.businessService);
        break;
        case 'coupon':
        service = this.businessService.couponReport.bind(this.businessService);
        break;
        case 'sale_coupon':
        service = this.businessService.saleCouponReport.bind(this.businessService);
        break;
        case 'used_coupon':
        service = this.businessService.usedCouponReport.bind(this.businessService);
        break;
        case 'remain_coupon':
            service = this.businessService.reaminCouponReport.bind(this.businessService);
        break;
        case 'expired_coupon':
          service = this.businessService.expiredCouponReport.bind(this.businessService);
      break;
      case 'all_products':
        service = this.businessService.productReport.bind(this.businessService);
        break;
        case 'best_products':
        service = this.businessService.bestProductListReport.bind(this.businessService);
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
      case 'sale_coupon_weekly':
        service = this.businessService.saleCouponReportForWeekly.bind(this.businessService);
        break;
      case 'sale_coupon_monthly':
        service = this.businessService.saleCouponReportForMonthly.bind(this.businessService);
        break;
        case 'used_coupon_weekly':
          service = this.businessService.usedCouponReportForWeekly.bind(this.businessService);
          break;
        case 'used_coupon_monthly':
          service = this.businessService.usedCouponReportForMonthly.bind(this.businessService);
          break;
      case 'product':
        service = this.businessService.productReport.bind(this.businessService);
        break;
        case 'coupon':
          service = this.businessService.couponReport.bind(this.businessService);
          break;
          case 'sale_coupon':
        service = this.businessService.saleCouponReport.bind(this.businessService);
        break;
        case 'used_coupon':
        service = this.businessService.usedCouponReport.bind(this.businessService);
        break;
        case 'remain_coupon':
            service = this.businessService.reaminCouponReport.bind(this.businessService);
        break;
        case 'expired_coupon':
          service = this.businessService.expiredCouponReport.bind(this.businessService);
      break;
      case 'all_products':
        service = this.businessService.productReport.bind(this.businessService);
        break;
        case 'best_products':
        service = this.businessService.bestProductListReport.bind(this.businessService);
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

  clearDates() {
    this.startDate = null;
    this.endDate = null;
    this.onDateChange();
  }

}
