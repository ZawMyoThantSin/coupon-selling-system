import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, Module } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CouponService } from '../../../../services/coupon/coupon.service';
import { ClientSideRowModelModule } from 'ag-grid-community';

import { Coupon } from '../../../../models/coupon.modal';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { GridApi } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { CellStyleModule } from 'ag-grid-community';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BusinessService } from '../../../../services/business/business.service';

// Register the module
ModuleRegistry.registerModules([CellStyleModule]);


@Component({
  selector: 'app-coupon',
  standalone: true,
  imports: [CommonModule, RouterModule, AgGridModule, FormsModule],
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})
export class CouponComponent implements OnInit {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  businessId: any;
  allCoupons: Coupon[] = [];
  displayedCoupons: Coupon[] = [];
  gridApi!: GridApi;
  currentPage = 1;
  totalPages = 10;

  pagination = true;
  paginationPageSize = 7;
  paginationPageSizeSelector = [7,10,15];
  startDate: string | null = null;
  endDate: string | null = null;
  isReportButtonClicked: boolean = false;
  error: string | null = null;
  pdfSrc: SafeResourceUrl | null = null;
  excelSrc: SafeResourceUrl | null = null;
  loading: boolean = false;
  pdfTitle: string = '';
  currentParentReportType: string = '';
  currentReportType:'coupon' | 'expired_coupon' | 'sale_coupon_weekly' | 'sale_coupon_monthly' |'sale_coupon' | ''  = '';
  showPreview: boolean = false;



  columnDefs: ColDef[] = [
    {
      field: 'price',
      headerName: 'Price',
      valueFormatter: (params) => `${params.value} MMK`,
      filter: 'agNumberColumnFilter'
    },
    { field: 'couponCode', headerName: 'Name', filter: 'agTextColumnFilter' },
    {
      field: 'expiredDate',
      headerName: 'Expired Date',
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => {
        const date = new Date(params.value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();  // Format as a readable date
        } else {
          return 'Invalid Date';
        }
      },
      cellStyle: (params) => {
        // Check if the value is valid
        const expiredDate = params.value ? new Date(params.value) : null;

        if (!expiredDate || isNaN(expiredDate.getTime())) {
          console.error("Invalid date format:", params.value);
          return null; // Return null if the date is invalid (no style will be applied)
        }

        const today = new Date();
        const diffInDays = Math.floor((expiredDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays < 0) {
          // Expired (Red text)
          return { color: 'red', fontWeight: 'bold' };
        } else if (diffInDays <= 3) {
          // Near Expiry (Yellow text)
          return { color: 'yellow', fontWeight: 'bold' };
        } else {
          // Valid (Green text)
          return { color: 'green', fontWeight: 'bold' };
        }
      }
    }

,

    {
      field: 'quantity',
      headerName: 'Quantity',
      filter: 'agNumberColumnFilter',
      valueGetter: (params) => {
        const quantity = params.data.quantity || 0;
        const originalQuantity = params.data.originalQuantity || 0;
        return `${originalQuantity} | ${quantity} (Remaining)`;
      }
    },

    { field: 'description', headerName: 'Description', filter: 'agTextColumnFilter' },
    {
      headerName: 'Actions',
      width: 200,
      cellRenderer: (params: any) => {
        if (!params.data) return ''; // Prevent errors if data is missing

        // Ensure valid expired date and check conditions
        const expiredDateString = params.data.expiredDate;
        const expiredDate = expiredDateString ? new Date(expiredDateString) : null;
        const today = new Date();

        // Show the delete button only if the coupon is expired
        const showDeleteButton = expiredDate instanceof Date &&
                                 !isNaN(expiredDate.getTime()) &&
                                 expiredDate < today;

        if (showDeleteButton) {
          // Create a button element
          const button = document.createElement('button');
          button.classList.add('btn', 'btn-danger', 'btn-sm', 'delete-btn');
          button.innerHTML = '<i class="fas fa-trash-alt"></i>';
          button.style.marginLeft = '5px';

          // Attach click event listener
          button.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering cell click
            console.log('Delete button clicked for ID:', params.data.id);

            // Call delete API
            params.context.componentParent.deleteCoupon(params.data.id);
          });

          return button;
        }

        return ''; // Return empty content if conditions are not met
      },
      onCellClicked: (params: any) => {
        // Prevent API call unless a button is actually clicked
        if (params.event.target.classList.contains('delete-btn')) {
          console.log('Delete button clicked for ID:', params.data.id);
          this.couponService.deleteCoupon(params.data.id).subscribe((res) => {
            console.log('Coupon deleted successfully:', res);
          });
        }
      }
    }


  ];

  gridOptions: GridOptions = {
    theme: 'legacy',
    pagination: true,
    paginationPageSize: this.paginationPageSize,
    paginationPageSizeSelector: this.paginationPageSizeSelector,
    rowModelType: 'clientSide',
    domLayout: 'autoHeight',
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true
    },
    rowHeight: 62,
    onGridReady: (params) => {
      params.api.sizeColumnsToFit();
    },
    onFirstDataRendered: (params) => {
      params.api.sizeColumnsToFit();
    }
  };

  modules: Module[] = [ClientSideRowModelModule];
  rowSelection: 'multiple' | 'single' = 'multiple';

  hasNextPage = false;
  hasPreviousPage = false;
  rowData: any;
  constructor(private couponService: CouponService,
               private route: ActivatedRoute,
               private businessService: BusinessService,
               private sanitizer: DomSanitizer
              ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.businessId = +id;
        this.loadCoupons();
      } else {
        console.error('Error: Missing business ID in route.');
      }
    });
  }

  loadCoupons(): void {
    if (this.businessId !== null) {
      this.couponService.getAllCoupons(this.businessId).subscribe(
        (data) => {
          console.log('Coupons Data:', data);
          this.allCoupons = data;
          this.updatePagination();
        },
        (error) => {
          console.error('Error fetching coupons:', error);
        }
      );
    }
  }

  updatePagination(): void {
    const totalItems = this.allCoupons.length;
    this.totalPages = Math.ceil(totalItems / this.paginationPageSize);
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;

    // Display the coupons for the current page
    const startIndex = (this.currentPage - 1) * this.paginationPageSize;
    const endIndex = startIndex + this.paginationPageSize;
    this.displayedCoupons = this.allCoupons.slice(startIndex, endIndex);
  }

  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to the first page
    this.updatePagination();
  }

  onNextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.updatePagination();
    } else {
      console.log("Next page button error");
    }
  }

  onPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  onPaginationChanged(): void {
    this.updatePagination();
  }

  ngAfterViewInit(): void {
    // No longer need to check for gridOptions.api here
    console.log('Grid API not used here anymore');
  }


  onGridReady(params: GridReadyEvent) {
    if (this.rowData.length > 0) {
      params.api.setGridOption('rowData', this.rowData);
    }
  }

  onReportButtonClick() {
    this.isReportButtonClicked = true;
    this.currentReportType = '';
  }

  onReportTypeChange(selectedReportType?: "coupon"  | "expired_coupon" | "sale_coupon_weekly" | "sale_coupon_monthly" | "sale_coupon") {
    if (!this.currentParentReportType) {
      this.currentParentReportType = 'coupon';
    }

    if (selectedReportType) {
      this.currentReportType = selectedReportType;

      // If the report type is 'sale_coupon', ensure both dates are selected
      if (this.currentReportType === 'sale_coupon' && (!this.startDate || !this.endDate)) {
        console.log("Please select start and end dates before generating the report.");
        return; // Prevent report generation
      }

      this.generateReport('pdf', this.currentReportType, this.businessId);
    }
  }

  clearDates() {
    this.startDate = null;
    this.endDate = null;
    this.onDateChange();
  }

  onDateChange() {
    if (this.currentReportType) {
      this.generateReport('pdf', this.currentReportType, this.businessId);
    }
  }

  generateReport(
    type: 'pdf' | 'excel',
    reportType: 'coupon' | 'remain_coupon'  |'expired_coupon'| 'sale_coupon_weekly' | 'sale_coupon_monthly' |'sale_coupon',
    businessId: number = this.businessId
  ) {
    this.loading = true;
    this.error = null;
    this.showPreview = false;

    let service;
    switch (reportType) {
      case 'coupon':
        service = this.businessService.couponReport.bind(this.businessService);
        break;

        case 'expired_coupon':
        service = this.businessService.expiredCouponReport.bind(this.businessService);
        break;
        case 'sale_coupon_weekly':
          service = this.businessService.saleCouponReportForWeekly.bind(this.businessService);
          break;
        case 'sale_coupon_monthly':
          service = this.businessService.saleCouponReportForMonthly.bind(this.businessService);
          break;
          case 'sale_coupon':
        service = this.businessService.saleCouponReport.bind(this.businessService);
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

    // Request the report from the service
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

  downloadReport(type: 'pdf' | 'excel', businessId: number = this.businessId) {
    this.loading = true;
    this.error = null;

    let service;
    switch (this.currentReportType) {
      case 'coupon':
        service = this.businessService.couponReport.bind(this.businessService);
        break;
        case 'expired_coupon':
        service = this.businessService.expiredCouponReport.bind(this.businessService);
        break;
        case 'sale_coupon_weekly':
          service = this.businessService.saleCouponReportForWeekly.bind(this.businessService);
          break;
        case 'sale_coupon_monthly':
          service = this.businessService.saleCouponReportForMonthly.bind(this.businessService);
          break;
          case 'sale_coupon':
        service = this.businessService.saleCouponReport.bind(this.businessService);
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

    // Request the report
    service(type, businessId,params).subscribe({
      next: (data: Blob) => {
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        const extension = type === 'pdf' ? 'pdf' : 'xlsx';

        // Create download link for the report
        link.href = url;
        link.download = `coupon_report_${businessId}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke object URL after download
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


  togglePreview() {
    this.showPreview = !this.showPreview;
  }
}
