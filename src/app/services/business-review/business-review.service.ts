import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Observable } from 'rxjs';
import { getDefaultAppConfig } from '../../models/appConfig';

@Injectable({
  providedIn: 'root'
})
export class BusinessReviewService {
  BASE_URL = `${getDefaultAppConfig().backendHost}/`;
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



  getAllRating(business_id: number): Observable<any> {
    const url = `${this.BASE_URL}api/business_review/${business_id}/reviews`;
    return this.http.get(url, { responseType: 'json' });
  }


  // getAllRating():Observable<any>{
  //   return this.http.get(this.BASE_URL +'api/business_review',{
  //     responseType:'json'
  //   })
  // }
}
