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

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {

  modalRef: MdbModalRef<CreateCategoryModalComponent> | null = null;
  categories: businessCategory[] = [];


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

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe(
        () => {
          this.toastr.success('Category deleted successfully!', 'Success');
          this.loadCategories(); // Refresh the list after deletion
        },
        (error) => {
          console.error('Error deleting category:', error);
        }
      );
    }
  }

}
