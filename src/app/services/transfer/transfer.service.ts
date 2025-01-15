import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { TransferResponse } from '../../models/transfer.models';
import { Observable } from 'rxjs';
import { getDefaultAppConfig } from '../../models/appConfig';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class TransferService {


  BASE_URL = `${getDefaultAppConfig().backendHost}/`;
  public token: any;

  constructor(private http: HttpClient, private storageService: StorageService,
    private websocketService: WebsocketService,
  ) {
      this.token = this.storageService.getItem("token");
    }
    connectWebSocket(): void {
      this.websocketService.connect();
    }

    disconnectWebSocket(): void {
      this.websocketService.disconnect();
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

      // Transfer a coupon
  transferCoupon(request: any): Observable<TransferResponse> {
    return this.http.post<TransferResponse>(`${this.BASE_URL}`, request);
  }

  // Accept a coupon transfer
  acceptTransfer(transferId: number): Observable<TransferResponse> {
    return this.http.put<TransferResponse>(`${this.BASE_URL}/${transferId}/accept`, {});
  }

  // Deny a coupon transfer
  denyTransfer(transferId: number): Observable<TransferResponse> {
    return this.http.put<TransferResponse>(`${this.BASE_URL}/${transferId}/deny`, {});
  }

  // Fetch transfer history
  getTransferHistory(userId: number): Observable<TransferResponse[]> {
    return this.http.get<TransferResponse[]>(`${this.BASE_URL}/history/${userId}`);
  }



}
