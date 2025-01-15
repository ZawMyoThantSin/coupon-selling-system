import { Component, OnInit } from '@angular/core';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { CreateCategoryModalComponent } from './create-category/modals/create-category-modal/create-category-modal.component';
import { businessCategory } from '../../../models/business-category';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from '../../../services/category/category.service';
import { JwtService } from '../../../services/jwt.service';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeleteCategoryModalComponent } from './delete-category-modal/delete-category-modal.component';
import { EditCategoryModalComponent } from './edit-category-modal/edit-category-modal.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {

  modalRef: MdbModalRef<CreateCategoryModalComponent> | null = null;
  editmodalRef: MdbModalRef<EditCategoryModalComponent> | null = null;
  categories: businessCategory[] = [];
  searchTerm: string = '';


  constructor(private modalService: MdbModalService,
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private tokenService: JwtService,
    private storageService: StorageService,
    private router: Router

  ){}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      (response) => {
        this.categories = response;
        console.log('Categories: ', response);
      },
      (error) => {
        console.error('Error in fetching categories: ', error);
      }
    );
  }

  openCreateCategoryModal(): void {
    this.modalRef = this.modalService.open(CreateCategoryModalComponent, {
      modalClass: 'modal-md',
    });

    this.modalRef.onClose.subscribe((data) => {
      if (data) {
        const formData = new FormData();

        // Append all fields from the data object
        formData.append('name', data.get('name') || '');

        this.categoryService.createCategory(formData).subscribe(
          (response) => {
            this.toastr.success('Category created successfully!', 'Success');
            this.loadCategories();
          },
          (error) => {
            console.error('Error creating category:', error);
            this.toastr.error('Error in creating category!')
          }
        );
      }
    });
  }



  openEditCategoryModal(categoryId: number): void {
    this.editmodalRef = this.modalService.open(EditCategoryModalComponent, {
      modalClass: 'modal-md',
      data: {
        categoryId: categoryId, // Pass the categoryId to the modal
      },
    });

    this.editmodalRef.onClose.subscribe((updatedData) => {
      if (updatedData) {
        this.loadCategories(); // Refresh the categories list after update
      }
    });
  }

  deleteCategory(categoryId: number): void {
    const modalRef = this.modalService.open(DeleteCategoryModalComponent, {
      modalClass: 'modal-sm',
    });

    modalRef.onClose.subscribe((confirm) => {
      if (confirm) {
        this.categoryService.deleteCategory(categoryId).subscribe(
          () => {
            this.toastr.success('Category deleted successfully!', 'Success');
            this.loadCategories(); // Refresh the list after deletion
          },
          (error) => {
            console.error('Error deleting category:', error);
            this.toastr.error('Failed to delete the category!', 'Error');
          }
        );
      }
    });
  }

  get filteredCategories(): businessCategory[] {
    return this.categories.filter((category) =>
      category.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

}
