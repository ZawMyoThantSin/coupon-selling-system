import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Observable } from 'rxjs';
import { businessCategory } from '../../models/business-category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  BASE_URL = "http://localhost:8080/api/business-categories";
  public token: any;

  constructor(private http:HttpClient,private storageService:StorageService) {
      this.token = this.storageService.getItem("token");
    }

  private createAuthHeader(): any {
      if (this.token) {
        console.log("Token: ", this.token);
        return new HttpHeaders().set("Authorization", "Bearer " + this.token);
      }
      console.log("No token found");
      return null;
    }
  
  getAllCategories(): Observable<businessCategory[]> {
    const headers = this.createAuthHeader()
    console.log('Request Headers: ', headers)
    return this.http.get<businessCategory[]>(this.BASE_URL, {
      headers: headers
    });
  }

  getCategoryById(id: number): Observable<businessCategory> {
    return this.http.get<businessCategory>(`${this.BASE_URL}/${id}`, {
      headers: this.createAuthHeader()
    });
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(this.BASE_URL, data, { 
      responseType: 'json',
     });
    
}

  updateCategory(id: number, category: businessCategory): Observable<businessCategory> {
    return this.http.put<businessCategory>(`${this.BASE_URL}/${id}`, category, {
      headers: this.createAuthHeader()
    });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${id}`, {
      headers: this.createAuthHeader()
    });
  }
  
}
