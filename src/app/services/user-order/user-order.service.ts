import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserPayment } from '../../models/userpayment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage.service';
@Injectable({
  providedIn: 'root'
})
export class UserOrderService {
  BASE_URL = "http://localhost:8080/";
  public token: any;
  constructor(private http: HttpClient, private storageService: StorageService) {
      this.token = this.storageService.getItem("token");
    }
  // This method simulates fetching payment methods from an API
  getPaymentMethods(): Observable<UserPayment[]> {
    // const paymentMethods: UserPayment[] = [
    //   {  paymentType: 'Kpay', qrPhoto: '/images/product/kpay-qr.jpg', accountName: 'John Doe', accountNumber: '+1234567890' },
    //   {  paymentType: 'Wavepay', qrPhoto: '/images/product/wave-qr.jpg',accountName: 'Jane Smith',accountNumber: '+0987654321'},
    // ];
   // return of(paymentMethods); // Simulating an Observable returned from an HTTP request
   return this.http.get<UserPayment[]>(this.BASE_URL + 'api/payment/all', {
        responseType: 'json'
      });
  }
}
