import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { UserResponse } from '../../../../models/user-response.models';
import { UserService } from '../../../../services/user/user.service';
import { CommonModule, DatePipe } from '@angular/common';
import { StorageService } from '../../../../services/storage.service';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserprofileComponent implements OnInit {

  searchResults: UserResponse[] = [];
  isLoading: boolean = false;
  userInfo!:UserResponse;
  token!: any;
  isLoggedIn: boolean = false;

  constructor(private storageService: StorageService
    ,private userService: UserService) {}

  ngOnInit(): void {
    this.fetchUserDetails();
  }

  fetchUserDetails(): void {
    this.userService.getUserInfo().subscribe((response)=>{
      console.log("UserInfo: ",response)
      this.userInfo = response;
    },error => console.log('Error in Fetching UserInfo', error));

    this.token = this.storageService.getItem('token');
    if (this.token == '' || this.token == null) {
      console.log('Token is not defined or is invalid.');
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }
  }
}

