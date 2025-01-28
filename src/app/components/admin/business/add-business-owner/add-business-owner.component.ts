import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-business-owner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
  <div class="modal-header">
  <h5 class="modal-title">Add Business Owner</h5>
  <button type="button" class="btn-close" aria-label="Close" (click)="modalRef.close()"></button>
</div>
<div class="modal-body">

<form [formGroup]="userForm" (ngSubmit)="showConfirmation()">

    <div class="mb-3">
      <label for="name" class="form-label">Username</label>
      <input
        type="text"
        id="name"
        class="form-control"
        placeholder="Enter username"
        formControlName="name"
        [class.is-invalid]="userForm.get('name')?.invalid && userForm.get('name')?.touched"
      />
      <div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched" class="invalid-feedback">
        <div *ngIf="userForm.get('name')?.errors?.['required']">Username is required.</div>
      </div>
    </div>
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input
        type="email"
        id="email"
        class="form-control"
        placeholder="Enter email"
        formControlName="email"
        [class.is-invalid]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
      />
      <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="invalid-feedback">
        <div *ngIf="userForm.get('email')?.errors?.['required']">Email is required.</div>
        <div *ngIf="userForm.get('email')?.errors?.['email']">Please enter a valid email.</div>
      </div>
    </div>
    <div class="mb-3">
      <label for="defaultPassword" class="form-label">Password</label>
      <input
        type="text"
        id="defaultPassword"
        class="form-control readonly"
        placeholder=""
        formControlName="password"
        readonly='readonly'
      />
    </div>
    <div class="d-flex justify-content-end">
      <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid">Submit</button>
    </div>
  </form>
</div>

<!-- Confirmation Modal -->
<div *ngIf="showConfirmationModal" class="modal-backdrop">
  <div class="confirmation-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Confirm Submission</h5>
        <button type="button" class="btn-close" (click)="cancelSubmission()"></button>
      </div>
      <div class="modal-body">
        <p><strong>Username:</strong> {{ formDataPreview.name }}</p>
        <p><strong>Email:</strong> {{ formDataPreview.email }}</p>
        <p><strong>Password:</strong> {{ formDataPreview.password }}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" (click)="cancelSubmission()">Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" (click)="confirmSubmission()">Confirm</button>
      </div>
    </div>
  </div>
</div>

  `,
  styleUrl: './add-business-owner.component.css'
})
export class AddBusinessOwnerComponent {
  userForm: FormGroup;
  showConfirmationModal: boolean = false; // Toggle confirmation modal
  formDataPreview: any = {};

constructor(
  public modalRef: MdbModalRef<AddBusinessOwnerComponent>,
  private fb: FormBuilder,
  private toastr: ToastrService
) {
  this.userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['OWN001']
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
