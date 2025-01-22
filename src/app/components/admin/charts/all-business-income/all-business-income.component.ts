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
      <p class="no-data-message" *ngIf="chartOptions.series[0].data.length === 0">No data available to display for this business.</p>
    </div>

  `,
  styles: [`
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
  `]
})
export class AllBusinessImcome implements OnInit {
  @ViewChild("chart") chart: ChartComponent | undefined;
  businessId: number | null = null;
  public chartOptions: ChartOptions;

  constructor(
    private purchaseCouponService: PurchaseCouponService,
    private cdr: ChangeDetectorRef  // Inject ChangeDetectorRef
  ) {
    this.chartOptions = this.getInitialChartOptions();
  }

  ngOnInit() {
    this.loadBusinessEarningsData();  // Ensure the data is loaded when component initializes
  }

  private getInitialChartOptions(): ChartOptions {
    return {
      series: [{ name: "Earnings", data: [] }],
      chart: {
        height: 350,
        type: "line", // Ensure it's a line chart
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
}
