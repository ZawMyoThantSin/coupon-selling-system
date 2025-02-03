import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PurchaseCouponService } from '../../../../../services/purchase-coupon/purchase-coupon.service';
import { CommonModule } from '@angular/common';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { catchError, forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-month-selection-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './month-selection-modal.component.html',
  styleUrl: './month-selection-modal.component.css'
})
export class MonthSelectionModalComponent implements OnInit {
  @Input() businessId: number | null = null;
  @Output() monthSelected = new EventEmitter<string>();

  availableMonths: { month: string; earnings: number }[] = [];
  isLoading: boolean = true;

  constructor(
    public modalRef: MdbModalRef<MonthSelectionModalComponent>,
    private saleCouponService: PurchaseCouponService
  ) {}

  ngOnInit() {
    if (this.businessId) {
      this.saleCouponService.getAvailableMonths(this.businessId).subscribe(
        (monthEarningsMap) => {
          this.processMonthEarnings(monthEarningsMap);
        },
        (error) => {
          console.error('Error fetching months:', error);
          this.isLoading = false;
        }
      );
    }
  }

  processMonthEarnings(monthEarningsMap: { [month: string]: number }) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    this.availableMonths = Object.entries(monthEarningsMap).map(([monthKey, earnings]) => {
      const [year, monthNumber] = monthKey.split('-').map(Number);
      return {
        month: `${monthNames[monthNumber - 1]} ${year}`,
        earnings: earnings
      };
    });

    this.isLoading = false;
  }

  // Emit selected month
  selectMonth(month: string) {
    this.monthSelected.emit(month);
  }

  // Close the modal
  closeModal() {
    this.modalRef.close();
  }
}
