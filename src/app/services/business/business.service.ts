import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  BASE_URL = "http://localhost:8080/";
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
      console.log("Not Found!");
    }
    return null;
  }

  getAllBusiness(id: number):Observable<any>{
    return this.http.get(this.BASE_URL +'api/businesses/user/'+id,{
      responseType:'json'
    })
  }

  getById(id:number):Observable<any>{
    return this.http.get(`${this.BASE_URL}api/businesses/${id}`,{
      headers:this.createAuthHeader(),
      responseType:'json'
    })
  }

  addBusinessOwner(data:any): Observable<any>{
    const header = new HttpHeaders({'Content-Type':'application/json'})
    return this.http.post(this.BASE_URL+'api/businesses/add/owner',data,{
      headers:this.createAuthHeader(),
      responseType:'json'
    });
  }

  createBusiness(data:any): Observable<any>{
    return this.http.post(this.BASE_URL+'api/businesses',data,{
      // responseType:'json'
    });
  }

// get business images
getImageUrl(imagePath: string): string {

  return `http://localhost:8080/public/businesses/images/${imagePath}`;
}


}
