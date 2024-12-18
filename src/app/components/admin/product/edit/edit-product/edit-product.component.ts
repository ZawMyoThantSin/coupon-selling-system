import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../../../../services/product/product.service';
import { Product } from '../../../../../models/product';
import { MdbModalService, MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [FormsModule, CommonModule,MdbFormsModule],
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css'],
})
export class EditProductComponent implements OnInit {
  product: Product | null = null; // Initially null until product is loaded
  isLoading: boolean = true;
  errorMessage: string = '';
  modalRef: MdbModalRef<any> | null = null;
  isSaving: boolean = false;

  @ViewChild('editProductModal') editProductModal: any; // Reference to modal template

  constructor(
    private productService: ProductService,
    private modalService: MdbModalService,
    private route: ActivatedRoute,

  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(+productId);
    } else {
      this.errorMessage = 'Product ID not provided';
      this.isLoading = false;
    }
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
        } else {
          this.product = null;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage = 'Failed to load product';
        this.isLoading = false;
      },
    });
  }

  openModal(modalTemplate: any) {
    this.modalRef = this.modalService.open(modalTemplate);
  }

  onSubmit(): void {
    if (this.product && this.product.id) {
      this.isSaving = true;
      this.productService.updateProduct(this.product.id, this.product).subscribe({
        next: (updatedProduct) => {
          this.isSaving = false;
          this.product = updatedProduct;
          alert('Product updated successfully');
          this.modalRef?.close();
          window.location.reload();
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating product:', error);
          this.errorMessage = 'Failed to update product';
        },
      });
    }
  }

  // Close modal safely
  closeModal(): void {
    this.modalRef?.close();

  }


}
