import { Component, ViewChild } from '@angular/core';
import { ProductService } from '../../../../services/product/product.service';
import {FormsModule,NgForm } from '@angular/forms';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { CommonModule } from '@angular/common';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-excel-import',
  standalone: true,
  imports: [CommonModule, FormsModule, MdbFormsModule],
  template: `
  <div class="card shadow-sm">
    <div class="card-header bg-light">
      <h3 class="modal-title mb-0">Import Products From Excel</h3>
    </div>
    <div class="card-body">
      <form #importForm="ngForm">
        <div class="row mb-4">
          <div class="col-md-12">
            <mdb-form-control>
              <input
                type="file"
                id="excelFile"
                class="form-control"
                (change)="onFileSelected($event)"
                accept=".xlsx, .xls"
                required
              />
            </mdb-form-control>
            <div
              *ngIf="fileError"
              class="text-danger mt-2">
              {{ fileError }}
            </div>
          </div>
        </div>
      </form>

      <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        (click)="closeModal()"
      >
        Close
      </button>
      <button
        type="button"
        class="btn btn-outline-primary btn-sm ms-2"
        [disabled]="isUploading || !selectedFile"
        (click)="uploadFile()"
      >
        {{ isUploading ? 'Uploading...' : 'Upload File' }}
      </button>
    </div>
  </div>
  <div *ngIf="message" class="alert" [ngClass]="{'alert-success': !isError, 'alert-danger': isError}" role="alert">
    {{ message }}
  </div>
`,
styles: [`
  .card {
    margin: 20px;
  }
`]
})
export class ExcelImportComponent {
  @ViewChild('importForm') importForm!: NgForm;

  selectedFile: File | null = null;
  message: string = '';
  isError: boolean = false;
  fileError: string = '';
  isUploading: boolean = false;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService,
    public modalRef: MdbModalRef<ExcelImportComponent>
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['.xlsx', '.xls'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (allowedTypes.includes(`.${fileExtension}`)) {
        this.selectedFile = file;
        this.fileError = '';
      } else {
        this.fileError = 'Please select a valid Excel file (.xlsx or .xls)';
        this.selectedFile = null;
      }
    }
  }
  uploadFile() {
    if (this.selectedFile) {
      this.isUploading = true;
      this.productService.uploadExcel(this.selectedFile).subscribe(
        response => {
          this.toastr.success('File uploaded successfully!', 'Success');
          this.isUploading = false;
          this.modalRef.close(); // Close modal after success
          window.location.reload();
        },
        error => {
          this.toastr.error('Failed to upload file: ' + error.error, 'Error');
          this.isUploading = false;
        }
      );
    }
  }


  closeModal() {
    this.modalRef.close();
  }

}
