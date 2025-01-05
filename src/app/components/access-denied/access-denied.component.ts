import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [],
  template:`
    <div class="access-denied-wrapper">
  <div class="access-denied-card">
    <div class="error-icon">
      <span class="fs-1">
      <svg xmlns="http://www.w3.org/2000/svg" height="100px" viewBox="0 -960 960 960" width="100px" fill="#EA3323"><path d="M280-440h400v-80H280v80ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
      </span> <!-- Unicode for Prohibited Sign -->
    </div>
    <h1>Access Denied</h1>
    <p>You don't have permission to access this page.</p>
    <p>If you believe this is an error, please contact support or try again later.</p>
    <button class="home-button" (click)="goToHome()">Go to Homepage</button>
  </div>
</div>

  `,
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
