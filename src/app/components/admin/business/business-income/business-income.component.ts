import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BusinessService } from '../../../../services/business/business.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Business } from '../../../../models/business';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaymentHistoryModalComponent } from './payment-history-modal/payment-history-modal.component';
import { MdbModalService } from 'mdb-angular-ui-kit/modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-business-income',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './business-income.component.html',
  styleUrl: './business-income.component.css'
})
export class BusinessIncomeComponent implements OnInit {
  businesses: any[]  =[];
  searchTerm: string = '';
  profitPercentage: number = 0;
  lastProfitPercentage: number = 0;
  remainingAmount: any;
  buttonEnabled: any;
  paymentHistory: { [businessId: number]: any[] } = {};

  currentPage = 1;
  itemsPerPage = 4;

  selectedBusinessHistory: any[] = []; // For payment history modal
  loading: boolean = false; // For loader in modal

  selectedBusinessId!: number;

  constructor(private businessService: BusinessService,
              private toastr: ToastrService,
              private modalService: MdbModalService,
              private cdr: ChangeDetectorRef,
              private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBusinessesWithIncome();
  }

  loadBusinessesWithIncome(): void {
    this.businessService.getAllBusinesses().subscribe({
      next: (businesses: any[]) => {
        this.businesses = businesses.map((businesses) => ({
          ...businesses,
          profitPercentage:businesses.profitPercentage || 15, 
          paid: businesses.paymentStatus === 'PAID',
        }));
        console.log("Loaded Businesses: ", this.businesses);
        console.log("Businesses ", this.businesses);
        businesses.map((business) => {
          console.log("Business Percentage", business.profitPercentage == undefined ? 15 : business.profitPercentage);
        })
        this.cdr.detectChanges();
        this.loadIncomes();
        this.loadPaidHistories();
        
        console.log("Business Incomes " , this.businesses);
        
      },
      error: (error) => {
        console.error('Failed to fetch businesses:', error);
      },
    });
  }

  loadPaidHistories(): void {
    this.businesses.forEach((business) => {
      this.businessService.getById(business.id).subscribe({
        next: (businessDetail) => {
          business.lastPaidAmount = businessDetail.lastPaidAmount;
          business.paymentStatus = businessDetail.paymentStatus;
  
          business.paid = business.paymentStatus === 'PAID';
            this.businessService.getPaidHistory(business.id).subscribe({
            next: (history) => {
              this.paymentHistory[business.id] = history; 
  
              if (history && history.length > 0) {
                const lastPayment = history[0]; 
                business.lastPaidAmount = lastPayment.paidAmount;
                business.profitPercentage = lastPayment.desiredPercentage || 15; 
              } else {
                business.paid = false;
                business.profitPercentage = 15; 
              }

              this.businessService.calculateAmountToPay(business.id).subscribe({
                next: (amountToPay) => {
                  business.amountToPay = amountToPay;
                  this.updateProfits(business); 
                },
                error: (error) => {
                  console.error(`Failed to fetch amount to pay for business ID ${business.id}:`, error);
                },
              });
            },
            error: (error) => {
              console.error(`Failed to fetch payment history for business ID ${business.id}:`, error);
            },
          });
        },
        error: (error) => {
          console.error(`Failed to fetch business details for business ID ${business.id}:`, error);
        },
      });
    });
  }
  

  payOwner(business: Business): void {
    if (business.paymentStatus === 'PAID') {
      this.toastr.error('This business has already been paid.');
      return;
  }
    if (business.profitPercentage <= 0 || business.profitPercentage > 100) {
      this.toastr.error('Invalid profit percentage. It must be between 1 and 100.');
      return;
    }

    this.businessService
      .payOwner({ businessId: business.id, desiredPercentage: business.profitPercentage })
      .subscribe({
        next: (response) => {
          this.toastr.success('Payment successful.');
          business.ownerProfit = 0;
          business.adminProfit = 0;
          business.paid = true;
          this.loadBusinessesWithIncome();
          this.updateProfits(business);
          this.loadPaidHistories();
          window.location.reload();
        },
        error: (error) => {
          console.error('Payment failed:', error);
          this.toastr.error('Payment failed. Please try again.');
        },
      });
  }

  loadIncomes(): void {
    this.businesses.forEach((businesses) => {
      this.businessService.getBusinessIncome(businesses.id).subscribe({
        next: (incomeData) => {
          businesses.income = incomeData;
          
          this.updateProfits(businesses);          
        },
        error: (error) => {
          console.error(`Failed to fetch income for business ID ${businesses.id}:`, error);
        },
      });
    });
  }

  updateProfits(business: Business): void {
    if (business.profitPercentage > 0 && business.profitPercentage <= 100) {
      if (business.paid) {
      business.adminProfit = 0 ;
      business.ownerProfit = 0 ;
      console.log('Last Paid Amount : ' , business.lastPaidAmount);
      console.log('Remaining Amount : ' , business.remainingAmount);
      console.log(`Updated Profits for ${business.name}: Admin Profit = ${business.adminProfit}, Owner Profit = ${business.ownerProfit}`);
    }  else {
      business.adminProfit = (business.amountToPay * business.profitPercentage) / 100;
      business.ownerProfit = business.amountToPay - business.adminProfit;
      console.log(`Profits calculated from amountToPay for ${business.name}`);
      this.businessService.updatePercentage(business.id, business.profitPercentage).subscribe({
        next: (response) => {
          console.log(`Profit Percentage updated for ${business.name}: ${business.profitPercentage}`);
        },
        error: (error) => {
          console.error(`Failed to update profit percentage for ${business.name}:`, error);
        },
      });

    } 
   } else {
      business.adminProfit = 0;
      business.ownerProfit = 0;
      console.log(`Invalid profit percentage for ${business.name}: ${business.profitPercentage}`);
    }
  }
  
  

  canModify(business: Business): boolean {
    return (
      business.paymentStatus !== 'PAID' &&
      business.income > business.lastPaidAmount 
    );
  }

  openPaymentHistoryModal(business: any): void {
    console.log("Business ID " , business.id),
    console.log("Business Name " , business.name),
    this.modalService.open(PaymentHistoryModalComponent, {
      modalClass: 'modal-lg',
      
      data: { businessId: business.id, businessName: business.name },
    });
  }

  get filteredBusinesses(): Business[] {
            return this.businesses.filter((business) =>
              business.name.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
          }

  getImageUrl(photo: string): string {
    return this.businessService.getImageUrl(photo);
  }
  logProfitPercentage(business: Business): void {
    console.log(`Profit Percentage for ${business.name}: ${business.profitPercentage}`);
  }

  navigateToReportPreview(): void {
    this.router.navigate(['/d/report-preview']);
  }
  
}
