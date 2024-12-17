import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { UserResponse } from '../../../../models/user-response.models';
import { UserService } from '../../../../services/user/user.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserprofileComponent implements OnInit {
  userDetails!: UserResponse;
  searchResults: UserResponse[] = [];
  isLoading: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchUserDetails();
  }

  fetchUserDetails(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userDetails.id).subscribe({
      next: (data: UserResponse) => {
        this.userDetails = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching user details:', err);
        this.isLoading = false;
      }
    });
  }
}

