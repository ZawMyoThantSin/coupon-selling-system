import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../../../services/payment/payment.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { privateDecrypt } from 'crypto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule,NgxPaginationModule],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.css'
})
export class PaymentListComponent implements OnInit {
  paymentList:any[] =[];


  constructor(private paymentService: PaymentService,
              private router: Router
  ) {}

  ngOnInit(): void {
    this.paymentService.getAllPayments().subscribe((res)=>{
      this.paymentList = res
    }, e => console.log("Error in fetching Payments", e));
  }
  currentPage = 1;
  itemsPerPage = 4;

  editPayment(payment: any) {
    // Store the payment data in the service
    this.paymentService.setPaymentTempData(payment);
    this.router.navigate(['d/payments/edit']);
  }

  getImageUrl(imagePath: string): string {
    return this.paymentService.getImageUrl(imagePath);
  }
}
