import { Component, OnInit } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../../../services/category/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-category-modal',
  standalone: true,
  imports: [CommonModule,FormsModule],
  template: `
    <div class="modal-header">
    <h5 class="modal-title">Edit Category</h5>
    <button type="button" class="btn-close" aria-label="Close" (click)="close()"></button>
  </div>

  <div class="modal-body">
    <form #categoryForm="ngForm" class="small-form">
      <!-- Category Name -->
      <div class="mb-2">
        <label for="categoryName" class="form-label">Category Name</label>
        <input
          type="text"
          id="categoryName"
          name="name"
          class="form-control form-control-sm"
          placeholder="Enter category name"
          [(ngModel)]="formData.name"
          required
        />
        <div *ngIf="categoryForm.submitted && !categoryForm.controls['name']?.valid" class="invalid-feedback">
          Category name is required.
        </div>
      </div>
    </form>
  </div>

  <div class="modal-footer">
    <button type="button" class="btn btn-secondary btn-sm" (click)="close()">Close</button>
    <button
      type="button"
      class="btn btn-primary btn-sm"
      [disabled]="!categoryForm.valid"
      (click)="submitForm()"
    >
      Save
    </button>
  </div>
  `,
  styleUrl: './edit-category-modal.component.css'
})
export class EditCategoryModalComponent implements OnInit {

  categoryId: number | null = null; // To pass categoryId from parent component
  formData = {
    name: '',
  };

  constructor(
    public modalRef: MdbModalRef<EditCategoryModalComponent>,
    private toastr: ToastrService,
    private categoryService: CategoryService

  ) {}

  ngOnInit(): void {


    if (this.categoryId) {
      this.loadCategoryData();
    }
  }

  loadCategoryData(): void {
    console.log('Category ID:', this.categoryId);
    console.log('Category Name:', this.formData.name);
    this.categoryService.getCategoryById(this.categoryId!).subscribe(
      (category) => {
        this.formData.name = category.name;
      },
      (error) => {
        console.error('Error loading category:', error);
        this.toastr.error('Error loading category data.');
      }
    );
  }

  close(): void {
    this.modalRef.close();
  }

  submitForm(): void {
    if (!this.formData.name) {
      this.toastr.error('Category name is required.');
      return;
    }

    const updatedData = { name: this.formData.name };

    this.categoryService.updateCategory(this.categoryId!, updatedData).subscribe(
      (response) => {
        this.toastr.success('Category updated successfully!', 'Success');
        this.modalRef.close(updatedData); // Pass the updated data to the parent component
      },
      (error) => {
        console.error('Error updating category:', error);
        this.toastr.error('Error in updating category.');
      }
    );
  }
}
