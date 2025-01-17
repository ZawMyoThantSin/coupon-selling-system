import { Component, Input } from '@angular/core';
import { BusinessReview } from '../../../../models/business-review';
import { CommonModule } from '@angular/common';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { UserService } from '../../../../services/user/user.service';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-modal.component.html',
  styleUrl: './rating-modal.component.css'
})
export class RatingModalComponent {
  @Input() ratingList: BusinessReview[] = []; // Binding rating list data
  @Input() user_id: number = 0;

  constructor(public modalRef: MdbModalRef<RatingModalComponent>,
    private userService: UserService
  ) {}

  close(): void {
    this.modalRef.close(); // Close the modal
  }

  getImageUrl(imagePath: any): string {
    return this.userService.getImageUrl(imagePath);
  }
}
