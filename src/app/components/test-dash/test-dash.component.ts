import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Inject, NgZone, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { EncodingUtils } from '../../services/encoding-utils';
import { MapComponent } from "../map/map.component";
@Component({
  selector: 'app-test-dash',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatListModule, FormsModule, ReactiveFormsModule, MapComponent],
  templateUrl: './test-dash.component.html',
  styleUrl: './test-dash.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TestDashComponent{
  encodeDecodeForm: FormGroup;
  encodedCode!: string;
  decodedCode!: string;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    // Initialize the form
    this.encodeDecodeForm = this.fb.group({
      inputString: ['', [Validators.required, Validators.minLength(1)]],
      operation: ['encode', Validators.required], // Radio or dropdown for operation
    });
  }

  onSubmit() {
    const { inputString, operation } = this.encodeDecodeForm.value;

    try {
      if (operation === 'encode') {
        this.encodedCode = EncodingUtils.encode(inputString);
        console.log("Encoded: ", this.encodedCode)
        this.decodedCode = ''; // Clear the decoded string for clarity
      } else if (operation === 'decode') {
        console.log("Decode: " , inputString)
        this.decodedCode = EncodingUtils.decode(inputString);
        console.log("Decoded : ", this.decodedCode)
        this.encodedCode = ''; // Clear the encoded string for clarity
      }
      this.errorMessage = null;
    } catch (e:any) {
      this.errorMessage = e.message;
    }
  }
}
