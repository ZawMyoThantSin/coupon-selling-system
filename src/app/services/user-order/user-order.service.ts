import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Observable } from 'rxjs';
import { UserPayment } from '../../models/userpayment';

@Injectable({
  providedIn: 'root'
})
export class UserOrderService {
  BASE_URL = "http://localhost:8080/";
  public token: any;
  constructor(private http: HttpClient, private storageService: StorageService) {
      this.token = this.storageService.getItem("token");
    }
  getPaymentMethods(): Observable<UserPayment[]> {
   return this.http.get<UserPayment[]>(this.BASE_URL + 'api/payment/all', {
        responseType: 'json'
      });
  }

  submitOrder(orderData: FormData): Observable<any> {
    return this.http.post<any>(this.BASE_URL + 'api/orders', orderData, {
      reportProgress: true,
      observe: 'events'
    });
}

}