import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from '@angular/compiler';
import { BehaviorSubject, Observable } from 'rxjs';
import { getDefaultAppConfig } from '../models/appConfig';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInUserId = new BehaviorSubject<number | null>(null);
  userId$ = this.loggedInUserId.asObservable();

  updateBusinessId(id: number): void {
    this.loggedInUserId.next(id);
  }
  constructor(private http: HttpClient) { }
  private BASE_URL = getDefaultAppConfig().backendHost;



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

  searchUsersByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/public/search-user`, {
      params: { email },
      responseType: 'json',
    });
  }

  sendOtpEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/public/send-otp/${email}`, {
      responseType: 'json',
    });
  }

  validateOtp(email: string, otp: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.BASE_URL}/public/validate`,{
      email:email,
      otp: otp
    }, {
      responseType: 'json',
    });
  }

  passwordReset(data:any): Observable<boolean> {
    return this.http.post<boolean>(`${this.BASE_URL}/public/password-reset`,data, {
      responseType: 'json',
    });
  }

  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const body = { userId, oldPassword, newPassword };

    return this.http.post(`${this.BASE_URL}/public/change-password`, body, { headers });
  }

  validateEmail(email: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/public/validate-email`, {
      params: {
        email,
        ipAddress: '156.124.12.145', // Replace with actual IP if needed
      },
    });
  }
}
