import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private pendingRequestsCountSubject = new BehaviorSubject<number>(0);
  pendingRequestsCount$ = this.pendingRequestsCountSubject.asObservable();

  setPendingRequestsCount(count: number): void {
    this.pendingRequestsCountSubject.next(count);
  }

  getPendingRequestsCount(): number {
    return this.pendingRequestsCountSubject.getValue();
  }


  // private unfriendingCountSubject = new BehaviorSubject<number>(0);
  // unfriendingCount$ = this.unfriendingCountSubject.asObservable();

  // setUnfriendingCount(count: number): void {
  //   this.unfriendingCountSubject.next(count);
  // }

  // getUnfriendingCount(): number {
  //   return this.unfriendingCountSubject.getValue();
  // }

}
