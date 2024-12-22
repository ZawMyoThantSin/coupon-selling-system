import { Component, OnInit } from '@angular/core';
import { Product } from '../../../../../models/product';
import { ProductService } from '../../../../../services/product/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { EditProductComponent } from '../../edit/edit-product/edit-product.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-detail-product',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.css'],
})
export class DetailProductComponent implements OnInit {
  selectedProduct: Product | undefined;
  message: string | null = null;

  modalRef: MdbModalRef<EditProductComponent> | null = null;

  constructor(
    private modalService: MdbModalService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    if (productId) {
      this.loadProductDetails(productId);
    }
  }

  loadProductDetails(id: number): void {
    this.productService.getProductById(id).subscribe((product) => {
      if (product) {
        this.selectedProduct = product;
      } else {
        console.error('Product not found');
        this.toastr.error('Product not found.', 'Error');
        this.selectedProduct = undefined;
      }
    });
  }

  openEditModal(product: Product): void {
    this.modalRef = this.modalService.open(EditProductComponent, {
      data: { product: { ...product } },
    });

    this.modalRef.onClose.subscribe((updatedProduct: Product | null) => {
      if (updatedProduct) {
        this.selectedProduct = updatedProduct;
        this.toastr.success('Product updated successfully.', 'Success');
      }
    });
  }

  closeModal() {
    this.modalRef?.close();
    this.message = null;
  }

  deleteProduct(id: number): void {
   const businessId=localStorage.getItem('currentBusinessId');
   if (!businessId) {
    console.error('Business ID not found in localStorage');
    this.toastr.error('Cannot delete product: Business ID is missing.', 'Error');
    return;
  }

  this.productService.deleteProduct(id).subscribe({
    next: () => {
      this.toastr.success('Product deleted successfully.', 'Success');
      this.router.navigate(['/d/b/detail', businessId]);
    },
    error: (error) => {
      console.error(error);
      this.toastr.error('Error deleting product.', 'Error');
    }
    });
  }


  goBack() {
    const businessId = localStorage.getItem('currentBusinessId');
    if (businessId) {
      this.router.navigate(['/d/b/detail', businessId]);
    } else {
      console.error('Business ID not found in localStorage');
      this.toastr.warning('Business ID not found. Redirecting to home.', 'Warning');
      this.router.navigate(['']);
    }
  }

  getImageUrl(imagePath: string): string {
    return this.productService.getImageUrl(imagePath);
  }
}
