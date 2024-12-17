import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserResponse } from '../../models/user-response.models';
import { StorageService } from '../storage.service';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  BASE_URL = "http://localhost:8080/api/user"; // Base URL for user-related endpoints
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

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.BASE_URL}/${id}`, {
      headers: this.createAuthHeader(),
      // profile: 'https://mdbootstrap.com/img/new/avatars/1.webp',
      responseType: 'json'
    });
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
}
