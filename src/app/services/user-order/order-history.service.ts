import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  BASE_URL = "http://localhost:8080/";

  constructor(
    private http:HttpClient,) {}




getByUserId(id:number):Observable<any>{
  return this.http.get(`${this.BASE_URL}api/orders/user/${id}`,{
    responseType:'json'
  })
}
}
