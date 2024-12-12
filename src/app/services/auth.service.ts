import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token!:Token;

  constructor(private http: HttpClient) { }

  private BASE_URL = "http://localhost:8080"



  login(data:any):Observable<any>{
    const header = new HttpHeaders({'Content-Type':'application/json'})
    return this.http.post(`${this.BASE_URL}/login`,data , { headers:header});
  }

  signup(data:any):Observable<any>{
    const header = new HttpHeaders({'Content-Type':'application/json'})
    return this.http.post(`${this.BASE_URL}/signup`,data , { headers:header});
  }
}
