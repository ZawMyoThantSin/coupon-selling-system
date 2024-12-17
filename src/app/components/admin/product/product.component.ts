import { Component, Input } from '@angular/core';
import { Product } from '../../../models/product';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { CreateProductModalComponent } from './create-product/modals/create-modal/create-modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product/product.service';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MdbRippleModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  businessId:any;
  modalRef: MdbModalRef<CreateProductModalComponent> | null = null;//
  products: Product[] = [];
  newProduct: Product = new Product(0, 0, '', '', 0, '', false, 0, new Date(), new Date());
  message = '';
  isSaving: boolean = false;
  editingProduct: { id: number; field: string } | null = null;
  editableProduct: any = {};
  selectedProduct: Product | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private modalService: MdbModalService,
  ) {}



  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.businessId = Number(params.get('id'));
      this.productService.getAllProducts(this.businessId).subscribe((data: Product[]) => {
        this.products = data;
      });
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts(this.businessId).subscribe((data: Product[]) => {
      this.products = data;
    });
  }

  // Open modal directly with MDB modal service
  navigateToModal(): void {
    this.modalRef = this.modalService.open(CreateProductModalComponent, {
      modalClass: 'modal-lg modal-dialog-centered',
    });

    this.modalRef.onClose.subscribe((result: any) => {
      if (result) {
        this.loadProducts(); // Reload the product list after closing modal
      }
    });
  }


  toggleEdit(productId: number, field: string): void {
    if (this.editingProduct?.id === productId && this.editingProduct?.field === field) {
      if (this.editableProduct) {
        this.productService.updateProduct(productId, this.editableProduct).subscribe(() => {
          this.editingProduct = null;
          alert('Changes saved successfully');
          this.loadProducts();
        });
      } else {
        alert('No changes to save');
      }
    } else {
      this.editingProduct = { id: productId, field };
      this.productService.getProductById(productId).subscribe({
        next: (product) => {
          if (product) {
            this.editableProduct = { ...product };
          } else {
            alert('Product not found');
          }
        },
        error: () => alert('Failed to fetch product for editing'),
      });
    }
  }

  isEditing(productId: number, field: string): boolean {
    return this.editingProduct?.id === productId && this.editingProduct?.field === field;
  }

}
