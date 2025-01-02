import { Component } from '@angular/core';
import { businessCategory } from '../../../../models/business-category';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { CategoryService } from '../../../../services/category/category.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-shop',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './create-shop.component.html',
  styleUrl: './create-shop.component.scss'
})
export class CreateShopComponent {
  formData = {
    name: '',
    location: '',
    description: '',
    contactNumber: '',
    category: '',
  };

  categories: businessCategory[] = [];
  previewUrl: string | null = null;
  selectedFile: File | null = null; // For the uploaded file

  constructor(public modalRef: MdbModalRef<CreateShopComponent>,
              private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
      this.loadCategories();
  }



onFileChange(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;

    // Generate a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    this.previewUrl = null;
  }
}


  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      },
    });
  }

  close(): void {
    this.modalRef.close();
  }

  submitForm(): void {

    if (this.modalRef) {
      const formData = new FormData();
      formData.append('name', this.formData.name);
      formData.append('location', this.formData.location);
      formData.append('description', this.formData.description);
      formData.append('contactNumber', this.formData.contactNumber);
      formData.append('categoryId', this.formData.category);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      this.modalRef.close(formData); // Pass FormData to the parent
    }
  }
}
