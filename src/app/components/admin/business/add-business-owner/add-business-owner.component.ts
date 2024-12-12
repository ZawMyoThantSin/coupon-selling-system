import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';

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
  <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
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

  `,
  styleUrl: './add-business-owner.component.css'
})
export class AddBusinessOwnerComponent {
  userForm: FormGroup;

constructor(
  public modalRef: MdbModalRef<AddBusinessOwnerComponent>,
  private fb: FormBuilder
) {
  this.userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['OWN001']
  });
}

onSubmit(): void {
  if (this.userForm.valid) {
    this.modalRef.close(this.userForm.value); // Pass the form values
  }
}
}
