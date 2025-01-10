import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MdbModalRef} from 'mdb-angular-ui-kit/modal';
import { HttpClient } from '@angular/common/http';
import { FriendsService } from '../../../services/user/friends.service';
import { UserService } from '../../../services/user/user.service';
import { PurchaseCouponService } from '../../../services/purchase-coupon/purchase-coupon.service';
import { PurchaseCoupon } from '../../../models/purchase-coupon';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-share-coupon-model',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-coupon-model.component.html',
  styleUrl: './share-coupon-model.component.css'
})
export class ShareCouponModelComponent {
  friends: any[] = [];
  coupons: any[] = []; 
  friendIds: Set<number> = new Set();
  loggedInUserId: number | null = null;
  loggedInUserEmail: string | any = '';
  saleCouponId!: number;
  showModal: boolean = false;
  selectedFriendName: string = '';
  selectedUserId: number | null = null;
  
  @Input() coupon!: PurchaseCoupon;
  
  constructor(public modalRef: MdbModalRef<ShareCouponModelComponent>,
    private friendshipService: FriendsService,
   private userService: UserService,
   private purchaseCouponService: PurchaseCouponService ,
    private http: HttpClient,
    private toastr: ToastrService
                  
  ) {}

  close(): void {
    this.modalRef.close();
  }

  ngOnInit(): void {
    this.saleCouponId = this.coupon.saleCouponId;
    this.loadFriends();
    this.getLoggedInUserInfo();
   
  }

  loadFriends() {

    if (!this.loggedInUserId) {
      console.error('Logged-in user ID is missing. Cannot load friends.');
      return;
    }

    this.friendshipService.getFriends(this.loggedInUserId).subscribe({
    next: (data) => {
      this.friends = data;
      this.friendIds = new Set(data.map(friend => friend.id));
      console.log('Friends loaded:', this.friends);
    },
    error: (err) => {
      console.error('Error fetching friends:', err);
    },
  });
  }
  
 
  sendCoupon(friendId: number): void {
    const friend = this.friends.find(f => f.id === friendId);
    if (friend) {
      this.selectedFriendName = friend.friendName;
      this.selectedUserId = friend.friendId;  
      this.showModal = true; 
    }
  }
  
  getLoggedInUserInfo(): void {
    this.userService.getUserInfo().subscribe({
      next: (user) => {
        this.loggedInUserEmail = user.email;
        this.loggedInUserId = user.id;
       
        console.log('Logged-in user info:', user);
        this.loadFriends();
      },
      error: (err) => {
        console.error('Error fetching logged-in user info:', err);
      },
    });
  }
  getImageUrl(imagePath: string): string {
    return this.userService.getImageUrl(imagePath);
  }
  confirmSendCoupon(): void {
    if (this.saleCouponId && this.selectedUserId) {
      this.purchaseCouponService.transferCoupon(this.saleCouponId, this.selectedUserId).subscribe({
        next: (message) => {
          console.log(message);
          this.toastr.success(`Coupon successfully transferred to ${this.selectedFriendName}!`);
          this.modalRef.close(message);  // Close the modal after success
        },
        error: (err) => {
          console.error('Error transferring coupon:', err);
          alert('Failed to transfer coupon.');
        }
      });
    } else {
      alert('No coupon selected for transfer or invalid user!');
    }

    // Close the modal after confirming the transfer
    this.showModal = false;
  }
  cancelSendCoupon(): void {
    this.showModal = false; // Close the modal if canceled
  }
}
