import { Component, OnInit } from '@angular/core';
import { Product } from '../../../../../models/product';
import { ProductService } from '../../../../../services/product/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { EditProductComponent } from '../../edit/edit-product/edit-product.component';

@Component({
  selector: 'app-detail-product',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.css'],
})
export class DetailProductComponent implements OnInit {
  selectedProduct?: Product;
  message: string | null = null;

  modalRef: MdbModalRef<EditProductComponent> | null = null;

  constructor(
    private modalService: MdbModalService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
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
        this.message = 'Product updated successfully.';
      }
    });
  }

  closeModal() {
    this.modalRef?.close();
    this.message = null;
  }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe(() => {
      alert('Product deleted successfully');
      // Optionally navigate away or reset selected product after deletion
      this.selectedProduct = undefined;  // Clear the product details after deletion
      this.router.navigate(['/d/product']);
    }, (error) => {
      console.error(error);
      this.message = 'Error deleting product.';
    });
  }
  
  // New method to navigate back to the product list
  goBackToProductList(): void {
    this.router.navigate(['/product']);
  }
}

