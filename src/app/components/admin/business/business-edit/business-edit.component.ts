import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Business } from '../../../../models/business';
import { BusinessService } from '../../../../services/business/business.service';
import { JwtService } from '../../../../services/jwt.service';
import { StorageService } from '../../../../services/storage.service';

@Component({
  selector: 'app-business-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
  <div class="container vh-75 mt-0 d-flex justify-content-center align-items-center">
  <div class="row shadow p-5 rounded" style="background-color: #f8f9fa; width: 60%;">
    <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="w-100">

    <div class="d-flex justify-content-between">
  <button type="button" class="btn btn-primary btn-sm btn-rounded me-2" (click)="goBack()">
    <i class="fas fa-arrow-left me-2"></i> Go Back
  </button>
</div>

      <h3 class="text-center mb-4 text-primary">Edit Business</h3>


      
        <!-- Image Upload Section -->
        <div class="col-md-12 mb-3">
          <!-- Existing Image Preview -->
          <div class="mt-3 mb-3" *ngIf="imagePreview || business?.photo">
            <img 
              [src]="imagePreview || getImageUrl(business.photo)" 
              alt="Image Preview" 
              class="img-thumbnail" 
              style="max-width: 200px; max-height: 200px;" 
            />
          </div>
          <!-- Image Upload Input -->
          <div class="form-outline">
            <input
              type="file"
              id="businessImage"
              class="form-control"
              (change)="onImageChange($event)"
              accept="image/*"
            />
            <label for="businessImage" class="form-label">Business Image</label>
          </div>
          
          <!-- Error message -->
          <div *ngIf="imageError" class="text-danger mt-2">
            {{ imageError }}
          </div>
        </div>

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
  business!: Business;
  imagePreview: string | ArrayBuffer | null = null;
  imageFile: File | null = null;
  imageError: string | null = null;
  token! :string | null ;
  userId!:any ;
  businesses: any[] | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    private tokenService: JwtService,
     private jwtService: JwtService,
     private storageService: StorageService,
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.maxLength(500)],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      category: ['', Validators.required],
      status: [false],
      userName: [{ value: '', disabled: true }],
      userEmail: [{value:'',disabled: true}],
    });

    this.businessId = +this.route.snapshot.paramMap.get('id')!;

    this.token = this.storageService.getItem("token");
    if (this.token) {
      this.userId = this.jwtService.getUserId(this.token);
      this.businessService.getAllBusiness(this.userId).subscribe(
        response => {
          this.businesses = response;
          console.log("RES: ", response);
        },
        error => {
          console.error("ERROR IN FETCHING: ", error);
        }
      );
    } else {
      console.error("No token found");
      this.router.navigate(['/login']); 
    }

    this.businessService.getById(this.businessId).subscribe(
      (response: Business) => {
        this.business = response;
        this.editForm.patchValue(response);
      },
      (error) => {
        console.error('Error fetching business data:', error);
        this.router.navigate(['/']);
      }
    );
  }


  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.imageError = 'Only image files are allowed.';
        return;
      }

      this.imageError = null;
      if (this.business) {
        this.business.imageFile= file; // Assign the file object here
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
      console.log('Uploaded File Name:', file.name);
    }
  }

  getImageUrl(imagePath: string): string {
    return this.businessService.getImageUrl(imagePath);
  }
  


  onSubmit(): void {
    if (this.editForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    
    const formData = new FormData();
    const formValue=this.editForm.value;
    formData.append('name', formValue.name ?? ''); 
    formData.append('userId',this.userId ?? '');
    formData.append('location', formValue.location ?? '');
    formData.append('description', formValue.description ?? '');
    formData.append('contactNumber', formValue.contactNumber ?? '');
    formData.append('category', formValue.category ?? '');
   


// If there's a new image file
if (this.business.imageFile) {
  formData.append('imageFile', this.business.imageFile, this.business.imageFile.name);
}

    this.businessService.update(this.businessId, formData).subscribe(
      success => {
        console.log('Business updated successfully');
        this.router.navigate(['/d/business']);
      },
      error => console.error('Error updating business:', error)
    );
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/d/business']); 
  }
  
}
