import { Component, Input } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { CouponService } from '../../../../../services/coupon/coupon.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-header bg-white" style="display: flex; justify-content: center; align-items: center;">
  <h5 class="modal-title" style="color: darkslategray;">Create Coupon</h5>
  <button type="button" class="btn-close" aria-label="Close" (click)="close()"></button>
</div>



<div class="modal-body">
  <form #dataForm="ngForm" class="small-form" style="background-color: white; padding: 15px; border-radius: 5px;">
    <div class="row">
      <!-- Price -->
      <div class="col-6 mb-2">
        <label for="price" class="form-label font-weight-bold text-dark">Price</label>
        <input
          type="text"
          id="price"
          name="price"
          class="form-control form-control-sm"
          placeholder="Enter Price"
          [(ngModel)]="formData.price"
          required
          readonly
        />
      </div>

      <!-- CouponCode -->
      <div class="col-6 mb-2">
        <label for="couponCode" class="form-label font-weight-bold text-dark">CouponCode</label>
        <input
          type="text"
          id="couponCode"
          name="couponCode"
          class="form-control form-control-sm"
          placeholder="Enter CouponCode"
          [(ngModel)]="formData.couponCode"
          readonly
        />
      </div>

    <!-- Expired Date and Quantity in same row -->
    <div class="row">
      <div class="col-6 mb-2">
        <label for="expiredDate" class="form-label font-weight-bold text-dark">Expired Date</label>
        <input
          type="date"
          id="expiredDate"
          name="expiredDate"
          class="form-control form-control-sm"
          placeholder="Enter expired date"
          [(ngModel)]="formData.expiredDate"
          [min]="minExpiredDate"
          required
        />
      </div>

      <div class="col-6 mb-2">
        <label for="quantity" class="form-label font-weight-bold text-dark">Quantity</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          class="form-control form-control-sm"
          placeholder="Enter Quantity"
          min="1"
          value="1"
          [(ngModel)]="formData.quantity"
          required
        />
      </div>
    </div>
 <!-- Description -->
 <div class="mb-2">
  <label for="description" class="form-label font-weight-bold text-dark">Description</label>
  <textarea
    id="description"
    name="description"
    class="form-control form-control-sm"
    rows="2"
    placeholder="Enter description"
    [(ngModel)]="formData.description"
    required
  ></textarea>
</div>



<div class="modal-footer">
  <button type="button" class="btn btn-secondary btn-sm" (click)="close()">Close</button>
  <button
    type="button"
    class="btn btn-primary btn-sm"
    [disabled]="!dataForm.valid"
    (click)="submitForm()"
  >
    Save
  </button>
  </div>
</div>

  `,
  styleUrl: './create-modal.component.css'
})
export class CreateModalComponent {
  @Input() productId:any;
  discountprice:any;
  minExpiredDate: string = '';

  generateCouponCode(): string {
   return 'COUPON-' + Math.random().toString(36).substr(2, 8).toUpperCase();
 }
 constructor(public modalRef: MdbModalRef<CreateModalComponent>,
             private couponService:CouponService,) {
 }
 formData: any = { // Default initialization
   productId: 0,
   price: '', // default empty string for price
   couponCode: '',
   description: '',
   expiredDate: '',
   quantity: ''
 };

 ngOnInit(): void {
 // Calculate "today + 7 days"
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 7); // Add 7 days to the current date
    this.minExpiredDate = futureDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD


   this.couponService.getCaculate(this.productId).subscribe(
     response =>{
       this.discountprice = response
       console.log("RES: ",response)
       this.formData = {
         productId:this.productId,
         price: this.discountprice ,
         couponCode: this.generateCouponCode(),
         description: '',
         expiredDate: '',
         quantity: '',

       };
     },
     error =>{
       console.error("create coupon : ERROR IN FETCHING: ", error);
     }
   )}

 close(): void {
   this.modalRef.close();
 }

 submitForm(): void {
   if (this.modalRef) {
     this.modalRef.close(this.formData); // Pass form data on close
   }
 }



}
