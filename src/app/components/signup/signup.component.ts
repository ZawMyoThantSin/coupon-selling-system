import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  storageService = inject(StorageService);
  router = inject(Router);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  isValidMail: boolean = true;
  result: any = null;
  debounceTimer: any;

  checkEmailDebounced(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.checkEmail();
    }, 1500);
  }

  checkEmail(): void {
    if (this.user.email) {
      this.authService.validateEmail(this.user.email).subscribe(
        (response) => {
          console.log('API response:', response);
          this.result = response;
          this.isValidMail = this.result.status !== 'invalid';
          console.log("isMaiL?", this.isValidMail)
        },
        (error) => {
          console.error('API error:', error);
          this.result = null;
        }
      );
    }
  }
  user = {
    name: '',
    email: '',
    password: '',
    compassword: ''
  };

  // Optional: For custom validations, you can write additional functions, like checking password strength
  onSubmit(form: NgForm) {
      if(form.valid){
        let signupData = {
          name : this.user.name,
          email: this.user.email,
          password: this.user.password
        }
        this.authService.signup(signupData).subscribe(
          response => {
            this.toastr.success('Register successfully!', 'Success');
            this.storageService.setItemArray("formData", response.data);
            this.router.navigate(['login'])
            // console.log(response)
          },
          error => {
            this.toastr.error("Something went wrong!", "Error");
            console.error("Error in SignUP: ",error)
          }
        );
      }
    }

    loginWithGoogle() {
      window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    }

}
