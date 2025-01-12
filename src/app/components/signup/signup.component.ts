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
        console.log(this.user)
        this.authService.signup(signupData).subscribe(
          response => {
            this.toastr.success('Register successfully!', 'Success');
            this.storageService.setItemArray("formData", response.data);
            // this.router.navigate(['login'])
            // console.log(response)
          },
          error => {
            this.toastr.error(error, "Error");
            console.error("Error in SignUP: ",error)
          }
        );
      }
    }

    loginWithGoogle() {
      window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    }

}
