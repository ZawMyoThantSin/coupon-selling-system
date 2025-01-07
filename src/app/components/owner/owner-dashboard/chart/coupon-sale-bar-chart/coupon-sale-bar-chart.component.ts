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
  <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 text-gray-800">Dashboard</h1>
        <button class="btn btn-primary">
          Generate Report
        </button>
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

  `,
  styles: [`
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
  @Input() businessId: number=36;
  public chartOptions: ChartOptions;
  public view: 'daily' | 'monthly' = 'daily'; // Default to daily view

  constructor(private businessService: BusinessService) {
    this.chartOptions = this.getInitialChartOptions();
  }

  ngOnInit() {
    this.loadDailyCouponSalesData();
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
}
