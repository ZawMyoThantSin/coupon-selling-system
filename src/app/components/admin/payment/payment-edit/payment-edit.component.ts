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
  paymentForm: any;
  imagePreview: any;
  selectedFile: File | null = null;
  paymentData!:any;
  paymentId: number =0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private paymentService: PaymentService // Assuming a service to handle API calls
  ) {}

  ngOnInit(): void {
    // Initialize the form with validation
    this.paymentForm = this.fb.group({
      payment_type: ['', Validators.required],
      accountName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      qrImage: [''],
    });

    // Prefill the form with data from the service (e.g., get payment data by ID)
    this.paymentData = this.paymentService.getPaymentTempData();
    if (this.paymentData) {
          // Prefill the form with the retrieved payment data
          this.paymentForm.patchValue({
            payment_type: this.paymentData.paymentType,
            accountName: this.paymentData.accountName,
            accountNumber: this.paymentData.accountNumber,
    });
      this.imagePreview = this.paymentData.qrImage
      this.paymentId = this.paymentData.id

    }
  }

  // File input change handler to preview the selected file
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files?.length) {
      const file = input.files[0];
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file); // Create a preview URL for the image
    }
  }

  // Submit form and send data to the backend
  onSubmit(): void {
    if (this.paymentForm.valid) {
      const formData = new FormData();

      // Append form data
        formData.append('payment_type', this.paymentForm.get('payment_type')?.value);
        formData.append('accountName', this.paymentForm.get('accountName')?.value);
        formData.append('accountNumber', this.paymentForm.get('accountNumber')?.value);

        // Append the selected file if it exists
        if (this.selectedFile) {
          formData.append('qrImage', this.selectedFile, this.selectedFile.name);
        }


      // // Call the payment service to send the data to the API
      this.paymentService.updatePaymentMethod(this.paymentId,formData).subscribe(
        (response) => {
          // console.log('Payment data successfully submitted:', response);
          this.toastr.success("Updated Successfully!", "Success");
          this.router.navigate(['d/payments']); // Navigate to payments list or dashboard
        },
        (error) => {
          console.error('Error submitting payment data:', error);
          // Handle error, such as showing an error message
        }
      );
    }
  }

  // Get image URL
  getImageUrl(imagePath: string): string {
    return this.paymentService.getImageUrl(imagePath);
  }
}
