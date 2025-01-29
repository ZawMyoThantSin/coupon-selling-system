import { Component, Input, ViewChild } from '@angular/core';
import { ChartComponent } from "ng-apexcharts";
import { BusinessService } from '../../../../../services/business/business.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexTooltip,
  ApexResponsive,
  ApexAnnotations
} from "ng-apexcharts";
import { PurchaseCouponService } from '../../../../../services/purchase-coupon/purchase-coupon.service';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';
import { MdbModalService } from 'mdb-angular-ui-kit/modal';
import { PaymentHistoryModalComponent } from '../../../../admin/business/business-income/payment-history-modal/payment-history-modal.component';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
  annotations: ApexAnnotations;
};

@Component({
  selector: 'app-bar-chart-for-coupon',
  standalone: true,
  imports: [ NgApexchartsModule,
    CommonModule],
  template: `
  <!-- Page Heading -->
<div *ngIf="businessId">
<div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 text-gray-800">Dashboard</h1>
        <button class="btn btn-primary">
          Generate Report
        </button>
</div>
<div class="row">
      <!-- Monthly Earnings Card -->
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm border-left-primary">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col">
                <div class="text-primary text-uppercase font-weight-bold small">
                  Earnings (Monthly)
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{currentMonthEarning | number:'1.0-0'}} MMK
                </div>
              </div>
              <div class="col-auto">
                <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#DDDFEB"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg>

              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Annual Earnings Card -->
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm border-left-success">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col">
                <div class="text-success text-uppercase font-weight-bold small">
                  Earnings (Annual)
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{currentYearEarning | number:'1.0-0'}} MMK
                </div>
              </div>
              <div class="col-auto">
                <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#DDDFEB"><path d="M444-200h70v-50q50-9 86-39t36-89q0-42-24-77t-96-61q-60-20-83-35t-23-41q0-26 18.5-41t53.5-15q32 0 50 15.5t26 38.5l64-26q-11-35-40.5-61T516-710v-50h-70v50q-50 11-78 44t-28 74q0 47 27.5 76t86.5 50q63 23 87.5 41t24.5 47q0 33-23.5 48.5T486-314q-33 0-58.5-20.5T390-396l-66 26q14 48 43.5 77.5T444-252v52Zm36 120q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- New Amount to Receive Card -->
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm border-left-warning">
          <div class="card-body">
            <div class="row align-items-center">
          <div class="col">
            <div class="text-warning text-uppercase font-weight-bold small">
              Upcoming Amount
            </div>
          <div class="h5 mb-0 font-weight-bold text-gray-800 d-flex align-items-center">

          <div class="h5 mb-0 font-weight-bold text-gray-800" *ngIf="amountToPay && amountToPay > 0">
            <span>{{ amountToPay - (amountToPay * desiredPercentage) / 100 | number: '1.0-0' }} MMK
            </span>
            <strong class="text-decoration-line-through text-gray-400 extra-small">
              {{ amountToPay | number: '1.0-0' }}
            </strong>
            <span class="badge bg-warning text-dark">
              {{ desiredPercentage }}%
            </span>
          </div>

          <div class="h5 mb-0 font-weight-bold text-gray-800" *ngIf="!amountToPay && amountToPay == 0">
            <span>{{ amountToPay - (amountToPay * desiredPercentage) / 100 | number: '1.0-0' }} MMK
            </span>
          </div>

        </div>


        </div>
        <div class="col-auto">
          <svg xmlns="http://www.w3.org/2000/svg"
          height="40px"
          viewBox="0 -960 960 960"
          width="40px"
          fill="#FFC107"
          (click)="openPaymentHistoryModal(business)"
          style="cursor: pointer;"
          >
            <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm-40-200h80v-40h-80v40Zm0-80h80v-240h-80v240Z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</div>


    </div>
    <div class="chart-container">
  <div class="toggle-buttons">
    <button (click)="loadDailyCouponSalesData()" [class.active]="view === 'daily'">Daily</button>
    <button (click)="loadMonthlyCouponSalesData()" [class.active]="view === 'monthly'">Monthly</button>
  </div>
  <div *ngIf="chartOptions.series[0].data.length > 0">
    <apx-chart
      [series]="chartOptions.series"
      [chart]="chartOptions.chart"
      [xaxis]="chartOptions.xaxis"
      [dataLabels]="chartOptions.dataLabels"
      [grid]="chartOptions.grid"
      [stroke]="chartOptions.stroke"
      [title]="chartOptions.title"
      [tooltip]="chartOptions.tooltip"
      [responsive]="chartOptions.responsive"
      [annotations]="chartOptions.annotations"
    ></apx-chart>
  </div>
  <p class="no-data-message" *ngIf="chartOptions.series[0].data.length === 0">No data available to display for this business.</p>
</div>
</div>

  `,
  styles: [`

.card {
  border-radius: 8px;
  border-width: 2px;
  background: #ffffff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  &.border-left-primary {
    border-left: 4px solid #4e73df;
  }

  &.border-left-success {
    border-left: 4px solid #1cc88a;
  }

  &.border-left-warning {
    border-left: 4px solid #FFC107;
  }
}

.text-primary {
  color: #4e73df !important;
}

.text-success {
  color: #1cc88a !important;
}

.text-warning {
  color: #FFC107 !important;
}

.text-gray-400 {
  color: #d1d3e2 !important;
  text-decoration: line-through;
}

.text-gray-800 {
  color: #5a5c69 !important;
}

.small {
  font-size: 0.95rem; /* Smaller font size for crossed-out amount */
}

.extra-small {
  font-size: 0.95rem;
}

.medium {
  font-size: 1.145rem; /* Smaller font size for crossed-out amount */
}

.badge {
  font-size: 0.75rem; /* Smaller font size for percentage badge */
  padding: 0.25rem 0.5rem; /* Compact padding */
  border-radius: 12px; /* Rounded corners */
  background-color: #FFC107; /* Warning color */
  color: #000; /* Dark text for contrast */
  font-weight: 600; /* Bold text */
}

.d-flex.align-items-baseline {
  align-items: baseline; /* Align text and badge properly */
}


    .chart-container {
      max-width: 50%;
  margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px; /* Reduced corner radius */
      box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
      overflow: hidden;

    }
    .no-data-message {
      text-align: center;
      color: #888;
      font-style: italic;
      font-size: 16px;
      margin-top: 30px;
    }
    .toggle-buttons {
      display: flex;

      gap: 10px;
      margin-top: 20px;
      margin-left: 20px;
      margin-bottom: 20px;
    }
    .toggle-buttons button {
  padding: 8px 12px; /* Reduced padding */
  border: none;
  border-radius: 8px;
  font-size: 12px; /* Reduced font size */
  background: linear-gradient(145deg,rgb(110, 113, 116),rgb(110, 113, 116));
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase; /* Optional for emphasis */
}
    .toggle-buttons button.active {
      background: linear-gradient(145deg,rgb(23, 223, 245), #007bbf);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }

  `]
})
export class CouponSaleBarChartComponent {
  @ViewChild("chart") chart: ChartComponent | undefined;
  currentMonthEarning:number = 0;
  currentYearEarning:number = 0;
  businessId: number | null = null;
  public chartOptions: ChartOptions;
  public view: 'daily' | 'monthly' = 'daily'; // Default to daily view
  amountToPay: number = 0;
  lastPaidAmount: number = 0;
  desiredPercentage: number = 0;
  business: any;

  constructor(private businessService: BusinessService,
    private saleCouponService: PurchaseCouponService,
    private websocketService: WebsocketService,
    private modalService: MdbModalService
  ) {
    this.chartOptions = this.getInitialChartOptions();
  }

  ngOnInit() {
    this.businessService.businessId$.subscribe((id) => {
      this.businessId = id;
      if (this.businessId) {
        // Fetch business details using getById
        this.businessService.getById(this.businessId).subscribe((business) => {
          this.business = business; // Assign the fetched business details
        });

        this.loadDailyCouponSalesData();
        this.getMonthlyAndYearlyEarning(this.businessId);
        this.getAmountToPay(this.businessId);
      }
    });

    this.websocketService.onMessage().subscribe((message) => {
      // console.log("MSG",message );
      if(typeof(message) == 'number'){
        this.desiredPercentage = message;
      }

    });
  }


  getMonthlyAndYearlyEarning(businessId:number){
    this.saleCouponService.getCurrentMonthEarnings(businessId).subscribe((res)=>{
      this.currentMonthEarning= res;
    })

    this.saleCouponService.getCurrentYearEarnings(businessId).subscribe((res)=>{
      this.currentYearEarning = res;
    })
  }

  getAmountToPay(businessId: number) {
    this.businessService.getPaidHistory(businessId).subscribe((history) => {
      if (history && history.length > 0) {
        this.desiredPercentage = history[0].desiredPercentage || 15;
      }
    });

    this.businessService.calculateAmountToPay(businessId).subscribe((res) => {
      this.amountToPay = res;
    });
  }


  private getInitialChartOptions(): ChartOptions {
    return {
      series: [{ name: "Orders Count", data: [] }],
      chart: {
        height: 350,
        type: "bar",
        fontFamily: 'Arial, sans-serif',
        toolbar: { show: false }
      },
      title: { text: "", align: 'center', style: { fontSize: '18px', fontWeight: 'bold', color: '#333' } },
      xaxis: { categories: [], title: { text: '', style: { fontSize: '14px', color: '#666' } } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      grid: { row: { colors: ["#fff", "#f2f2f2"] } },
      tooltip: { y: { formatter: (val) => `${val} coupons sold` } },
      responsive: [{ breakpoint: 480, options: { chart: { width: '100%' }, legend: { position: 'bottom' } } }],
      annotations: { points: [] }
    };
  }

  private getHighestSalesDay(data: number[]): number {
    return data.indexOf(Math.max(...data));
  }

  loadDailyCouponSalesData() {
    this.view = 'daily';

    // Dynamically calculate 'today'
    const today = new Date().toISOString().split('T')[0];

    this.businessService.getCouponSalesData(this.businessId).subscribe(
      (data: { businessId: number; soldCount: number; buyDate: string }[]) => {
        console.log("DATA: ",data)
        const businessData = data.filter(item => item.businessId === this.businessId);

        if (businessData?.length > 0) {
          // Filter dates up to and including today
          const filteredData = businessData.filter(
            item => new Date(item.buyDate).toISOString().split('T')[0] <= today
          );

          // Extract unique dates and ensure they're sorted
          const uniqueDates = Array.from(
            new Set(filteredData.map(item => new Date(item.buyDate).toISOString().split('T')[0]))
          ).sort();

          // Ensure the final date is always today, and take the last 5 dates
          if (!uniqueDates.includes(today)) {
            uniqueDates.push(today);
          }

          const last5Dates = uniqueDates.slice(-5);
          const salesData = last5Dates.map(date => ({ date, soldCount: 0 }));

          // Populate sales data
          filteredData.forEach(item => {
            const buyDate = new Date(item.buyDate).toISOString().split('T')[0];
            const dateEntry = salesData.find(entry => entry.date === buyDate);
            if (dateEntry) dateEntry.soldCount += item.soldCount;
          });

          // Update chart with the calculated data
          const soldCounts = salesData.map(entry => entry.soldCount);
          const highestIndex = this.getHighestSalesDay(soldCounts);

          this.updateChartOptions(
            salesData.map(entry => entry.date),
            soldCounts,
            highestIndex,
            `Daily Coupon Sales`
          );
        } else {
          this.clearChart();
        }
      },
      error => this.clearChart()
    );
  }



  loadMonthlyCouponSalesData() {
    this.view = 'monthly';
    this.businessService.getCouponSalesData(this.businessId).subscribe(
      (data: { businessId: number; soldCount: number; buyDate: string }[]) => {
        const businessData = data.filter(item => item.businessId === this.businessId);
        if (businessData?.length > 0) {
          const monthlyData = businessData.reduce((acc, item) => {
            const month = new Date(item.buyDate).toISOString().slice(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + item.soldCount;
            return acc;
          }, {} as Record<string, number>);
          const months = Object.keys(monthlyData).sort();
          const soldCounts = months.map(month => monthlyData[month]);
          const highestIndex = this.getHighestSalesDay(soldCounts);
          this.updateChartOptions(months, soldCounts, highestIndex, `Monthly Coupon Sales`);
        } else this.clearChart();
      },
      error => this.clearChart()
    );
  }

  private updateChartOptions(categories: string[], data: number[], highestIndex: number, title: string) {
    const barColor = this.view === 'daily' ? '#007bff' : '#007bff'; // Blue for daily, green for monthly
    this.chartOptions.series = [
      {
        name: "Coupons Sold",
        data,
        color: barColor // Set bar color dynamically
      }
    ];
    this.chartOptions.xaxis = {
      categories,
      title: {
        text: this.view === 'daily' ? 'Date' : 'Month',
        style: { fontSize: '14px', color: '#666' }
      }
    };
    this.chartOptions.title.text = title;
    this.chartOptions.annotations = {
      points: [
        {
          x: categories[highestIndex],
          seriesIndex: 0,
          label: {
            borderColor: '#FF5733',
            offsetY: 0,
            style: { color: '#fff', background: '#FF5733' },
            text: `${categories[highestIndex]} is the best-selling ${this.view}!`
          }
        }
      ]
    };
    this.updateChart();
  }


  private updateChart() {
    if (this.chart) {
      this.chart.updateOptions(this.chartOptions);
    }
  }

  private clearChart() {
    this.chartOptions.series = [{ name: "Coupons Sold", data: [] }];
    this.chartOptions.annotations = { points: [] };
    this.updateChart();
  }

  openPaymentHistoryModal(business: any): void {
    console.log("Business ID ", business.id);
    console.log("Business Name ", business.name);
    this.modalService.open(PaymentHistoryModalComponent, {
      modalClass: 'modal-lg',
      data: { businessId: business.id, businessName: business.name },
    });
  }

}
