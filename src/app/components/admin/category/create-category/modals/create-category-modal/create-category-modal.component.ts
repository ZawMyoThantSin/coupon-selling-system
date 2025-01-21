import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-category-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-category-modal.component.html',
  styleUrl: './create-category-modal.component.css'
})
export class CreateCategoryModalComponent {

  showConfirmationModal: boolean = false;

  formData = {
    name: '',
  };

  selectedFile: File | null = null; // For the uploaded icon file
  constructor(public modalRef: MdbModalRef<CreateCategoryModalComponent>,
              private toastr : ToastrService,
  ) {}

  close(): void {
    this.modalRef.close();
  }

  submitForm(): void {
    if (!this.formData.name) {
      this.toastr.error('Name is required.')
      alert('Name is required.');
      return;
    }
    this.showConfirmationModal = true;
  }
  confirmSubmission(): void {
    const formData = new FormData();
    formData.append('name', this.formData.name);
    this.modalRef.close(formData); // Pass FormData to the parent
  }
  
  cancelSubmission(): void {
    this.showConfirmationModal = false;
    this.toastr.info('Submission canceled.');
  }
}
