import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../../components/modal/product.modal';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  // private apiUrl='http://localhost:8080/api/products';


  // constructor(private http:HttpClient) { }

  // getProduct():Observable<any[]>{
  //   return this.http.get<any[]>(this.apiUrl);
  // }

  // addProduct(product:any):Observable<any>{
  //   return this.http.post<any>(this.apiUrl,product);
  // }

  // updateProduct(id:number,product:any):Observable<any>{
  //   return this.http.put<any>(`${this.apiUrl}/${id}`,product)
  // }

  // deleteProduct(id: number): Observable<any> {
  //   return this.http.delete<any>(`${this.apiUrl}/${id}`);
  // }



    // Sample product data (simulating backend data)
    private products: Product[] = [
      new Product(1, 1, 'Product 1', 'Description of Product 1', 100, 'Category 1', true, 10, new Date(), new Date()),
      new Product(2, 1, 'Product 2', 'Description of Product 2', 200, 'Category 2', true, 15, new Date(), new Date())
    ];

    constructor() { }

    // Get list of products
    getProducts(): Observable<Product[]> {
      return of(this.products);
    }

    // Add a new product
    addProduct(product: Product): Observable<Product> {
     if(product.id){
      const newProduct = this.products.findIndex((p)=>p.id === product.id);
     if(newProduct !== -1){
      this.products[newProduct]=product;
     }
    }else{
      product.id=this.products.length +1;
      this.products.push(product);
    }
    return of(product);
    }

    // Delete a product
    deleteProduct(id: number): Observable<void> {
      // Find and remove the product with the given ID
      this.products = this.products.filter(product => product.id !== id);
      return of(undefined); // Return void as there is no data to return
    }


    updateProduct(productId: number, updatedProduct: any): Observable<any> {
      const index = this.products.findIndex((p) => p.id === productId);

      if (index !== -1) {
        this.products[index] = { ...updatedProduct }; // Replace product data in memory
        console.log('Product updated in memory:', this.products[index]);
        return of({ success: true });
      }

      console.error('Product not found for update');
      return of({ success: false });
    }

    // Get a single product by ID from in-memory data
  getProductById(productId: number): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === productId);
    return of(product); // Return the found product wrapped in an observable
  }

}
