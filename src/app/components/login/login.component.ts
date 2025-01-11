import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import e from 'express';
import { ToastrService } from 'ngx-toastr';
import { JwtService } from '../../services/jwt.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  storageService = inject(StorageService);
  tokenService = inject(JwtService);
  toastr = inject(ToastrService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  formData:any;
  userRole!: string;
  user = {
    email: "",
    password: '',
  };
  ngOnInit(): void {
    this.formData  = this.storageService.getItemArray("formData");
    if(this.formData != null){
      this.user = {
        email : this.formData.email || '',
        password: '',
      }
  }

    const storedToken = this.storageService.getItem('token');

    if (!storedToken) {
      // If there's no stored token, check query params for a token (OAuth2 login)
      this.route.queryParams.subscribe(params => {
        const token = params['token'];

        if (token) {
          // Store the token in localStorage
          localStorage.setItem('token', token);
          console.log("REACH")
          this.userRole = this.tokenService.getUserRole(token);
          // Navigate to the normal dashboard URL without query params
          this.router.navigateByUrl('/');
        } else {
          // Redirect to login if neither a stored token nor query param token is available
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigateByUrl('/');
    }
  }
// Define the data object to bind to the form


// Method to handle form submission
onLoginSubmit(form:any) {
  if (form.valid) {
    this.authService.login(this.user).subscribe(
      data => {
        console.log(data)
        this.storageService.removeItem("formData");
        localStorage.setItem('token', data.token);

        if (data.message === 'RESET_PASSWORD_REQUIRED') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          this.router.navigate(['/password-reset']);
        }else{
          localStorage.setItem('token', data.token);
          this.user.email = '',
          this.user.password =  ''
          this.router.navigate(['/']);
        }
      },
      error => {
        this.toastr.error('Username or password is invalid', 'Login Failed');
      }
    );

  }
}

loginWithGoogle() {
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
}
loginWithGitHub() {
  window.location.href = 'http://localhost:8080/oauth2/authorization/github';
}
}
