import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  BASE_URL = "http://localhost:8080/";
  public token: any;

  constructor(private http:HttpClient,private storageService:StorageService) {
    this.token = this.storageService.getItem("token");
  }


  getAllBusiness(id: number):Observable<any>{
    return this.http.get(this.BASE_URL +'api/businesses/user/'+id,{
      responseType:'json'
    })
  }

  getByUserId(id: number):Observable<any>{
    return this.http.get(this.BASE_URL +'api/businesses/user/'+id,{
      responseType:'json'
    })
  }

  getById(id:number):Observable<any>{
    return this.http.get(`${this.BASE_URL}api/businesses/${id}`,{
      responseType:'json'
    })
  }

  addBusinessOwner(data:any): Observable<any>{
    return this.http.post(this.BASE_URL+'api/businesses/add/owner',data,{
      responseType:'json'
    });
  }

  createBusiness(data:any): Observable<any>{
    return this.http.post(this.BASE_URL+'api/businesses',data,{
      // responseType:'json'
    });
  }

  getBusinessCount(): Observable<number> {
    return this.http.get<number>(`${this.BASE_URL}api/businesses/count`, {
      responseType: 'json'
    });
  }

  getCouponSalesData(businessId : number): Observable<{ businessId: number, soldCount: number, buyDate: string }[]> {
    return this.http.get<{ businessId: number, soldCount: number, buyDate: string }[]>(
      `${this.BASE_URL}api/sale-coupon/coupon-sales/${businessId}`,
      {
        responseType: 'json'
      }
    );
  }
// get business images
getImageUrl(imagePath: string): string {

  return `http://localhost:8080/public/businesses/images/${imagePath}`;
}

getAllBusinesses(): Observable<any> {
  return this.http.get(`${this.BASE_URL}api/businesses`, {
    responseType: 'json',
  });
}

// Update an existing product by ID
update(id: number, data: any): Observable<any> {

  return this.http.put(`${this.BASE_URL}api/businesses/${id}`, data, {
    responseType: 'json'
  });
}

}
