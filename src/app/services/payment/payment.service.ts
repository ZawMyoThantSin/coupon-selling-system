import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getDefaultAppConfig } from '../../models/appConfig';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private paymentData: any;


  BASE_URL = `${getDefaultAppConfig().backendHost}/api`;
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
    return `${getDefaultAppConfig().backendHost}/public/payments/qr/${imagePath}`;
  }

  setPaymentTempData(payment: any) {
    this.paymentData = payment;
  }

  getPaymentTempData() {
    return this.paymentData;
  }

  getAllPaymentsCount(): Observable<any>{
    return this.http.get(`${this.BASE_URL}/payment/count`);
  }
}
