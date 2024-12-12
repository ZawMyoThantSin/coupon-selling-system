import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Token } from '../../models/token';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

// Define the data object to bind to the form
user = {
  email: '',
  password: '',
};

// Method to handle form submission
onLoginSubmit(form:any) {
  if (form.valid) {
    // Log the loginData to the console
    console.log('Login Data:', this.user);
    // call login endpoint
    this.authService.login(this.user).subscribe(
      data => {
        // console.log(data)
        localStorage.setItem('token', data.token);
        this.user.email = '',
        this.user.password =  ''
        this.router.navigate(['/']);
      },
      error => {
        console.error("Error in Login", error)
      }
    );

  }
}
}
