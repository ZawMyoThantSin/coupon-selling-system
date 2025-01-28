import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BusinessService } from '../../../../services/business/business.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from '../../../../services/user/user.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.css'
})
export class AdminReportsComponent {
  error: string | null = null;
  pdfSrc: SafeResourceUrl | null = null;
  excelSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  currentReportType: 'business' | 'user' = 'business';
  startDate: string | undefined;
  endDate: string | undefined;

  constructor(
    private businessService: BusinessService,
    private sanitizer: DomSanitizer,
  ) {}

  generateReport(type: 'pdf' | 'excel', reportType: 'business' | 'user') {
    this.loading = true;
    this.error = null;
    this.currentReportType = reportType;

    let service;

    switch (reportType) {
      case 'business':
        service = () => this.businessService.businessReport(type,reportType);
        break;
      case 'user':
        service = () =>
          this.businessService.generateCustomerListReport(type, this.startDate, this.endDate);
        break;
      default:
        this.error = 'Invalid report type.';
        this.loading = false;
        return;
    }

    service().subscribe({
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
      }
    });
  }

  downloadReport(type: 'pdf' | 'excel') {
    this.loading = true;
    this.error = null;

    let service;

    switch (this.currentReportType) {
      case 'business':
        service = () => this.businessService.businessReport(type,this.currentReportType);
        break;
      case 'user':
        service = () =>
          this.businessService.generateCustomerListReport(type, this.startDate, this.endDate);
        break;
      default:
        this.error = 'Invalid report type.';
        this.loading = false;
        return;
    }

    service().subscribe({
      next: (data: Blob) => {
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        const extension = type === 'pdf' ? 'pdf' : 'xlsx';
        const reportTypeName = this.currentReportType.replace('_', ' ');
        link.download = `${reportTypeName}_report.${extension}`;
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
      }
    });
  }
}
