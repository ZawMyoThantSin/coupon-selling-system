import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-admin.component.html',
  styleUrl: './add-admin.component.css'
})
export class AddAdminComponent {
userForm: FormGroup;
showConfirmationModal: boolean = false; // Toggle confirmation modal
 formDataPreview: any = {};

constructor(
  public modalRef: MdbModalRef<AddAdminComponent>,
  private fb: FormBuilder,
  private toastr: ToastrService
) {
  this.userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['ADMIN123']
  });
}
showConfirmation(): void {
  if (this.userForm.invalid) {
    return;
  }

  // Prepare preview data for confirmation modal
  this.formDataPreview = {
    name: this.userForm.value.name,
    email: this.userForm.value.email,
    password: this.userForm.value.password,
  };

  this.showConfirmationModal = true; // Show confirmation modal
}

confirmSubmission(): void {
  if (this.userForm.valid) {
    this.modalRef.close(this.userForm.value); // Pass the form values
  }
  this.showConfirmationModal = false; // Hide confirmation modal
}

cancelSubmission(): void {
  this.showConfirmationModal = false;
  this.modalRef.close();
  this.toastr.info('Submission canceled.');
}
}
