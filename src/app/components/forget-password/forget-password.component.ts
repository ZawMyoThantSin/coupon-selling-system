import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, FormsModule,RouterLink],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent implements OnInit{
  forgotPasswordForm!: FormGroup;
  loading: boolean = false;
  userExists: boolean | null = null;
  otpForm!: FormGroup;
  otpSent: boolean = false; // Flag to track OTP stage
  userMail: string = '';
  resetPasswordForm!: FormGroup;
  passwordResetSuccess: boolean = false;
  passwordMismatch = false;
  timer: number = 60;
  private interval: any;
  formData:any;

  constructor(
    private fb: FormBuilder,
    private ngZone: NgZone,
    private authService: AuthService,
    private storageService: StorageService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formData  = this.storageService.getItemArray("formData");
    if(this.formData != null){
    this.forgotPasswordForm = this.fb.group({
      email: [ this.formData.email ||'',
        [
          Validators.required,
          Validators.email
        ]
      ]
    });
   }else{
    this.forgotPasswordForm = this.fb.group({
      email: ['',
        [
          Validators.required,
          Validators.email
        ]
      ]
    });
   }

   this.otpForm = this.fb.group({
    otp: this.fb.array(Array(6).fill('').map(() => this.fb.control('', [Validators.required, Validators.pattern(/^\d$/)]))),
   });

    // Focus the first input on load
    setTimeout(() => this.focusInput(0), 0);


    // Initialize reset password form with confirmPassword field
    this.resetPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },

    );

    // Watch for changes in the email input and apply debounce
    this.forgotPasswordForm.get('email')?.valueChanges.pipe(
      debounceTime(1000), // Delay for debouncing
      tap((email) => {
        console.log("Email input value: ", email);  // Log the email input value
        this.loading = true;
        this.userExists = null; // Reset userExists while checking
      }),
      switchMap((email) => {
        return this.authService.searchUsersByEmail(email).pipe(
          catchError(() => {
            this.loading =false;
            this.userExists = false;  // Handle API error (email not found)
            return of();  // Return empty array in case of error
          })
        );
      })
    ).subscribe((users) => {
      this.loading = false;
      this.userExists = users.email != null ? true : false;  // Check if any users found
    });

  }
  ngOnDestroy() {
    // Clear the timer when the component is destroyed
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  checkPasswordMatch() {
    let password = this.passwordControl?.value;
    let confirmPassword = this.confirmPasswordControl?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  onForgotPasswordSubmit() {
    this.userMail = this.forgotPasswordForm.value.email;
    this.sendOtp(this.userMail); // Send the actual email entered in the form
  }

  // for otp form
  focusInput(index: number) {
    const inputs = document.querySelectorAll<HTMLInputElement>('.otp-input');
    if (inputs[index]) {
      inputs[index].focus();
    }
  }

  onInputChange(event: any, index: number) {
    const value = event.target.value;

    // Allow only numeric input
    if (!/^\d$/.test(value)) {
      this.otpControls.at(index).setValue(''); // Clear invalid input
      return;
    }

    // Move focus to the next input if valid
    if (value && index < this.otpControls.length - 1) {
      this.focusInput(index + 1);
    }
  }

  onKeydown(event: any, index: number) {
    // Handle backspace to move to the previous input
    if (event.key === 'Backspace' && index > 0) {
      if (!this.otpControls.at(index).value) {
        this.focusInput(index - 1);
      }
    }
  }
  resendOtp() {
    this.otpForm.reset(); // Clear all inputs
    this.timer = 60;
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.sendOtp(this.userMail);
    this.startTimer();
  }

  startTimer() {
    // Ensure the timer runs within Angular's zone
    this.ngZone.runOutsideAngular(() => {
      this.interval = setInterval(() => {
        this.ngZone.run(() => {
          if (this.timer > 0) {
            this.timer--;
          } else {
            clearInterval(this.interval);
          }
        });
      }, 1000);
    });
  }
    // Verify OTP

  submitOtp() {
    if (this.otpForm.invalid) {
      alert('Please complete all fields with valid input.');
      return;
    }

    const otp = this.otpControls.value.join('');
    this.authService.validateOtp(this.userMail, otp).subscribe((res)=>{
      if(res){
        this.passwordResetSuccess = true;
      }else{
        this.toastr.error("Your OTP Code is Expired!")
      }
    }, error=>{
      this.toastr.error("The Code You Entered is not correct!")
      console.log("The Code You Entered is not correct!", error);
    });
  }

  // end

   get emailControl() {
    return this.forgotPasswordForm.get('email');
  }

  get otpControls(): FormArray {
    return this.otpForm.get('otp') as FormArray;
  }

  get passwordControl() {
    return this.resetPasswordForm.get('password');
  }

  get confirmPasswordControl() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  // Check if passwords match
  get passwordsDontMatch() {
    return !this.passwordMismatch;
  }



  sendOtp(email: string) {
    this.otpSent = true;
    this.startTimer();
    this.toastr.success("The 6 digits OTP is Sent to Your Email.")
    this.authService.sendOtpEmail(email).subscribe(()=>{
      // this.toastr.success("The 6 digits OTP is Sent to Your Email.")
    }, e => {
      // this.toastr.error("Error in Sending Email");
      console.log("E", e);
    })
  }

  onResetPasswordSubmit(): void {
    if (this.resetPasswordForm.invalid) return;
    const newPassword = this.resetPasswordForm.get('password')?.value;
    console.log("Password", newPassword)
    const dataToSend = {
      email: this.userMail,
      password: newPassword
    }
    this.authService.passwordReset(dataToSend).subscribe((res)=>{
      this.toastr.success("Password Change Successfully!", 'Success');
      this.router.navigate(['/login']);
    },error=>{
      this.toastr.error("Something went wrong! Please try again later.");
    })
  }

}
