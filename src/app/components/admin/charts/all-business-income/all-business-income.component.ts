import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { ChartComponent } from 'ng-apexcharts'; // Import ApexChart Component

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
import { PurchaseCouponService } from '../../../../services/purchase-coupon/purchase-coupon.service';
import { UserOrderService } from '../../../../services/user-order/user-order.service';
import { Router } from '@angular/router';

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
  selector: 'app-line-chart',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  template: `
  <div class="dashboard-container">
  <!-- Cards Section -->
  <div class="card-container">
    <div class="card">
      <div class="card-icon">
        <i class="fas fa-briefcase text-dark"></i> <!-- Icon for Total Businesses -->
      </div>
      <h3>Total Businesses</h3>
      <p>{{ totalBusinesses || 0 }}</p>
    </div>
    <div class="card">
      <div class="card-icon">
        <i class="fas fa-users text-dark"></i> <!-- Icon for Total User Count -->
      </div>
      <h3>Total User Count</h3>
      <p>{{ totalUsers || 0 }}</p>
    </div>
    <div class="card">
      <div class="card-icon">
      <svg xmlns="http://www.w3.org/2000/svg" class="me-2" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000000"><path d="M880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720Zm-720 80h640v-80H160v80Zm0 160v240h640v-240H160Zm0 240v-480 480Z"/></svg>
      </div>
      <h3>Payment Method</h3>
      <p>{{  0 }}</p>
    </div>
    <div class="card" (click)="orderPage()">
      <div class="card-icon">
        <i class="fas fa-shopping-cart text-dark"></i> <!-- Icon for Pending Orders -->
      </div>
      <h3>New Orders</h3>
      <p>{{ newOrders || 0 }}</p>
    </div>
  </div>

  <!-- Charts Section -->
  <div class="chart-section">
    <div class="chart-container">
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
      <p class="no-data-message" *ngIf="chartOptions.series[0].data.length === 0">
        No data available to display for this business.
      </p>
    </div>

    <!-- Completed Orders Chart -->
    <div class="chart-container">
      <apx-chart
        [series]="completedOrderChart.series"
        [chart]="completedOrderChart.chart"
        [labels]="completedOrderChart.labels"
        [title]="completedOrderChart.title"
        [plotOptions]="completedOrderChart.plotOptions"
        [tooltip]="completedOrderChart.tooltip"
      ></apx-chart>
      <div class="completed-order-info">
        <p><strong>Total Orders:</strong> {{ totalOrders || 0 }}</p>
        <p><strong>Completed Orders:</strong> {{ totalOrders - pendingOrders || 0 }}</p>
        <p><strong>Pending Orders:</strong> {{ pendingOrders || 0 }}</p>
      </div>
    </div>


  </div>
</div>

  `,
  styles: [`
   .dashboard-container {
  display: flex;
  flex-direction: column;
  height: 95vh; /* Nearly full-screen height */
  margin: 0 auto;
  padding: 10px;
  max-width: 1200px;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.card {
  background-color: #f9f9f9;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.card h3 {
  margin: 10px 0 5px;
  font-size: 18px;
  color: #333;
}

.card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.card-icon {
  font-size: 36px;
  color: #007bff;
  margin-bottom: 10px;
}

.chart-section {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two charts side by side on wide screens */
  gap: 20px;
}

@media (max-width: 768px) {
  .chart-section {
    grid-template-columns: 1fr; /* Stack charts vertically on narrow screens */
  }
}

    .chart-container {
      width: 100%;
      max-width: 800px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
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

    .apexcharts-tooltip {
  background-color: #3498db !important; /* Custom background color */
  color: #fff !important; /* Custom text color */
  border-radius: 8px !important; /* Rounded corners */
  padding: 10px !important; /* Add padding */
}

  `]
})
export class AllBusinessImcome implements OnInit {
  totalBusinesses: number = 123;
  totalUsers: number = 4567;
  pendingOrders: number = 0;
  totalOrders: number = 0;
  completedOrder: number = 0;
  newOrders: number = 0;

  public completedOrderChart: any;
  @ViewChild("chart") chart: ChartComponent | undefined;
  businessId: number | null = null;
  public chartOptions: ChartOptions;

  constructor(
    private router: Router,
    private purchaseCouponService: PurchaseCouponService,
    private orderService: UserOrderService,
    private cdr: ChangeDetectorRef  // Inject ChangeDetectorRef
  ) {
    this.chartOptions = this.getInitialChartOptions();
    this.completedOrderChart = this.getCompletedOrderChartOptions();
  }

  ngOnInit() {
    this.loadBusinessEarningsData();  // Ensure the data is loaded when component initializes
    this.loadOrderStatus();
  }


  private getInitialChartOptions(): ChartOptions {
    return {
      series: [{ name: "Earnings", data: [] }],
      chart: {
        height: 350,
        type: "area", // Ensure it's a line chart
        fontFamily: 'Arial, sans-serif',
        toolbar: { show: false }
      },
      title: { text: "Business Earnings", align: 'center', style: { fontSize: '18px', fontWeight: 'bold', color: '#333' } },
      xaxis: { categories: [], title: { text: 'Business Name', style: { fontSize: '14px', color: '#666' } } },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      grid: { row: { colors: ["#fff", "#f2f2f2"] } },
      tooltip: { y: { formatter: (val) => `${val} MMK` } },
      responsive: [{ breakpoint: 480, options: { chart: { width: '100%' }, legend: { position: 'bottom' } } }],
      annotations: { points: [] }
    };
  }

  loadOrderStatus(): void {
    this.orderService.getOrderStatus().subscribe((data) => {
      this.newOrders = data.todayOrders;
      this.completedOrder = data.completeOrders;
      this.pendingOrders = data.pendingOrders;
      this.totalOrders = this.completedOrder + this.pendingOrders;

      // Update chart options after data is loaded
      this.completedOrderChart = this.getCompletedOrderChartOptions();
    });
  }

  private getCompletedOrderChartOptions() {
    return {
      series: [Math.round((this.completedOrder / this.totalOrders) * 100) || 0], // Completed percentage
      chart: {
        height: 350,
        type: "radialBar",
      },
      labels: ["Completed Orders"],
      title: {
        text: "Completed Order Percentage",
        align: "center",
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              show: true,
            },
            value: {
              show: true,
              formatter: (val: number) => `${val}%`, // Show percentage
            },
            total: {
              show: true,
              label: "Completed Orders",
              formatter: () =>
                `${Math.round((this.completedOrder / this.totalOrders) * 100) || 0}%`, // Show total percentage
            },
          },
        },
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) =>
            `${this.completedOrder} Orders`, // Show completed orders count
        },
        theme: "dark", // Dark theme for tooltip
      },
    };
  }

  loadBusinessEarningsData() {
    const retrievalDate = new Date().toLocaleDateString(); // Get the current date in a readable format
    this.purchaseCouponService.getEarnings().subscribe(
      (data: { businessName: string, totalEarnings: number }[]) => {
        console.log('Fetched earnings data:', data);  // Log the fetched data
        const businessNames = data.map(item => item.businessName);
        const earnings = data.map(item => item.totalEarnings);

        // Update chart data with fetched earnings and add the retrieval date
        this.updateChartOptions(businessNames, earnings, retrievalDate);
      },
      error => {
        console.error('Error fetching data', error);
        this.clearChart();  // Clear the chart if there is an error
      }
    );
  }

  private updateChartOptions(categories: string[], data: number[], retrievalDate: string) {
    console.log('Updating chart options:', { categories, data });  // Add log here
    this.chartOptions.series = [
      {
        name: "Earnings",
        data
      }
    ];
    this.chartOptions.xaxis = {
      categories,
      title: { text: 'Business Name', style: { fontSize: '14px', color: '#666' } }
    };
    this.chartOptions.title.text = `Business Earnings Over Time (Last updated: ${retrievalDate})`;  // Add the date to the title
    this.updateChart();
  }


  private updateChart() {
    if (this.chart) {
      console.log('Updating chart with options:', this.chartOptions);  // Log the update
      this.chart.updateOptions(this.chartOptions);
      this.cdr.detectChanges();  // Trigger change detection
    }
  }

  private clearChart() {
    this.chartOptions.series = [{ name: "Earnings", data: [] }];
    this.updateChart();
  }

  orderPage(): void{
    this.router.navigate(['/d/order']);
  }
}
