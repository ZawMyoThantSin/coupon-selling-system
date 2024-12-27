import { Component, OnInit } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { FormsModule, NgForm } from '@angular/forms';
import { CategoryService } from '../../../../../../services/category/category.service';
import { businessCategory } from '../../../../../../models/business-category';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-modal',
  standalone: true,
  imports: [ FormsModule, CommonModule],
  templateUrl: './create-modal.component.html',
  styleUrl: './create-modal.component.css'
})
export class CreateModalComponent implements OnInit {
  formData = {
    name: '',
    location: '',
    description: '',
    contactNumber: '',
    category: '',
  };

  categories: businessCategory[] = [];

  selectedFile: File | null = null; // For the uploaded file

  constructor(public modalRef: MdbModalRef<CreateModalComponent>,
              private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
      this.loadCategories();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      console.log("No file selected.");
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

