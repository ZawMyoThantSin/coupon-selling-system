import { Component, Input } from '@angular/core';
import { Product } from '../../../models/product';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { CreateProductModalComponent } from './create-product/modals/create-modal/create-modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product/product.service';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { CreateModalComponent } from './coupon/create-modal/create-modal.component';
import { Coupon } from '../../../models/coupon.modal';
import { StorageService } from '../../../services/storage.service';
import { CouponService } from '../../../services/coupon/coupon.service';
import { JwtService } from '../../../services/jwt.service';
import { ToastrService } from 'ngx-toastr';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MdbRippleModule,MdbDropdownModule],
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
    private tokenService: JwtService,
    private couponService: CouponService,
    private router: Router,
    private toastr: ToastrService
  ) {}



  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.businessId = Number(params.get('id'));
      this.productService.getAllProducts(this.businessId).subscribe((data: Product[]) => {
        this.products = data;
        this.products = data.filter(product => product.status );
      });

       // Fetch all coupons
       this.couponService.getAllCoupons(this.businessId).subscribe((data: Coupon[]) => {
        this.coupons = data;
      });
    });
  }

  hasCoupon(productId: number): boolean {
    // Check if a coupon exists for the product
    return this.coupons.some(coupon => coupon.productId === productId);
  }

  loadProducts(): void {
    this.productService.getAllProducts(this.businessId).subscribe((data: Product[]) => {

    });
  }

  // Open modal directly with MDB modal service
  navigateToModal(): void {
    if (!this.businessId) {
      return;
    }

    this.modalRef = this.modalService.open(CreateProductModalComponent, {
      modalClass: 'modal-lg modal-dialog-centered',
      data: { businessId: this.businessId },
    });

    this.modalRef.onClose.subscribe((result: any) => {
      if (result) {
        this.loadProducts(); // Reload the product list after closing modal
      }
    });
  }


  toggleEditDiscount(productId: number): void {
    if (this.editingProduct?.id === productId && this.editingProduct?.field === 'discount') {
      this.saveDiscountChanges(productId);
    } else {
      this.editingProduct = { id: productId, field: 'discount' };
      this.editableProduct = { ...this.products.find(p => p.id === productId) };
    }
  }

  saveDiscountChanges(productId: number): void {
    if (this.editableProduct && this.editableProduct.discount !== undefined) {
      this.isSaving = true;
      this.productService.updateDiscount(productId, this.editableProduct.discount).subscribe({
        next: (updatedProduct) => {
          const index = this.products.findIndex(p => p.id === productId);
          if (index !== -1) {
            this.products[index] = updatedProduct;
          }
          this.editingProduct = null;
          this.editableProduct = {};
          this.isSaving = false;

          // Show success alert
          this.toastr.success('Discount updated successfully', 'Success');
        },
        error: (error) => {
          console.error('Error updating discount:', error);
          this.isSaving = false;

          // Show error alert
          this.toastr.error('Failed to update discount', 'Error');
        }
      });
    } else {
      // Show warning if no changes to save
      this.toastr.warning('No changes to save', 'Warning');
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
    this.editingProduct = null;
    this.editableProduct = null;
  }

  getImageUrl(imagePath: string): string {
    return this.productService.getImageUrl(imagePath);
  }

  navigateToProductDetail(productId: number): void {
    if (!this.businessId) {
      console.error('Business ID is not available');
      return;
    }
    localStorage.setItem('currentBusinessId', this.businessId.toString());
    this.router.navigate(['/d/p/detail-product', productId]);
  }


}
