import { Component, Input } from '@angular/core';
import { Product } from '../../../models/product';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { CreateProductModalComponent } from './create-product/modals/create-modal/create-modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product/product.service';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { CreateModalComponent } from './coupon/create-modal/create-modal.component';
import { Coupon } from '../../../models/coupon.modal';
import { StorageService } from '../../../services/storage.service';
import { CouponService } from '../../../services/coupon/coupon.service';
import { JwtService } from '../../../services/jwt.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MdbRippleModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  businessId:any;
  modalRef1: MdbModalRef<CreateModalComponent> | null = null;//
  modalRef: MdbModalRef<CreateProductModalComponent> | null = null;//
  products: Product[] = [];
  coupons: Coupon[] = [];
  newProduct: Product = new Product(0, 0, '', '', 0, '', false, 0, new Date(), new Date(),'');
  message = '';
  isSaving: boolean = false;
  editingProduct: { id: number; field: string } | null = null;
  editableProduct: any = {};
  selectedProduct: Product | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private modalService: MdbModalService,
    private storageService: StorageService,
    private couponService: CouponService,
    private tokenService: JwtService,
    private toastr: ToastrService
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
    if(!this.businessId){
      return;
    }
    this.modalRef = this.modalService.open(CreateProductModalComponent, {
      modalClass: 'modal-lg modal-dialog-centered',
      data:{businessId: this.businessId},
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
          this.toastr.success("Updated Successfully", "Success!")
          this.loadProducts();
        });
      } else {
        this.toastr.warning('No changes to save');
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

  // coupon create modal
  openModal(id:any):void {
    if(!id){
      return
    }
        this.modalRef1 = this.modalService.open(CreateModalComponent, {
          modalClass: 'modal-lg',// Optional: specify modal size (e.g., 'modal-sm', 'modal-lg')
          data:{productId:id}
        });


        this.modalRef1.onClose.subscribe((data) => {
          if (data) {
            const token = this.storageService.getItem("token");
            let user_id;
            if(token!= null){
              var decodeToken:any = this.tokenService.decodeToken(token);
              user_id = decodeToken.id;
            }

            const requestData = {
              ...data, // Spread existing form data
              // userId: user_id, // Append userId
            };
            console.log('Form submitted:', requestData);
            this.couponService.createCoupon(requestData).subscribe(
                response => {
                  console.log("Server Response: ", response)

                },
                error => {
                  console.error("Error In Coupon Create: ",error)
                }
            )


          }
        });
      }

  isEditing(productId: number, field: string): boolean {
    return this.editingProduct?.id === productId && this.editingProduct?.field === field;
  }
  closeEdit(): void {
    this.editingProduct = null; // Exit edit mode
    this.editableProduct = null; // Clear the editable product
  }

  getImageUrl(imagePath: string): string {
    return this.productService.getImageUrl(imagePath);
  }
}
