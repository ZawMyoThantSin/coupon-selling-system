import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StorageService } from '../storage.service';
import { Product } from '../../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  BASE_URL = "http://localhost:8080/";
  public token: any;

  constructor(private http: HttpClient, private storageService: StorageService) {
    this.token = this.storageService.getItem("token");
  }

   private createAuthHeader(): any{

    if(this.token){
      console.log('Token found in storage..', this.token);
      return new HttpHeaders().set(
        "Authorization", "Bearer "+ this.token
      )
    }else{
      console.log("Not Found!");
    }
    return null;
  }

  // Fetch all products
  getAllProducts(id:any): Observable<Product[]> {
    return this.http.get<Product[]>(this.BASE_URL + 'api/products/b/'+id, {
      responseType: 'json'
    });
  }

  getEveryProducts(): Observable<any> {
    return this.http.get(`${this.BASE_URL}api/products`, {
      headers: this.createAuthHeader(),
      responseType: 'json',
    });
  }


  // Fetch product by ID
  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}api/products/${id}`, {
      headers: this.createAuthHeader(),
      responseType: 'json'
    });
  }

  // Create a new product
  createProduct(product: any): Observable<Product> {
    return this.http.post<Product>(this.BASE_URL + 'api/products', product, {
      responseType: 'json'
    });
  }


  // Update an existing product by ID
  updateProduct(id: number, data: any): Observable<any> {
    const header = new HttpHeaders({'Content-Type':'application/json'})

    return this.http.put(`${this.BASE_URL}api/products/${id}`, data, {
      headers: this.createAuthHeader(),
      responseType: 'json'
    });
  }

  // Delete a product by ID
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_URL}api/products/${id}`, {
      headers: this.createAuthHeader(),
      responseType: 'json'
    });
  }

  updateDiscount(id: number, discount: any): Observable<any> {
    return this.http.put(`${this.BASE_URL}api/products/${id}/discount`, { discount }, {
      responseType: 'json'
    });
  }


// get product images
  getImageUrl(imagePath: string): string {

    return `http://localhost:8080/public/products/images/${imagePath}`;
  }

}
