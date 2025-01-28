import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../../../../services/business/business.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';

@Component({
  selector: 'app-report-preview',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './report-preview.component.html',
  styleUrl: './report-preview.component.css'
})
export class ReportPreviewComponent implements OnInit {
  reportType: 'pdf' | 'excel' = 'pdf';
  businesses: any[] = [];
  selectedBusinessId: number | null = null;
  selectedBusinessName: string | null = null;
  reportUrl: SafeResourceUrl | null = null;
  reportBlob: Blob | null = null;
  loading: boolean = false;
  error: string | null = null;
  isDropdownOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.reportType = params['type'] || 'pdf';
      this.loadBusinesses();
    });
  }

  loadBusinesses(): void {
    this.businessService.getAllBusinesses().subscribe({
      next: (businesses) => {
        this.businesses = businesses;
      },
      error: (error) => {
        console.error('Failed to load businesses:', error);
        this.toastr.error('Failed to load businesses.');
      },
    });
  }

  filterReport(businessId: number | null): void {
    this.selectedBusinessId = businessId;
    if (businessId === null) {
      this.selectedBusinessName = null; // Reset to default text
    } else {
      const selectedBusiness = this.businesses.find(b => b.id === businessId);
      this.selectedBusinessName = selectedBusiness ? selectedBusiness.name : null;
    }
    this.isDropdownOpen = false;
    this.generateReport();
  }

  generateReport(): void {
    this.loading = true;
    this.error = null;
    const businessId = this.selectedBusinessId;

    this.businessService.generatePaidHistoryReport(this.reportType, businessId).subscribe({
        next: (data: Blob | ArrayBuffer) => {
            if (this.reportType === 'pdf') {
                // Handle PDF as before
                const blob = new Blob([data as Blob], { type: 'application/pdf' });
                this.reportBlob = blob;
                const url = URL.createObjectURL(blob);
                this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            } else if (this.reportType === 'excel') {
                // Handle Excel explicitly
                const blob = new Blob([data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'paid_history_report.xlsx'; // Explicitly set the filename
                link.click();
                URL.revokeObjectURL(url); // Clean up
            }
            this.toastr.success('Report generated successfully.');
            this.loading = false;
        },
        error: (error) => {
            console.error('Failed to generate report:', error);
            this.error = 'Failed to generate report. Please try again.';
            this.loading = false;
        },
    });
}

  downloadReport(format: 'pdf' | 'excel'): void {
    if (!this.reportBlob) {
      this.toastr.error('No report available to download.');
      return;
    }
  
    const link = document.createElement('a');
    link.href = URL.createObjectURL(this.reportBlob);
    link.download = `paid_history_report.${format}`;
    link.click();
    this.toastr.success(`Report downloaded successfully as ${format.toUpperCase()}.`);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen; // Toggle dropdown state
  }

  goBack() {
    this.location.back();
  }
  
}