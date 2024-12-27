import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../../services/payment/payment.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-edit',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './payment-edit.component.html',
  styleUrl: './payment-edit.component.css'
})
export class PaymentEditComponent implements OnInit{
  paymentForm!: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  paymentData: any;
  paymentId: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Initialize the form with validation
    this.paymentForm = this.fb.group({
      payment_type: ['', Validators.required],
      accountName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      qrImage: [''],
    });

    // Prefill the form with data from the service
    this.paymentData = this.paymentService.getPaymentTempData();
    if (this.paymentData) {
      this.paymentForm.patchValue({
        payment_type: this.paymentData.paymentType,
        accountName: this.paymentData.accountName,
        accountNumber: this.paymentData.accountNumber,
      });
      this.imagePreview = this.paymentData.qrImage;
      this.paymentId = this.paymentData.id;
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files?.length) {
      const file = input.files[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string; // Set the base64 string
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      const formData = new FormData();

      formData.append('payment_type', this.paymentForm.get('payment_type')?.value);
      formData.append('accountName', this.paymentForm.get('accountName')?.value);
      formData.append('accountNumber', this.paymentForm.get('accountNumber')?.value);

      if (this.selectedFile) {
        formData.append('qrImage', this.selectedFile, this.selectedFile.name);
      }

      this.paymentService.updatePaymentMethod(this.paymentId, formData).subscribe(
        (response) => {
          this.toastr.success('Updated Successfully!', 'Success');
          this.router.navigate(['d/payments']);
        },
        (error) => {
          console.error('Error submitting payment data:', error);
        }
      );
    }
  }

  getImageUrl(imagePath: string): string {
    return this.paymentService.getImageUrl(imagePath);
  }

  isBase64Image(data: string): boolean {
    return data.startsWith('data:image/');
  }
}
