import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Observable } from 'rxjs';
import { getDefaultAppConfig } from '../../models/appConfig';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  BASE_URL = `${getDefaultAppConfig().backendHost}/`;

  constructor(
    private http:HttpClient,) {}




getByUserId(id:number):Observable<any>{
  return this.http.get(`${this.BASE_URL}api/orders/user/${id}`,{
    responseType:'json'
  })
}
}
