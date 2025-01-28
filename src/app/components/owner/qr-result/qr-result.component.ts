import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QrValidateService } from '../../../services/qr-validate/qr-validate.service';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../../../services/business/business.service';
import { PurchaseCoupon } from '../../../models/purchase-coupon';
import { ProductService } from '../../../services/product/product.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-qr-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    private proudctService: ProductService,
    private toastr: ToastrService
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
  // onSubmitValidate(): void{
  //   const saleCouponId = this.qrCodeDetails.saleCouponId;
  //   this.qrCodeService.validateTheCoupon(saleCouponId).subscribe((res)=>{
  //     this.toastr.success("Coupon Validate Successfully!", "Success");
  //     this.router.navigate(['/o/used-coupon/shopId'])
  //   },error=> {
  //     this.toastr.error("Coupon Validate Error!", "ERROR");
  //   });
  // }
  onSubmitValidate(): void {
    const saleCouponId = this.qrCodeDetails.saleCouponId;

    this.qrCodeService.validateTheCoupon(saleCouponId).subscribe(
      (res) => {
        this.toastr.success("Coupon Validate Successfully!", "Success");

        // Dynamically navigate using the actual shopId
        const shopId = this.qrCodeDetails.businessId; // Replace with the actual property holding shopId
        if (shopId) {
          this.router.navigate([`/o/used-coupon/${shopId}`]);
        } else {
          console.error("shopId is missing. Cannot navigate to used-coupon page.");
        }
      },
      (error) => {
        this.toastr.error("Coupon Validate Error!", "ERROR");
      }
    );
  }


  getProductImage(imagePath: string): string{
    return this.proudctService.getImageUrl(imagePath);
  }

}
