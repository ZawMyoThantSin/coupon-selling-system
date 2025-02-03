import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
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
    return this.http.get(`${this.BASE_URL}/public/businesses/${id}`,{
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

  getBusinessCount(): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/api/businesses/count`, {
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


  usedCouponReportForWeekly(type: 'pdf' | 'excel', businessId: number): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/coupon/coupon-usage/weekly/${businessId}`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
      },
    });

  }


  usedCouponReportForMonthly(type: 'pdf' | 'excel', businessId: number): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/coupon/coupon-usage/monthly/${businessId}`, {
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


  payOwner(request: { businessId: number; desiredPercentage: number }): Observable<any> {
    if (request.desiredPercentage <= 0 || request.desiredPercentage > 100) {
      return throwError(() => new Error("Invalid profit percentage. It must be between 1 and 100."));
    }

    return this.http.post(
      `${this.BASE_URL}/api/businesses/pay-owner`,request,
      { }
    );
  }

  getPaidHistory(businessId: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/api/businesses/${businessId}/paid-history`);
  }

// get business images
  getImageUrl(imagePath: string): string {

    return `${this.BASE_URL}/public/businesses/images/${imagePath}`;
  }

  getAllBusinesses(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/public/businesses`, {
      responseType: 'json',
    });
  }

  // Update an existing product by ID
  update(id: number, data: any): Observable<any> {

    return this.http.put(`${this.BASE_URL}/api/businesses/${id}`, data, {
      responseType: 'json'
    });
  }

  getBusinessIncome(id: number): Observable<any[]> {

    return this.http.get<any[]>(`${this.BASE_URL}/api/businesses/${id}/income`, {
      responseType: 'json'
    });
  }

  calculateAmountToPay(id: number): Observable<any>{

    return this.http.get(`${this.BASE_URL}/api/businesses/${id}/amount-to-pay`, {
      responseType: 'json'
    });
  }


  updatePercentage(id: number, percentage: any): Observable<any> {
    return this.http.get(`${this.BASE_URL}/api/businesses/update-percent/${id}/${percentage}`);
  }

  generatePaidHistoryReport(type: 'pdf' | 'excel', businessId: number | null): Observable<Blob> {
      const url = `${this.BASE_URL}/api/businesses/paid-history-report`;
      const params = { reportType: type, businessId: businessId?.toString() || '' };
      const responseType = type === 'excel' ? 'arraybuffer' : 'blob'; // Use 'arraybuffer' for Excel
      return this.http.get(url, { responseType: responseType as 'blob', params });
  }

  couponReport(type: 'pdf' | 'excel', businessId: number): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/coupon/coupon-report/${businessId}`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
      },
    });

  }


  bestProductListReport(type: 'pdf' | 'excel', businessId: number): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/coupon/best-selling-product-report/${businessId}`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
      },
    });

  }
  reaminCouponReport(type: 'pdf' | 'excel', businessId: number): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/coupon/remaining-coupon-report/${businessId}`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
      },
    });

  }
  expiredCouponReport(type: 'pdf' | 'excel', businessId: number): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/coupon/expired-coupon-report/${businessId}`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
      },
    });

  }

  businessReport(type: 'pdf' | 'excel', reportType: string): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/businesses/business-report`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
      },
    });

  }

  generateCustomerListReport(
    reportType: 'pdf' | 'excel',
    startDate?: string,
    endDate?: string
  ): Observable<Blob> {
    let params = new HttpParams().set('reportType', reportType);
    if (startDate) {
      params = params.set('startDate', new Date(startDate).toISOString());
    }
    if (endDate) {
      params = params.set('endDate', new Date(endDate).toISOString());
    }
    return this.http.get(`${this.BASE_URL}/api/customers/report`, {
      responseType: 'blob',
      params,
    });
  }

  usedCouponReport(
    type: 'pdf' | 'excel',
    businessId: number,
    params: { startDate?: string; endDate?: string } // Add params as an argument
  ): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/coupon/report`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
        businessId: businessId.toString(), // Include businessId as a query parameter
        startDate: params.startDate || '', // Pass startDate if it exists
        endDate: params.endDate || '', // Pass endDate if it exists
      },
    });
  }

  saleCouponReport(
    type: 'pdf' | 'excel',
    businessId: number,
    params: { startDate?: string; endDate?: string } // Add params as an argument
  ): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/coupon/coupon-sales-report`, {
      responseType: 'blob',
      params: {
        reportType: type, // Pass `reportType` as a query parameter
        businessId: businessId.toString(), // Include businessId as a query parameter
        startDate: params.startDate || '', // Pass startDate if it exists
        endDate: params.endDate || '', // Pass endDate if it exists
      },
    });

  }

  ownerProfitReport(type: 'pdf' | 'excel', businessId: number): Observable<Blob> {
    return this.http.get(`${this.BASE_URL}/api/businesses/business/paid-history/${businessId}`, {
      responseType: 'blob',
      params: {
        reportFormat: type, // Pass `reportType` as a query parameter
      },
    });
  }
}
