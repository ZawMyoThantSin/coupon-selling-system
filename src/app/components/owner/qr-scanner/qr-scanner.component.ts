import { CommonModule } from '@angular/common';
import { AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component, OnDestroy, OnInit, VERSION, ViewChild, inject } from '@angular/core';

import {  ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat, Result } from '@zxing/library';
import { Router } from '@angular/router';
@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [ZXingScannerModule, CommonModule], // Import ZXingScannerModule to use the scanner component
  template: `
  <div class="scanner-shell" [hidden]="!hasDevices">
  <header>
    <select (change)="onDeviceSelectChange($event)">
      <option value="" [selected]="!currentDevice">Select Camera</option>
      <option *ngFor="let device of availableDevices" [value]="device.deviceId" [selected]="currentDevice && device.deviceId === currentDevice.deviceId">
        {{ device.label }}
      </option>
    </select>
  </header>

  <!-- MAIN SCANNER AREA -->
  <div *ngIf="cameraVisible" class="scanner-container">
    <div class="scan-area">
      <div class="scan-line"></div>
      <zxing-scanner #scanner
        [ngClass]="'videee'"
        start="true"
        [device]="currentDevice"
        (scanSuccess)="handleQrCodeResult($event)"
        [formats]="formats">
      </zxing-scanner>
    </div>
  </div>
</div>

<!-- LOADING AND PERMISSION HANDLING -->
<!-- BIG COMMENT: Loading Spinner and Permission Messages -->
<!-- <div class="loading-container" *ngIf="hasDevices === undefined && hasPermission === undefined">
  <!-- BOOTSTRAP LOADING SPINNER -->
  <!-- <div class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
  <h2>Loading... Please wait.</h2>
  <p>We're checking for devices and permissions.</p>
</div> -->

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

  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined;
  formats: BarcodeFormat[] = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX
  ];

  cameraVisible = true;

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
    // ======== HIDE CAMERA BOX AND PLAY BEEP SOUND AFTER SCAN ========
    // how to send qr result
    this.cameraVisible = false; // Hide the camera box

    this.playBeepSound(); // Play the beep sound
    this.router.navigate(['o/qr-result', { result: this.qrResultString }]);
    // ==============================================================
  }

  playBeepSound(): void {
    // ======== FUNCTION TO PLAY A BEEP SOUND ========
    const beep = new Audio();
    beep.src = '/beep.MP3'; // Replace with the path to your beep sound file
    beep.load();
    beep.play();
    // =============================================
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
}
