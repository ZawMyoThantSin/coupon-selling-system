import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Business } from '../../../../models/business';
import { businessCategory } from '../../../../models/business-category';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../../../services/business/business.service';
import { JwtService } from '../../../../services/jwt.service';
import { StorageService } from '../../../../services/storage.service';
import { CategoryService } from '../../../../services/category/category.service';

@Component({
  selector: 'app-edit-shop',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule ],
  templateUrl: './edit-shop.component.html',
  styleUrl: './edit-shop.component.css'
})
export class EditShopComponent implements OnInit{
  editForm!: FormGroup;
    businessId!: number;
    business!: Business;
    imagePreview: string | ArrayBuffer | null = null;
    imageFile: File | null = null;
    imageError: string | null = null;
    token! :string | null ;
    userId!:any ;
    businesses: any[] | null = null;

    categories: businessCategory[] = [];

    constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private businessService: BusinessService,
       private jwtService: JwtService,
       private storageService: StorageService,
       private categoryService: CategoryService
    ) {}


  ngOnInit(): void {
      this.editForm = this.fb.group({
        name: ['', Validators.required],
        location: ['', Validators.required],
        description: ['', Validators.maxLength(500)],
        contactNumber: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
        category: ['', Validators.required],
        status: [false],
        userName: [{ value: '', disabled: true }],
        userEmail: [{value:'',disabled: true}],
      });

      this.loadCategories();

      this.businessId = +this.route.snapshot.paramMap.get('id')!;

      this.token = this.storageService.getItem("token");
      if (this.token) {
        this.userId = this.jwtService.getUserId(this.token);
        this.businessService.getAllBusiness(this.userId).subscribe(
          response => {
            this.businesses = response;
            console.log("RES: ", this.businesses);
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
          this.setCategoryIfBusinessLoaded();
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
      formData.append('categoryId', formValue.category ?? '');



  // If there's a new image file
  if (this.business.imageFile) {
    formData.append('imageFile', this.business.imageFile, this.business.imageFile.name);
  }

      this.businessService.update(this.businessId, formData).subscribe(
        success => {
          console.log('Business updated successfully');
          this.router.navigate(['/o/shop', this.businessId]);
        },
        error => console.error('Error updating business:', error)
      );
    }

    onCancel(): void {
      this.router.navigate(['/']);
    }

    goBack(): void {
      this.router.navigate(['/o/shop', this.businessId]);
    }




    loadCategories(): void {
      this.categoryService.getAllCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
          this.setCategoryIfBusinessLoaded();
        },
        error: (error) => {
          console.error('Error fetching categories:', error);
        },
      });
    }

    setCategoryIfBusinessLoaded(): void {
      if (this.business && this.categories.length > 0) {
        const selectedCategory = this.categories.find(
          (category) => category.id === this.business.categoryId
        );
        if (selectedCategory) {
          this.editForm.get('category')?.setValue(selectedCategory.id);
          console.log("Selected Category from Business:", selectedCategory);
        }
      }
    }


  }
