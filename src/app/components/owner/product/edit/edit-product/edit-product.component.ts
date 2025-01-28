import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../../../../services/product/product.service';
import { Product } from '../../../../../models/product';
import { MdbModalService, MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [FormsModule, CommonModule,MdbFormsModule],
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css'],
})
export class EditProductComponent implements OnInit {
  product: Product | null = null; // Initially null until product is loaded
  updatedProduct: {
    businessId: number | null,
    name: string;
    price: number | null;
    discount: number | null;
    description: string;
    imageFile: File | null; // Allow File or null
  } = {
    businessId: null,
    name: '',
    price: null,
    discount: null,
    description: '',
    imageFile: null // Initialize as null
  };
  productId: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';
  isSaving: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;
  imageError: string | null = null;

  @ViewChild('editProductModal') editProductModal: any; // Reference to modal template

  constructor(
    private router: Router,
    private productService: ProductService,
    private modalService: MdbModalService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    public modalRef: MdbModalRef<EditProductComponent>,
    private cdr: ChangeDetectorRef //
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

  loadProduct(id: any): void {
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

      // Prepare FormData for the request
      const formData = new FormData();
    formData.append('name', this.product.name ?? ''); // Default to empty string if name is null/undefined
    formData.append('price', this.product.price?.toString() ?? '0'); // Default to '0'
    formData.append('discount', this.product.discount?.toString() ?? '0'); // Default to '0'
    formData.append('description', this.product.description ?? '');

     // Only append imageFile if a new file is selected
     if (this.product.imageFile) {
      formData.append('imageFile', this.product.imageFile);
    }

    this.productService.updateProduct(this.product.id, formData).subscribe({
      next: (updatedProduct) => {
        this.isSaving = false;
        this.product = updatedProduct;
        this.toastr.success('Product updated successfully!', 'Success'); // Toastr for success
        this.loadProduct(updatedProduct.id);
        this.router.navigate(['/o']).then(() => {
          this.router.navigate(['/o/p/detail-product/', updatedProduct.id]);
        });
        this.closeModal();

      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error updating product:', error);
        this.toastr.error('Failed to update product', 'Error'); // Toastr for error
        this.errorMessage = 'Failed to update product';
      },
      });
    }
  }


  // Close modal safely
  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
    } else {
      console.log('Modal reference is not defined!');
    }
  }


  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.imageError = 'Only image files are allowed.';
        return;
      }

      this.imageError = null;
      if (this.product) {
        this.product.imageFile= file; // Assign the file object here
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
    return this.productService.getImageUrl(imagePath);
  }

}
