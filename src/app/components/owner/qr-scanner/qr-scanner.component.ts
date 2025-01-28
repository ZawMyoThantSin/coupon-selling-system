import { CommonModule } from '@angular/common';
import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component, OnDestroy, OnInit, VERSION, ViewChild, inject } from '@angular/core';

import {  ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat, Result } from '@zxing/library';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EncodingUtils } from '../../../services/encoding-utils';
import { getDefaultAppConfig } from '../../../models/appConfig';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [ZXingScannerModule, CommonModule, FormsModule], // Import ZXingScannerModule to use the scanner component
  template: `
 <div class="row">
  <button class="btn btn-primary my-3 col-12 col-md-6 offset-md-3 text-center" *ngIf="hasDevices" (click)="toggleInputBox()">
    {{ showInputBox ? 'Show Scanner' : 'Enter Code' }}
  </button>

  <div class="scanner-shell col-12 col-md-6 offset-md-3" [hidden]="!hasDevices">
    <header *ngIf="!showInputBox" class="d-flex justify-content-center mb-3">
      <select class="form-select w-75" (change)="onDeviceSelectChange($event)">
        <option value="" [selected]="!currentDevice">Select Camera</option>
        <option *ngFor="let device of availableDevices" [value]="device.deviceId" [selected]="currentDevice && device.deviceId === currentDevice.deviceId">
          {{ device.label }}
        </option>
      </select>
    </header>

    <!-- MAIN SCANNER AREA -->
    <div *ngIf="cameraVisible && !showInputBox" class="scanner-container">
      <div class="scan-area position-relative">
        <div class="scan-line position-absolute"></div>
        <zxing-scanner #scanner
          class="video-container w-100"
          start="true"
          [device]="currentDevice"
          (scanSuccess)="handleQrCodeResult($event)"
          [formats]="formats">
        </zxing-scanner>
      </div>
    </div>

    <!-- INPUT BOX AREA -->
    <div *ngIf="showInputBox" class="input-container d-flex flex-column flex-md-row align-items-center mt-3">
      <input type="text" [(ngModel)]="enteredCode" class="form-control mb-2 mb-md-0 me-md-2 py-2" placeholder="Enter your code" />
      <button class="btn btn-success w-100 w-md-auto" (click)="submitCode()">Submit</button>
    </div>
  </div>
</div>


<!-- Permission Pending -->
<ng-container *ngIf="hasPermission === undefined && hasDevices !== undefined">
  <div class="d-flex flex-column justify-content-center align-items-center vh-100 text-center">

    <section class="dots-container">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </section>

    <h2>Waiting for permissions.</h2>
    <!-- <div class="spinner-border my-3" role="status">
      <span class="visually-hidden">Loading...</span>
    </div> -->
    <blockquote>
      If your device does not have cameras, no permissions will be asked.
    </blockquote>
  </div>
</ng-container>

<!-- Permission Denied -->
<ng-container *ngIf="hasPermission === false">
  <div class="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
    <h5>You denied the camera permission, we can't scan anything without it. 😪</h5>
  </div>
</ng-container>

<!-- Devices Check Failed -->
<ng-container *ngIf="hasDevices === undefined && hasPermission !== undefined">
  <div class="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
    <h2>Couldn't check for devices.</h2>
    <blockquote>
      This may be caused by some security error.
    </blockquote>
  </div>
</ng-container>

<!-- No Devices Found -->
<ng-container *ngIf="hasDevices === false && hasPermission !== undefined">
  <div class="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
    <h2>No devices were found.</h2>
    <blockquote>
      I believe your device has no media devices attached.
    </blockquote>
  </div>
</ng-container>

<!-- Thiiiiiifiididid -->
<!-- <footer>
  <table class="table-scanner-state">
    <thead>
      <tr>
        <th>Status</th>
        <th>Property</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ stateToEmoji(hasDevices) }}</td>
        <td>Devices</td>
      </tr>
      <tr>
        <td>{{ stateToEmoji(hasPermission) }}</td>
        <td>Permissions</td>
      </tr>
    </tbody>
  </table>
  <p class="ng-version">Angular version: {{ ngVersion }}</p>
</footer> -->

  `,
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit,AfterViewInit {
  ngVersion = VERSION.full;
  router = inject(Router);

  @ViewChild(ZXingScannerComponent, { static: false }) scanner!: ZXingScannerComponent;

  hasDevices = false;
  hasPermission: boolean | undefined;
  qrResultString: string | undefined;
  qrResult: Result | undefined;
  decodedCode:string = '';

  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined;
  formats: BarcodeFormat[] = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX
  ];

  cameraVisible = true;
  showInputBox = false;
  enteredCode: string = '';

  constructor(private http:HttpClient) {

  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    // console.debug('Scanner component:', this.scanner);

    if (this.scanner) {
      this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
        // console.debug('Cameras found:', devices);
        this.hasDevices = true;
        this.availableDevices = devices;
      });

      this.scanner.camerasNotFound.subscribe(() => {
        console.debug('No cameras found');
        this.hasDevices = false;
      });

      this.scanner.scanComplete.subscribe((result: Result) => {
        // console.debug('Scan complete:', result);
        this.qrResult = result;
      });

      this.scanner.permissionResponse.subscribe((perm: boolean) => {
        // console.debug('Permission response:', perm);
        this.hasPermission = perm;
      });
    } else {
      console.error('Scanner component is undefined in ngAfterViewInit');
    }
  }

  selectDefaultDevice(devices: MediaDeviceInfo[]) {
    if (devices.length > 0) {
      this.currentDevice = devices[0]; // Select the first available device
    }
  }

  handleQrCodeResult(resultString: string): void {
    console.debug('Result: ', resultString);
    this.qrResultString = resultString;
    this.cameraVisible = false; // Hide the camera box

    this.playBeepSound(); // Play the beep sound
    this.router.navigate(['o/qr-result', { result: this.qrResultString }]);
  }

  playBeepSound(): void {
    const beep = new Audio();
    beep.src = '/beep.MP3';
    beep.load();
    beep.play();
  }

  onDeviceSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement | null; // Handle null case
    if (selectElement) {
      const selectedValue = selectElement.value;
      console.debug('Selection changed: ', selectedValue);
      this.currentDevice = this.availableDevices.find(device => device.deviceId === selectedValue);
    } else {
      console.error('Select element is null');
    }
  }

  stateToEmoji(state: boolean | undefined | null): string {
    const states: { [key: string]: string } = {
      undefined: '❔',
      null: '⭕',
      true: '✔',
      false: '❌'
    };

    // Safely convert state to a string key
    return states[String(state)]; // Convert `state` to string for indexing
  }

  submitCode(): void {
    console.log('Entered Code:', this.enteredCode);
    this.http.get<any>(`${getDefaultAppConfig().backendHost}/api/qrcode/${this.enteredCode}`)
    .subscribe(
      (res) => {
        this.router.navigate(['o/qr-result', { result: res.qrCode }]);
      },
      (err) => {
        console.error('Error fetching QR Code data:', err);

      }
    );

  }



  toggleInputBox(): void {
    this.showInputBox = !this.showInputBox;
    this.cameraVisible = !this.showInputBox;
  }
}
