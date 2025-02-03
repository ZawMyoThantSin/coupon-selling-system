import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../storage.service';
import { Coupon } from '../../models/coupon.modal';
import { getDefaultAppConfig } from '../../models/appConfig';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  BASE_URL = `${getDefaultAppConfig().backendHost}/`;
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

  getAllCoupons(id:any):Observable<Coupon[]>{
    return this.http.get<Coupon[]>(this.BASE_URL +'api/coupon/b/'+id,{

      responseType:'json'
    })
  }

  increaseViewCount(id:any):Observable<boolean>{
    return this.http.get<boolean>(this.BASE_URL +'api/coupon/view/'+id,{
      responseType:'json'
    })
  }

  getAllUserCoupons():Observable<Coupon[]>{
    return this.http.get<Coupon[]>(this.BASE_URL +'public/coupons',{
      // headers:this.createAuthHeader(),
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

  deleteCoupon(id:number):Observable<any>{
    return this.http.delete(`${this.BASE_URL}api/coupon/${id}`,{
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
  getUsedCoupon(shopId:number | null):Observable<any>{
    return this.http.get(`${this.BASE_URL}api/coupon/usages/${shopId}`,{
      headers:this.createAuthHeader(),
      responseType:'json'
    })
  }
}
