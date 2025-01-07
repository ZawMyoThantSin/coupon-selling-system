import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessReviewService {
  BASE_URL = 'http://localhost:8080/';
  public token: any;

  constructor(private http: HttpClient,
              private storageService: StorageService) {
    this.token = this.storageService.getItem('token');
  }



  hasUserRated(business_id: number, user_id: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.BASE_URL}api/business_review/has-rated/${user_id}/${business_id}`
    );
  }

  ratebusiness(data:any): Observable<any>{
    return this.http.post(this.BASE_URL+'api/business_review',data,{
      responseType:'json'
    });
  }

  // Fetch overview count for a business (returning a number, not array)
  overviewcount(id: any): Observable<number> {
    return this.http.get<number>(`${this.BASE_URL}api/business_review/overview/${id}`, {
      responseType: 'json',
    });
  }

  getAllRating():Observable<any>{
    return this.http.get(this.BASE_URL +'api/business_review',{
      responseType:'json'
    })
  }
}
