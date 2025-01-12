import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, interval } from 'rxjs';

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

interface NavItem {
  name: string;
  icon: string;
  href: string;
}

@Component({
  selector: 'app-test-dash',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './test-dash.component.html',
  styleUrl: './test-dash.component.css'
})
export class TestDashComponent implements OnInit{
  // isSidebarOpen = true;

  // metrics: Metric[] = [
  //   { title: "Users", value: "26K", change: "-12.4%", trend: "down" },
  //   { title: "Income", value: "$6,200", change: "+40.9%", trend: "up" },
  //   { title: "Conversion Rate", value: "2.49%", change: "+84.7%", trend: "up" },
  //   { title: "Sessions", value: "44K", change: "-23.6%", trend: "down" }
  // ];

  // navigation = {
  //   main: [
  //     { name: "Dashboard", icon: "home", href: "/" },
  //   ],
  //   theme: [
  //     { name: "Colors", icon: "palette", href: "/colors" },
  //     { name: "Typography", icon: "text_format", href: "/typography" },
  //   ],
  //   components: [
  //     { name: "Base", icon: "category", href: "/base" },
  //     { name: "Buttons", icon: "smart_button", href: "/buttons" },
  //     { name: "Forms", icon: "input", href: "/forms" },
  //     { name: "Icons", icon: "star", href: "/icons" },
  //     { name: "Notifications", icon: "notifications", href: "/notifications" },
  //   ]
  // };

  // toggleSidebar() {
  //   this.isSidebarOpen = !this.isSidebarOpen;
  // }
  otpForm!: FormGroup;
  timer: number = 60;
  private interval: any;

  constructor(private fb: FormBuilder,private ngZone: NgZone) {}

  ngOnInit() {
    // Initialize the form with 6 controls
    this.otpForm = this.fb.group({
      otp: this.fb.array(Array(6).fill('').map(() => this.fb.control('', [Validators.required, Validators.pattern(/^\d$/)]))),
    });

    // Start the timer
    this.startTimer();

    // Focus the first input on load
    setTimeout(() => this.focusInput(0), 0);
  }
  ngOnDestroy() {
    // Clear the timer when the component is destroyed
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  get otpControls(): FormArray {
    return this.otpForm.get('otp') as FormArray;
  }

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
    console.log('Resending OTP...');
    this.otpForm.reset(); // Clear all inputs
    this.timer = 60;
    if (this.interval) {
      clearInterval(this.interval);
    }
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

  submitOtp() {
    if (this.otpForm.invalid) {
      alert('Please complete all fields with valid input.');
      return;
    }

    const otp = this.otpControls.value.join('');
    console.log('Entered OTP:', otp);

    // Add your OTP submission logic here
  }
}
