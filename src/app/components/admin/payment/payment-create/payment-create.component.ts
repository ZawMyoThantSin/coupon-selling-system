import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../../../services/payment/payment.service';
import { ToastrService } from 'ngx-toastr';
import { MdbTabChange, MdbTabsComponent, MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-create',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,MdbTabsModule,],
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]

})
export class PaymentCreateComponent {

  paymentForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder,
              private paymentService: PaymentService,
              private toastr: ToastrService,
              private router: Router
  ) {
    this.paymentForm = this.fb.group({
      payment_type: ['', Validators.required],
      accountName: ['', Validators.required],
      accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (!validImageTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP).');
        this.selectedFile = null;
        this.imagePreview = null;
        input.value = ''; // Clear the input field
        return;
      }

      this.selectedFile = file;

      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('payment_type', this.paymentForm.value.payment_type);
    formData.append('accountName', this.paymentForm.value.accountName);
    formData.append('accountNumber', this.paymentForm.value.accountNumber);
    if (this.selectedFile) {
      formData.append('qr_image', this.selectedFile, this.selectedFile.name);
    }
    this.paymentService.addPaymentMethod(formData).subscribe((res) => {
      this.toastr.success("Payment Added Successfully!", "Success");
      this.router.navigate(['d/payments'])
      this.paymentForm.reset();
      this.selectedFile = null;
      this.imagePreview = null;
    }, err => {
      this.toastr.error("Error In Creating Payment", "Error");
    });
  }
}
