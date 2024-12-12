import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  authService = inject(AuthService);

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
            console.log(response)
          },
          error => {
            console.error("Error in SignUP: ",error)
          }
        );

      }

      // Handle error: Passwords don't match

      // Handle successful submission logic
      console.log("Form Submitted", this.user);
    }

}
