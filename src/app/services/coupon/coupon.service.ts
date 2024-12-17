import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  BASE_URL = "http://localhost:8080/";
  public token: any;

  constructor(private http:HttpClient,
              private storageService:StorageService) {
    this.token = this.storageService.getItem("token");
  }

  private createAuthHeader(): any{

    if(this.token){
      console.log('Token found in storage..', this.token);
      return new HttpHeaders().set(
        "Authorization", "Bearer "+ this.token
      )
    }else{
      console.log("Not Found!");
    }
    return null;
  }

  getAllCoupons():Observable<any>{
    return this.http.get(this.BASE_URL +'api/coupon',{
      headers:this.createAuthHeader(),
      responseType:'json'
    })
  }

  getById(id:number):Observable<any>{
    return this.http.get(`${this.BASE_URL}api/coupon/${id}`,{
      headers:this.createAuthHeader(),
      responseType:'json'
    })
  }

  getCaculate(id:number):Observable<any>{
    return this.http.get(`${this.BASE_URL}api/coupon/calculate/${id}`,{
      headers:this.createAuthHeader(),
      responseType:'json'
    })
  }

  createCoupon(data:any): Observable<any>{
    const header = new HttpHeaders({'Content-Type':'application/json'})

    return this.http.post(this.BASE_URL+'api/coupon',data,{
      headers:this.createAuthHeader(),
      responseType:'json'
    });
  }
}
