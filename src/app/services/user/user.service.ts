import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserResponse } from '../../models/user-response.models';
import { StorageService } from '../storage.service';
import { getDefaultAppConfig } from '../../models/appConfig';



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userIdSource = new BehaviorSubject<number | null>(null);
  userId$ = this.userIdSource.asObservable();

  updateBusinessId(id: number): void {
    this.userIdSource.next(id);
  }

  BASE_URL = `${getDefaultAppConfig().backendHost}/api/user`; // Base URL for user-related endpoints
  public token: any;

  constructor(private http:HttpClient,private storageService:StorageService) {
    this.token = this.storageService.getItem("token");

  }

  private createAuthHeader(): any{

    if(this.token){
      console.log('Token found in storage..', this.token);
      return new HttpHeaders().set(
        "Authorization", "Bearer "+ this.token
      )
    }else{
      console.log("Token Not Found!");
    }
    return null;
  }

  getUserInfo(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.BASE_URL}/profile`, {
      responseType: 'json'
    });
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/${id}`, {
      headers: this.createAuthHeader(),
      responseType: 'json'
    });
  }
  updateUserProfile(id: number, data: any): Observable<any> {
    return this.http.put(`${this.BASE_URL}/${id}`, data, {
      responseType: 'json'
    });
  }
getImageUrl(imagePath: string): string {

  return `${getDefaultAppConfig().backendHost}/public/profile/images/${imagePath}`;
}
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${id}`, {
      headers: this.createAuthHeader()
    });
  }

  searchUsersByEmail(email: string): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.BASE_URL}/search`, {
      headers: this.createAuthHeader(),
      params: { email },
      responseType: 'json'
    });
  }

  getUserCount(): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/count`, {
      responseType: 'json'
    });
  }
}
