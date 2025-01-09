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

  resetPassword(data: { userId: number; newPassword: string }): Observable<any> {
    const token = localStorage.getItem('token');
    const header = new HttpHeaders({ 'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,  });
    return this.http.post(`${this.BASE_URL}/reset-password`,
      data, {
              headers: header,
              responseType: 'json',
               });
  }

  getUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : 0;
  }

}
