import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  constructor(private toastr: ToastrService) {}

  showNotification(message: string, title: string = 'Notification'): void {
    this.toastr.info(message, title, {
      closeButton: true,
      timeOut: 5000,
      progressBar: true,
    });
  }
}
