import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { JwtService } from '../../services/jwt.service';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="card-header d-flex justify-content-between align-items-center">
  <h5>Change Password</h5>
</div>

<div class="card-body py-4 mb-4 col-md-6">
  <form (ngSubmit)="onChangePassword()" class="modern-form">
    <div class="form-group">
      <label for="oldPassword" class="form-label">Old Password</label>
      <input
        id="oldPassword"
        type="password"
        class="form-control modern-input"
        [(ngModel)]="oldPassword"
        name="oldPassword"
        required
      />
    </div>

    <div class="form-group">
      <label for="newPassword" class="form-label">New Password</label>
      <input
        id="newPassword"
        type="password"
        class="form-control modern-input"
        [(ngModel)]="newPassword"
        name="newPassword"
        required
      />
    </div>

    <div class="form-group">
      <label for="confirmPassword" class="form-label">Confirm New Password</label>
      <input
        id="confirmPassword"
        type="password"
        class="form-control modern-input"
        [(ngModel)]="confirmPassword"
        name="confirmPassword"
        required
      />
    </div>

    <div *ngIf="newPassword && confirmPassword && newPassword !== confirmPassword" class="text-danger mb-3" style="font-size: 14px;">
      Passwords do not match.
    </div>

    <button
      type="button"
      class="btn btn-outline-secondary btn-sm p-3"
      [disabled]="newPassword !== confirmPassword || isChangingPassword"
      (click)="onChangePassword()"
    >
      {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
    </button>
  </form>
</div>
  `,
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  userId: number = 0;

  isChangingPassword: boolean = false;

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private jwtService: JwtService,
    private modalService: MdbModalService,
    private toastr: ToastrService,
    public modalRef: MdbModalRef<ChangePasswordComponent>
  ) {}


  ngOnInit(): void {
    const token: string | null = this.storageService.getItem('token');
    if (token) {
      this.userId = this.jwtService.getUserId(token);
    }
  }

  onChangePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('New password and confirm password do not match.', 'Error');
      return;
    }

    this.isChangingPassword = true; // Disable button and show loading state

    this.authService.changePassword(this.userId, this.oldPassword, this.newPassword).subscribe(
      (response: any) => {
        this.isChangingPassword = false; // Re-enable button
        this.toastr.success('Password changed successfully!', 'Success');

        // Reset the form fields to empty
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';

        this.modalRef.close();

      },
      (error) => {
        this.isChangingPassword = false; // Re-enable button

        // Handle backend error message or fallback to default
        const errorMessage = error?.error?.message || 'Failed to change password.';
        this.toastr.error(errorMessage, 'Error');
      }
    );
  }
}
