import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { JwtService } from '../services/jwt.service';

export const dashboardGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const storageService: StorageService = inject(StorageService);
  const tokenService: JwtService = inject(JwtService);

  // Check if running in the browser (to handle SSR issues)
  if (typeof window === 'undefined') {
    console.warn("SSR detected: Skipping token validation.");
    return true; // Allow navigation during SSR
  }

  // Fetch the token from local storage (browser-only)
  const token = storageService.getItem("token");
  if (!token) {
    console.warn("No token found. Redirecting to login.");
    router.navigate(['/login']);
    return false; // Prevent navigation
  }

  // Decode the token and get the user role
  const userRole = tokenService.getUserRole(token);
  console.log("Role detected:", userRole);

  // Role-based navigation enforcement
  if (userRole === 'ROLE_ADMIN') {
    if (state.url === '/d') {
      return true; // Allow admin to access the dashboard
    } else {
      router.navigate(['/d']); // Redirect to admin dashboard
      return false; // Block other routes
    }
  }

  if (userRole === 'ROLE_OWNER') {
    if (state.url === '/o') {
      return true; // Allow owner to access the owner dashboard
    } else {
      router.navigate(['/o']); // Redirect to owner dashboard
      return false; // Block other routes
    }
  }

  if (userRole === 'USER') {
    if (state.url === '/homepage') {
      return true; // Allow user to access the homepage
    } else {
      router.navigate(['/homepage']); // Redirect to user homepage
      return false; // Block other routes
    }
  }

  // Handle cases where role is invalid or missing
  console.warn("Invalid or missing role. Redirecting to login.");
  router.navigate(['/login']);
  return false; // Prevent navigation
};

