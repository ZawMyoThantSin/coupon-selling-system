import { Component } from '@angular/core';
import { CreateModalComponent } from './create-modal/create-modal.component';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { Coupon } from '../../../../models/coupon.modal';
import { JwtService } from '../../../../services/jwt.service';
import { StorageService } from '../../../../services/storage.service';
import { Router } from '@angular/router';
import { CouponService } from '../../../../services/coupon/coupon.service';

@Component({
  selector: 'app-coupon',
  standalone: true,
  imports: [],
  templateUrl: './coupon.component.html',
  styleUrl: './coupon.component.css'
})
export class CouponComponent {
  modalRef: MdbModalRef<CreateModalComponent> | null = null;//
  businesses:Coupon[]  =[];
  discountprice:any;
  constructor(private modalService: MdbModalService,
              private couponService:CouponService,
              private tokenService:JwtService,
              private storageService:StorageService,
              private router: Router
  ) {}
  ngOnInit(): void {

    this.couponService.getAllCoupons().subscribe(
      response =>{
        this.businesses = response
        console.log("RES: ",response)
      },
      error =>{
        console.error("ERROR IN FETCHING: ", error);
      }
    )
  }

  openModal() {

    this.modalRef = this.modalService.open(CreateModalComponent, {
      modalClass: 'modal-lg',// Optional: specify modal size (e.g., 'modal-sm', 'modal-lg')
    });


    this.modalRef.onClose.subscribe((data) => {
      if (data) {
        const token = this.storageService.getItem("token");
        let user_id;
        if(token!= null){
          var decodeToken:any = this.tokenService.decodeToken(token);
          user_id = decodeToken.id;
        }

        const requestData = {
          ...data, // Spread existing form data
          userId: user_id, // Append userId
        };
        console.log('Form submitted:', requestData);
        this.couponService.createCoupon(requestData).subscribe(
            response => {
              console.log("Server Response: ", response)

            },
            error => {
              console.error("Error In Coupon Create: ",error)
            }
        )


      }
    });
  }
}
