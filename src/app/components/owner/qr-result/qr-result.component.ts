import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QrValidateService } from '../../../services/qr-validate/qr-validate.service';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../../../services/business/business.service';
import { PurchaseCoupon } from '../../../models/purchase-coupon';
import { ProductService } from '../../../services/product/product.service';

@Component({
  selector: 'app-qr-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl:'./qr-result.component.html' ,
  styleUrl: './qr-result.component.css'
})
export class QrResultComponent {
  qrResult!: string;
  qrResultMessage: string = '';
  isLoading: boolean = false;
  businessId: number | null = null;
  isError: boolean = false;
  qrCodeDetails!:PurchaseCoupon;
  saleCouponId:number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qrCodeService: QrValidateService,
    private businessService: BusinessService,
    private proudctService: ProductService
  ) {}

  ngOnInit(): void {
    // Access the result passed as a parameter from the route
    this.route.paramMap.subscribe((params) => {
      this.qrResult = params.get('result') || ''; // Retrieve the result parameter
      if (this.qrResult) {
        this.fetchQrCodeData();
      } else {
        this.qrResultMessage = 'Invalid QR Code result.';
      }
    });
    this.businessService.businessId$.subscribe((id) => {
      this.businessId = id;
    });

  }

  fetchQrCodeData(): void {
    this.isLoading = true; // Start loading
    this.qrCodeService.getQrCodeData(this.qrResult).subscribe(
      (res) => {
        this.saleCouponId = res.saleCouponId;
        if (res.businessId !== this.businessId) {
          this.qrResultMessage =
            'This coupon is not valid for this business.'+
            'Please use it at the correct business location.';
          this.isError = true; // Mark as error
        } else {
          this.isLoading = true;
          this.qrCodeService.getSaleCouponData(this.saleCouponId).subscribe((response)=>{
            let status = response.status;
            if(status === 0 || status === 2){
              this.qrCodeDetails = response;
              this.isLoading = false;
            }else{
              this.qrResultMessage = "Coupon is Already Used";
              this.isError = true;
              this.isLoading = false;
            }
          },error=> {
            this.qrResultMessage = "Error In Fetching Qr Coda Data!";
            this.isError = true;
          }
        );
          // No error
          this.isError = false;
        }

        this.isLoading = false; // Stop loading
      },
      (error) => {
        console.error('Error:', error);
        this.qrResultMessage = 'Failed to fetch data. Please try again later.';
        this.isError = true; // Mark as error
        this.isLoading = false; // Stop loading
      }
    );
  }
  onCancelEvent(): void{
    if(confirm("Are you sure want to cancel ?")){
      this.router.navigate(['/o'])
    }

  }

  getProductImage(imagePath: string): string{
    return this.proudctService.getImageUrl(imagePath);
  }

}
