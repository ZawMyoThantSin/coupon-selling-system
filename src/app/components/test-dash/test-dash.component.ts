import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, interval } from 'rxjs';

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

interface NavItem {
  name: string;
  icon: string;
  href: string;
}

@Component({
  selector: 'app-test-dash',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './test-dash.component.html',
  styleUrl: './test-dash.component.scss'
})
export class TestDashComponent{
  payments = [
    {
      id: 1,
      businessOwner: 'John Doe',
      totalEarnings: 1000,
      remainingBalance: 400,
      lastPaymentDate: '2025-01-10',
    },
    {
      id: 2,
      businessOwner: 'Jane Smith',
      totalEarnings: 1500,
      remainingBalance: 600,
      lastPaymentDate: '2025-01-12',
    },
    {
      id: 3,
      businessOwner: 'Robert Brown',
      totalEarnings: 1200,
      remainingBalance: 0,
      lastPaymentDate: '2025-01-08',
    },
  ];

  viewDetails(record: any): void {
    alert(`Details for ${record.businessOwner}`);
  }

  makePayment(record: any): void {
    alert(`Processing payment for ${record.businessOwner}`);
  }
}
