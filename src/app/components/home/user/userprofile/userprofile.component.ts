import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { UserResponse } from '../../../../models/user-response.models';
import { UserService } from '../../../../services/user/user.service';
import { CommonModule, DatePipe } from '@angular/common';
import { StorageService } from '../../../../services/storage.service';
import { EditUserprofileComponent } from '../edit-userprofile/edit-userprofile.component';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [CommonModule,FormsModule, DatePipe,MatButtonModule,MatCardModule,MatIconModule,MatDividerModule,MatChipsModule],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserprofileComponent implements OnInit {
  modalRef: MdbModalRef<EditUserprofileComponent> | null = null;//
  searchResults: UserResponse[] = [];
  isLoading: boolean = false;
  userInfo!:UserResponse;
  token!: any;
  isLoggedIn: boolean = false;
  cond: boolean = true;

  constructor(private storageService: StorageService
    ,private userService: UserService,
     private modalService: MdbModalService
  ) {}

  ngOnInit(): void {
    this.fetchUserDetails();
  }

  fetchUserDetails(): void {
    this.userService.getUserInfo().subscribe((response)=>{
      // console.log("UserInfo: ",response)
      this.userInfo = response;
    },error => console.log('Error in Fetching UserInfo', error));

    this.token = this.storageService.getItem('token');
    if (this.token == '' || this.token == null) {
      // console.log('Token is not defined or is invalid.');
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }
  }

  openModal(): void {
    this.modalRef = this.modalService.open(EditUserprofileComponent);

    this.modalRef.onClose.subscribe(() => {
      this.fetchUserDetails();
    });
  }

  closeModal(): void {
    this.modalRef?.close();
  }
  getImageUrl(imagePath: string): string {
    return this.userService.getImageUrl(imagePath);
  }
}

