import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Business } from '../../../../models/business';
import { BusinessService } from '../../../../services/business/business.service';

@Component({
  selector: 'app-business-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
  <div class="container vh-75 mt-0 d-flex justify-content-center align-items-center">
  <div class="row shadow p-5 rounded" style="background-color: #f8f9fa; width: 60%;">
    <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="w-100">
      <h3 class="text-center mb-4 text-primary">Edit Business</h3>

      <!-- Owner Name and Email (in one row) -->
      <div class="row-inline">
        <div class="form-outline">
          <input id="userName" type="text" class="form-control " formControlName="userName" placeholder=" "  />
          <label for="userName" class="form-label">Owner Name</label>
        </div>

        <div class="form-outline">
          <input id="userEmail" type="email" class="form-control" formControlName="userEmail" placeholder=" "  />
          <label for="userEmail" class="form-label">Owner Email</label>
        </div>
      </div>

      <!-- Other Form Fields -->
      <div class="form-outline">
        <input id="name" type="text" class="form-control" formControlName="name" placeholder=" " />
        <label for="name" class="form-label">Business Name</label>
        <small class="text-danger" *ngIf="editForm.get('name')?.invalid && editForm.get('name')?.touched">
          Business Name is required.
        </small>
      </div>

      <div class="form-outline">
        <input id="location" type="text" class="form-control" formControlName="location" placeholder=" " />
        <label for="location" class="form-label">Location</label>
        <small class="text-danger" *ngIf="editForm.get('location')?.invalid && editForm.get('location')?.touched">
          Location is required.
        </small>
      </div>

      <div class="form-outline">
        <textarea id="description" class="form-control" formControlName="description" placeholder=" "></textarea>
        <label for="description" class="form-label">Description</label>
        <small class="text-danger" *ngIf="editForm.get('description')?.invalid && editForm.get('description')?.touched">
          Description must be less than 500 characters.
        </small>
      </div>

      <div class="form-outline">
        <input id="contactNumber" type="text" class="form-control" formControlName="contactNumber" placeholder=" " />
        <label for="contactNumber" class="form-label">Contact Number</label>
        <small class="text-danger" *ngIf="editForm.get('contactNumber')?.invalid && editForm.get('contactNumber')?.touched">
          Please enter a valid 10-digit contact number.
        </small>
      </div>

      <!-- Category as a Select Box -->
      <div class="form-outline">
      <label for="contactNumber" class="form-label">Category</label>
        <select id="category" class="form-control" formControlName="category">
          <option disabled selected>Select Category</option>
          <option value="hotel">Hotel</option>
          <option value="restaurant">Restaurant</option>
          <option value="spa">Spa</option>
        </select>
      </div>

      <div class="text-center">
        <button type="submit" class="btn btn-primary w-100" [disabled]="editForm.invalid">Update</button>
      </div>
    </form>
  </div>
</div>

  `,
  styleUrl: './business-edit.component.css'
})
export class BusinessEditComponent implements OnInit{
  editForm!: FormGroup;
  businessId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService
  ) {}

  ngOnInit(): void {
    // Initialize the form to prevent undefined errors
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.maxLength(500)],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      category: ['', Validators.required],
      status: [false],
      userName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
    });

    // Get the business ID from the route
    this.businessId = +this.route.snapshot.paramMap.get('id')!;

    // Fetch the business data from the service
    this.businessService.getById(this.businessId).subscribe(
      (response: Business) => {
        // Populate the form with business data
        this.editForm.patchValue(response);
      },
      (error) => {
        console.error('Error fetching business data:', error);
        // Handle error, e.g., navigate back or show an error message
        this.router.navigate(['/']);
      }
    );
  }

  onCancel(): void {
    this.router.navigate(['/']); // Navigate back to the main page or listing page
  }
  onSubmit(): void {
    if (this.editForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const updatedData = this.editForm.value;
    console.log('Updated Business Data:', updatedData);

    // Perform update logic here, such as calling a service
    // this.businessService.update(this.businessId, updatedData).subscribe(
    //   success => {
    //     console.log('Business updated successfully');
    //     this.router.navigate(['/business-list']); // Navigate to the list page
    //   },
    //   error => console.error('Error updating business:', error)
    // );
  }
}
