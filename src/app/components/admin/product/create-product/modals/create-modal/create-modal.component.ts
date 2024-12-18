import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../../../../models/product';
import { ProductService } from '../../../../../../services/product/product.service';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [FormsModule, CommonModule, MdbFormsModule],
  templateUrl: './create-modal.component.html',
  styleUrls: ['./create-modal.component.css']
})
export class CreateProductModalComponent implements OnInit {
  @Input() businessId!: number;
  products: Product[] = [];
  newProduct: {
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
  message = '';
  isSaving: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;
  imageError: string | null = null;

  constructor(
    private productService: ProductService,
    public modalRef: MdbModalRef<CreateProductModalComponent>,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.businessId) {
      this.newProduct.businessId = this.businessId;
    } else {
      alert('Business ID is not available. Cannot create product.');
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
      this.newProduct.imageFile = file; // Assign the file object here
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }


  saveProduct(productForm: NgForm): void {
    if (productForm.valid && this.newProduct.imageFile) {
      this.isSaving = true;
      //this.newProduct.businessId = 1;
      //const i = this.route.snapshot.paramMap.get('id');
      //console.log("id",i)
      const formData = new FormData();
      formData.append('businessId', this.newProduct.businessId!.toString());
      formData.append('name', this.newProduct.name);
      formData.append('price', this.newProduct.price!.toString());
      formData.append('discount', this.newProduct.discount!.toString());
      formData.append('description', this.newProduct.description);
      formData.append('imageFile', this.newProduct.imageFile);

      this.productService.createProduct(formData).subscribe({
        next: () => {
          this.message = 'Product saved successfully!';
          this.resetForm(productForm);
          this.closeModal();
        },
        error: () => {
          this.message = 'Failed to save product.';
        },
        complete: () => {
          this.isSaving = false;
          setTimeout(() => (this.message = ''), 3000);
          window.location.reload(); // Reload the window after completion
        }
      });
    } else {
      this.message = 'Please fill in all required fields and upload an image.';
    }
  }

  closeModal(createProduct?: Product): void {
    this.modalRef?.close(createProduct);
  }

  resetForm(productForm: NgForm): void {
    productForm.resetForm();
    this.imagePreview = null;
    this.newProduct = {
      businessId:0,
      name: '',
      price: null,
      discount: null,
      description: '',
      imageFile: null
    };
  }

  onSubmit(productForm: NgForm): void {
    this.saveProduct(productForm);
  }
}
