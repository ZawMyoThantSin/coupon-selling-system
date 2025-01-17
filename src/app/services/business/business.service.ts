import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { getDefaultAppConfig } from '../../models/appConfig';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private businessIdSource = new BehaviorSubject<number | null>(null);
  businessId$ = this.businessIdSource.asObservable();

  updateBusinessId(id: number): void {
    this.businessIdSource.next(id);
  }
  BASE_URL = getDefaultAppConfig().backendHost;
  public token: any;

  constructor(private http:HttpClient,private storageService:StorageService) {
    this.token = this.storageService.getItem("token");
  }


  getAllBusiness(id: number):Observable<any>{
    return this.http.get(this.BASE_URL +'/api/businesses/user/'+id,{
      responseType:'json'
    })
  }

  getByUserId(id: number):Observable<any>{
    return this.http.get(this.BASE_URL +'/api/businesses/user/'+id,{
      responseType:'json'
    })
  }

  getById(id:number):Observable<any>{
    return this.http.get(`${this.BASE_URL}/api/businesses/${id}`,{
      responseType:'json'
    })
  }

  addBusinessOwner(data:any): Observable<any>{
    return this.http.post(this.BASE_URL+'/api/businesses/add/owner',data,{
      responseType:'json'
    });
  }

  createBusiness(data:any): Observable<any>{
    return this.http.post(this.BASE_URL+'/api/businesses',data,{
      // responseType:'json'
    });
  }

  getBusinessCount(): Observable<number> {
    return this.http.get<number>(`${this.BASE_URL}/api/businesses/count`, {
      responseType: 'json'
    });
  }

  saleCouponReportForWeekly(type: 'pdf' | 'excel', businessId: number): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/coupon/weeklyRreport/${businessId}`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
      },
    });

  }


  saleCouponReportForMonthly(type: 'pdf' | 'excel', businessId: number): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/coupon/monthlyReport/${businessId}`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
      },
    });

  }
  productReport(type: 'pdf' | 'excel', businessId: number): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/products/preport/${businessId}`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
      },
    });

  }

  getCouponSalesData(businessId : number | null): Observable<{ businessId: number, soldCount: number, buyDate: string }[]> {
    return this.http.get<{ businessId: number, soldCount: number, buyDate: string }[]>(
      `${this.BASE_URL}/api/sale-coupon/coupon-sales/${businessId}`,
      {
        responseType: 'json'
      }
    );
  }
// get business images
getImageUrl(imagePath: string): string {

  return `${this.BASE_URL}/public/businesses/images/${imagePath}`;
}

getAllBusinesses(): Observable<any> {
  return this.http.get(`${this.BASE_URL}/api/businesses`, {
    responseType: 'json',
  });
}

// Update an existing product by ID
update(id: number, data: any): Observable<any> {

  return this.http.put(`${this.BASE_URL}/api/businesses/${id}`, data, {
    responseType: 'json'
  });
}

}
