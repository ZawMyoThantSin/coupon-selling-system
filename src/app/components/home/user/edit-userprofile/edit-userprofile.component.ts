import { Component, ViewChild } from '@angular/core';
import { UserService } from '../../../../services/user/user.service';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserEdit } from '../../../../models/userEdit';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-userprofile',
  standalone: true,
  imports: [FormsModule,CommonModule],
  template: `
   <div class="card shadow-sm rounded border-0" *ngIf="user">
  <div class="card-header bg-white" style="display: flex; justify-content: center; align-items: center;">
    <h5 class="modal-title" style="color: rgb(6, 8, 8);">Edit User Profile</h5>

  </div>

  <div class="card-body" style="background-color: white; padding: 15px; border-radius: 5px;">
    <form #userForm="ngForm" (ngSubmit)="onSubmit()">

      <!-- Profile Image Section -->
      <div class="row mb-4">
        <div class="col-12 text-center">
          <!-- <label for="Profile" class="form-label font-weight-bold text-dark">Upload Image</label> -->
          <div class="mt-3 mb-3" >
            <img
              [src]="imagePreview ?? getImageUrl(user.profile)"
              alt="Image Preview"
              class="img-thumbnail rounded-circle border"
              style="width: 150px; height: 150px; object-fit: cover;"
            />
          </div>
          <input
            type="file"
            id="Profile"
            name="Profile"
            class="form-control form-control-sm"
            (change)="onFileChange($event)"
          />
          <div *ngIf="imageError" class="text-danger mt-1">
            {{ imageError }}
          </div>
        </div>
      </div>



      <!-- User Details Section -->
      <div class="row">
        <!-- Full Name -->
        <div class="col-md-6 mb-2" >
          <div class="form-floating  ">
            <input
              type="text"
              id="username"
              class="form-control form-control-sm border-radius:12px"
              [(ngModel)]="user.name"
              name="name"
              required
            />
            <label for="username">Full Name</label>
            <div *ngIf="userForm.form.controls['name']?.invalid && userForm.form.controls['name']?.touched" class="text-danger">
              Full Name is required.
            </div>
          </div>
        </div>

        <!-- Email -->
        <div class="col-md-6 mb-2">
          <div class="form-floating">
            <input
              type="email"
              id="useremail"
              class="form-control form-control-sm"
              [(ngModel)]="user.email"
              name="email"
              readonly
            />
            <label for="useremail">User Email</label>
          </div>
        </div>
      </div>

      <!-- Phone Number Section -->
      <div class="row">
        <div class="col-md-6 mb-2">
          <div class="form-floating">
            <input
              type="text"
              id="phone"
              class="form-control form-control-sm"
              [(ngModel)]="user.phone"
              name="phone"
              required
              pattern="09[0-9]{9}"
            />
            <label for="phone">Phone Number</label>
            <div *ngIf="userForm.form.controls['phone']?.invalid && userForm.form.controls['phone']?.touched" class="text-danger">
              Valid Phone Number is required.
            </div>
          </div>
        </div>

        <!-- Address Section -->
        <div class="col-md-6 mb-2">
          <div class="form-floating">
            <textarea
              id="address"
              class="form-control form-control-sm"
              [(ngModel)]="user.address"
              name="address"
              rows="3"
            ></textarea>
            <label for="address">Address</label>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="text-end">
        <button
          type="submit"
          class="btn btn-primary btn-sm"
          [disabled]="userForm.form.invalid || isSaving"
        >
          {{ isSaving ? 'Saving...' : 'Save User' }}
        </button>
      </div>
    </form>
  </div>
</div>
  `,
  styleUrl: './edit-userprofile.component.css'
})
export class EditUserprofileComponent {

  user: UserEdit| null = null;


selectedFile: File | null = null;

  isLoading: boolean = true;
  errorMessage: string = '';
  modalRef: MdbModalRef<any> | null = null;
  isSaving: boolean = false;
  imageError: string | null = null; // Property for image validation errors
  @ViewChild('editUserProfileModal') editUserProfileModal: any; // Reference to modal template

  imagePreview: string | ArrayBuffer | null = null; // Declare for preview
  constructor(
      private userService: UserService,
      private modalService: MdbModalService,
      private route: ActivatedRoute,
     private toastr:ToastrService

    ) {}

    ngOnInit(): void {
     this.loadUserInfo()
    }

    loadUserInfo() :void {
      this.userService.getUserInfo().subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
          } else {
            this.user = null;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading userprofile:', error);
          this.errorMessage = 'Failed to load userprofile';
          this.isLoading = false;
        },
      });
    }



    onSubmit(): void {

      if (this.user && this.user.id) {
        this.isSaving = true;

        // Prepare FormData for the request
        const formData = new FormData();
        formData.append('name', this.user.name ?? '');  // Default to empty string if name is null/undefined
        formData.append('email', this.user.email ?? '');  // Default to empty string
        formData.append('phone', this.user.phone ?? '');  // Default to empty string
        formData.append('address', this.user.address ?? '');  // Default to empty string

        // Only append imageFile if a new file is selected
        if (this.selectedFile) {  // Use selectedFile instead of user.profile
          formData.append('profile', this.selectedFile);
        }

        // console.log('FormData Contents:');
        // formData.forEach((value, key) => {
        //   console.log(${key}:, value);
        // });


        this.userService.updateUserProfile(this.user.id, formData).subscribe({
          next: (updatedUser) => {
            this.isSaving = false;
            this.user = updatedUser;
            this.toastr.success('User updated successfully!', 'Success'); // Toastr for success
            this.closeModal();
            window.location.reload();
          },
          error: (error) => {
            this.isSaving = false;
            console.error('Error updating user:', error);
            this.toastr.error('Failed to update user', 'Error'); // Toastr for error
            this.errorMessage = 'Failed to update user';
          },
        });
      }}

    // Close modal safely
    closeModal(): void {
      this.modalRef?.close();

    }

    onFileChange(event: any): void {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;

        // FileReader to load and show preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreview = e.target.result; // Set the preview URL
        };
        reader.readAsDataURL(file);
      } else {
        console.log("No file selected.");
        this.imagePreview = null; // Clear preview if no file is selected
      }
    }


    getImageUrl(imagePath: string): string {
      return this.userService.getImageUrl(imagePath);
    }
}
