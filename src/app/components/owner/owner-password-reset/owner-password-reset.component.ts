import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-owner-password-reset',
  standalone: true,
  imports: [FormsModule ,CommonModule],
  templateUrl: './owner-password-reset.component.html',
  styleUrl: './owner-password-reset.component.css'
})
export class OwnerPasswordResetComponent {

  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  passwordMismatch = false;
  newPasswordVisible = false; // Toggles visibility of new password
  confirmPasswordVisible = false; 

  constructor(private authService: AuthService, private router: Router) {}

  resetPassword() {
    if (this.passwordMismatch) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    this.authService.resetPassword({ userId: this.authService.getUserId(), newPassword: this.newPassword })
      .subscribe(
        () => {
          this.router.navigate(['/o']); // Redirect to owner dashboard
        },
        error => {
          this.errorMessage = 'Failed to reset password. Please try again.';
        }
      );
  }

  checkPasswordMatch() {
    this.passwordMismatch = this.newPassword !== this.confirmPassword;
  }

  toggleNewPasswordVisibility() {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

}
