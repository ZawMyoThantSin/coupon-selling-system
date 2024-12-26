import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentData: any;


  BASE_URL = "http://localhost:8080/api";
  constructor(private http: HttpClient) { }

  addPaymentMethod(data:any):Observable<any>{
    return this.http.post(`${this.BASE_URL}/payment/create`, data);
  }

  updatePaymentMethod(id:number,data:any):Observable<any>{
    return this.http.post(`${this.BASE_URL}/payment/update/${id}`, data);
  }

  getAllPayments(): Observable<any>{
    return this.http.get(`${this.BASE_URL}/payment/all`);
  }

  getImageUrl(imagePath: string): string {
    return `http://localhost:8080/public/payments/qr/${imagePath}`;
  }

  setPaymentTempData(payment: any) {
    this.paymentData = payment;
  }

  getPaymentTempData() {
    return this.paymentData;
  }
}
