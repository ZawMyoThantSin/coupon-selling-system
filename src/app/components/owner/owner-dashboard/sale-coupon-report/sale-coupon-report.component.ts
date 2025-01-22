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
  currentParentReportType: string = '';
  currentReportType: 'sale_coupon_weekly' | 'sale_coupon_monthly' | 'product' |'used_coupon_weekly' | 'used_coupon_monthly' = 'sale_coupon_weekly';
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

  generateReport(
    type: 'pdf' | 'excel',
    reportType: 'sale_coupon_weekly' | 'sale_coupon_monthly' | 'product'|'used_coupon_weekly' | 'used_coupon_monthly',
    businessId: number = this.businessId
  ) {
    this.loading = true;
    this.error = null;
    this.currentReportType = reportType;

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
      default:
        this.error = 'Invalid report type.';
        this.loading = false;
        return;
    }

    service(type, businessId).subscribe({
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
      default:
        this.error = 'Invalid report type.';
        this.loading = false;
        return;
    }

    service(type, businessId).subscribe({
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
