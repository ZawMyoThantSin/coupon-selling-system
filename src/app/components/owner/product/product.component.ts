import { Component, Input, OnInit} from '@angular/core';
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
import { ClientSideRowModelModule, ColDef, ColumnAutoSizeModule, GridApi, GridOptions, GridReadyEvent, GridSizeChangedEvent, ModuleRegistry, RenderApiModule, RowModelType, ValidationModule } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { ExcelImportComponent } from './excel-import/excel-import.component';


ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, ValidationModule,RenderApiModule ]);

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MdbRippleModule,MdbDropdownModule,AgGridModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit{
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
  private gridApi!: GridApi;


  allProducts: Product[] = [];

  currentPage = 1;
  totalPages = 10;
  
  paginationPageSize = 7;
  paginationPageSizeSelector = [7, 10, 15];

  gridOptions: GridOptions = {
    theme: 'legacy',
    pagination: true,
    paginationPageSize: this.paginationPageSize,
    paginationPageSizeSelector: this.paginationPageSizeSelector,
    defaultColDef: {
      resizable: false,
      sortable: true,
      filter: true,
      
    },
    rowModelType: 'clientSide' ,
    rowHeight: 62, 
    domLayout: 'normal', 
    onGridReady: (params) => {
      this.gridApi = params.api;
      this.updatePagination();
    },
    onFirstDataRendered: (params) => {
      this.updatePagination();
    }
     
    
  };
  
  columnDefs: ColDef[] = [
    {
      field: 'imagePath',
      headerName: 'Photo',
      width: 100,
      cellRenderer: (params: any) => {
        const imageUrl = this.getImageUrl(params.value);
        return `
          <img
            src="${imageUrl}"
            alt="${params.data.name}"
            style="width: 45px; height: 45px;"
            class="rounded-circle border"
          />
        `;
      }
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      valueFormatter: (params) => `${params.value} kyat`
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      valueFormatter: (params) => params.value ? 'Active' : 'Inactive'
    },
    {

        field: 'discount',
        headerName: 'Discount',
        width: 150,
        cellRenderer: (params: any) => {
          const container = document.createElement('div');

          // Check if the current product is being edited
          const isEditing = this.isEditing(params.data.id, 'discount');

          if (isEditing) {
            container.innerHTML = `
              <div class="d-flex align-items-center">
                <input
                  type="number"
                   value="${this.editableProduct.discount || params.value}"
                  class="form-control discount-input"
                  style="width: 70px; margin-right: 8px;"
                />
                <button class="btn btn-primary btn-sm save-discount-btn" ${this.isSaving ? 'disabled' : ''}>
                  Save
                </button>
              </div>
            `;

            // Add event listeners for input and save button
            const input = container.querySelector('.discount-input') as HTMLInputElement;
            const saveBtn = container.querySelector('.save-discount-btn') as HTMLButtonElement;

            if (input) {
              input.addEventListener('input', (event: any) => {
                const value = parseFloat(event.target.value || '0');
                if (value < 0) {
                  input.value = '0'; // Reset input to 0 if a negative value is entered
                } else {
                  this.editableProduct.discount = value;
                }
              });
            }

            if (saveBtn) {
              saveBtn.addEventListener('click', () => {
                this.saveDiscountChanges(params.data.id);
              });
            }
          } else {
            container.innerHTML = `
              <div class="d-flex align-items-center">
                <span style="margin-right: 8px;">${params.value}%</span>
                <button class="btn btn-link edit-discount-btn p-0" ${this.isSaving ? 'disabled' : ''}>
                  <i class="fas fa-edit text-warning"></i>
                </button>
              </div>
            `;

            // Add event listener for the edit button
            const editBtn = container.querySelector('.edit-discount-btn') as HTMLButtonElement;
            if (editBtn) {
              editBtn.addEventListener('click', () => {
                this.toggleEditDiscount(params.data.id);
              });
            }
          }

          return container;
        }
      },

      {
        headerName: 'Actions',
        width: 200,
        cellRenderer: (params: any) => {
          const productId = params.data.id;
          const product = this.products.find(p => p.id === productId);
          const hasValidDiscount = product && product.discount > 0;
          const hasCoupon = this.hasCoupon(productId);

          // Conditionally render the buttons
          return `
            <button class="btn btn-info btn-sm product-detail-btn">
              <i class="fas fa-info-circle"></i>
            </button>
            ${hasValidDiscount && !hasCoupon ? `
              <button class="btn btn-success btn-sm create-coupon-btn">
                <i class="fas fa-tag"></i> Create Coupon
              </button>` : `
              <button class="btn btn-secondary btn-sm coupon-disabled-btn" >
                <i class="fa-solid fa-ban"></i>
              </button>`
            }
          `;
        },

        onCellClicked: (params: any) => {
          if (params.event.target.closest('.product-detail-btn')) {
            this.navigateToProductDetail(params.data.id);
          } else if (params.event.target.closest('.create-coupon-btn')) {
            this.openModal(params.data.id);
          }
        },
      }
  ];

  subscriptions: any;
  //modalRef1: MdbModalRef<CreateModalComponent> | undefined ;
  modalRef2: MdbModalRef<ExcelImportComponent> | undefined;
  hasNextPage: boolean | undefined;
  hasPreviousPage: boolean | undefined;
pagination: true | undefined;

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
        
        this.allProducts = data.filter(product => product.status );
        this.updatePagination();
      });

       // Fetch all coupons
       this.couponService.getAllCoupons(this.businessId).subscribe((data: Coupon[]) => {
        this.coupons = data;
      });
    });
  }


  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setGridOption('rowData', this.products);
    this.gridApi.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  hasCoupon(productId: number): boolean {
    // Check if a coupon exists for the product and if the discount is greater than 0
    const product = this.products.find(product => product.id === productId);
    return !!product && product.discount > 0 && this.coupons.some(coupon => coupon.productId === productId);
  }

  loadProducts(): void {
    if (this.businessId) {
      this.productService.getAllProducts(this.businessId).subscribe((data: Product[]) => {
        this.products = data.filter(product => product.status);
        if (this.gridApi) {
          this.gridApi.setGridOption('rowData', this.products);
        }
      });
    }
  }

  updatePagination(): void {
    const totalItems = this.allProducts.length; 
    this.totalPages = Math.ceil(totalItems / this.paginationPageSize);
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;

    const startIndex = (this.currentPage - 1) * this.paginationPageSize;
    const endIndex = startIndex + this.paginationPageSize;
    this.products = this.allProducts.slice(startIndex, endIndex);
  }


  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page
    this.updatePagination();
  }

  onNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
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
      this.closeEdit(); // Close edit mode if already editing the same product
    } else {
      this.editingProduct = { id: productId, field: 'discount' };
      const product = this.products.find((p) => p.id === productId);
      this.editableProduct = { ...product }; // Deep clone to avoid mutating the original data
      this.gridApi.refreshCells({ force: true });
    }
  }


  // Save Discount Changes
saveDiscountChanges(productId: number): void {
  if (this.editableProduct && this.editableProduct.discount !== undefined) {
     if (this.editableProduct.discount < 0) {
      this.toastr.warning('Discount cannot be less than 0', 'Warning');
      return;
}


this.isSaving = true;
this.productService.updateDiscount(productId, this.editableProduct.discount).subscribe({
  next: (updatedProduct) => {
    const index = this.products.findIndex(p => p.id === productId);
    if (index !== -1) {
      this.products[index] = updatedProduct; // Update the product in the array
      this.gridApi.setGridOption('rowData', this.products);
    }
    this.closeEdit();
    this.isSaving = false;
    this.toastr.success('Discount updated successfully', 'Success');
    window.location.reload();
  },
  error: (error) => {
    console.error('Error updating discount:', error);
    this.isSaving = false;
    this.toastr.error('Failed to update discount', 'Error');
  }
});
} else {
this.toastr.warning('No changes to save', 'Warning');
}
}


// coupon create modal
openModal(id: any): void {
  const product = this.products.find(p => p.id === id);
  if (!product || product.discount === 0) {
    this.toastr.warning('Cannot create coupon for products with no discount', 'Warning');
    return;
  }

  this.modalRef1 = this.modalService.open(CreateModalComponent, {
    modalClass: 'modal-lg',
    data: { productId: id },
  });

  this.modalRef1.onClose.subscribe((data) => {
    if (data) {
      const token = this.storageService.getItem('token');
      let user_id;
      if (token != null) {
        const decodeToken: any = this.tokenService.decodeToken(token);
        user_id = decodeToken.id;
      }

      const requestData = {
        ...data,
      };

      this.couponService.createCoupon(requestData).subscribe(
        (response) => {
          console.log('Server Response: ', response);
          window.location.reload();
        },
        (error) => {
          console.error('Error In Coupon Create: ', error);
        }
      );
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
    this.router.navigate(['/o/p/detail-product', productId]);
  }


  openExcelImportModal() {
    this.modalRef2 = this.modalService.open(ExcelImportComponent, {
      modalClass: 'modal-lg modal-dialog-centered',
      data: { businessId: this.businessId },
    });

    this.modalRef2.onClose.subscribe((result: any) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

}
