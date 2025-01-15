import { Component, Inject, Input, OnInit } from '@angular/core';
import { FriendsService } from '../../../../../services/user/friends.service';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../../services/user/user.service';

@Component({
  selector: 'app-friend-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friend-detail.component.html',
  styleUrl: './friend-detail.component.css'
})
export class FriendDetailComponent implements OnInit {
  @Input() friendId!: number;
  friendDetails: any | null = null;

  constructor(
    private friendshipService: FriendsService,
    private userService: UserService,
    public modalRef: MdbModalRef<FriendDetailComponent>
  ) {}

  ngOnInit(): void {
    this.fetchFriendDetails();
  }

  fetchFriendDetails(): void {
    this.friendshipService.getFriendDetails(this.friendId).subscribe({
      next: (details) => {
        this.friendDetails = details;
      },
      error: () => {
        console.error('Error fetching friend details');
      },
    });
  }

  getFriendImageUrl(profile: string | null): string {
    return profile
      ? this.userService.getImageUrl(profile)
      : '/images/default-avatar.png';
  }

  closeModal(): void {
    this.modalRef.close();
  }
}
