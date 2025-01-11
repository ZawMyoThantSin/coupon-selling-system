import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BusinessService } from '../../../../services/business/business.service';
import { CommonModule } from '@angular/common';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';

@Component({
  selector: 'app-sale-coupon-report',
  standalone: true,
  imports: [CommonModule,MdbDropdownModule],
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
  defaultBusinessId: number = 36; // Default business ID
  pdfTitle: string = '';
  currentReportType: 'sale_coupon_weekly' | 'sale_coupon_monthly' | 'product' = 'sale_coupon_weekly';

  constructor(
    private businessService: BusinessService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {

  }

  generateReport(
    type: 'pdf' | 'excel',
    reportType: 'sale_coupon_weekly' | 'sale_coupon_monthly' | 'product',
    businessId: number = this.defaultBusinessId
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
          this.pdfTitle = `${reportType.replace('_', ' ')} Report PDF`;
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

  downloadReport(type: 'pdf' | 'excel', businessId: number = this.defaultBusinessId) {
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
