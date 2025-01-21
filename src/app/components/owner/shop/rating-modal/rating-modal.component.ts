import { Component, Input } from '@angular/core';
import { BusinessReview } from '../../../../models/business-review';
import { CommonModule } from '@angular/common';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { UserService } from '../../../../services/user/user.service';
import { formatDate } from '@angular/common';
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

  getRelativeTime(date: string | undefined): string {
    if (!date) {
      return 'Invalid date';
    }

    const now = new Date();
    const inputDate = new Date(date);

    if (isNaN(inputDate.getTime())) {
      return 'Invalid date';
    }

    const diff = now.getTime() - inputDate.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      // Less than a week
      return formatDate(inputDate, 'dd/MM/yyyy', 'en-US');
    } else if (diffDays < 30) {
      // Less than a month
      return `${Math.floor(diffDays / 7)} week ago`;
    } else if (diffDays < 365) {
      // Less than a year
      return `${Math.floor(diffDays / 30)} month ago`;
    } else {
      return `${Math.floor(diffDays / 365)} year ago`;
    }
  }

}
