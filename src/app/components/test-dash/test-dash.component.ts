import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Inject, NgZone, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-test-dash',
  standalone: true,
  imports: [CommonModule,RouterOutlet,RouterLinkActive,  MatIconModule, MatButtonModule, MatListModule, FormsModule, ReactiveFormsModule],
  templateUrl: './test-dash.component.html',
  styleUrl: './test-dash.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TestDashComponent{
  isMenuOpen = false;
  isDesktop = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.isDesktop = window.innerWidth >= 992;
      window.addEventListener('resize', () => {
        if (isPlatformBrowser(this.platformId)) {
          this.isDesktop = window.innerWidth >= 992;
          if (this.isDesktop) {
            this.isMenuOpen = false;
          }
        }
      });
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
