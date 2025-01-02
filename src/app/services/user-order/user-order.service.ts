import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Observable } from 'rxjs';
import { UserPayment } from '../../models/userpayment';
import { userOrder } from '../../models/user-order';

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
<<<<<<< HEAD
=======
  
  // submitOrder(orderData: any): Observable<any> {
  //   console.log('Order data received in service:', orderData);
  //   return this.http.post<any>(this.BASE_URL + 'api/orders', orderData, {
  //     responseType: 'json'
  //   });
  // }
>>>>>>> e6f3b6e7481294316517509dff12eab6f1b73c40

  submitOrder(orderData: FormData): Observable<any> {
    return this.http.post<any>(this.BASE_URL + 'api/orders', orderData, {
      reportProgress: true,
      observe: 'events'
    });
<<<<<<< HEAD
=======
}

>>>>>>> e6f3b6e7481294316517509dff12eab6f1b73c40
}

}