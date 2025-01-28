import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { JwtService } from '../services/jwt.service';

export const dashboardGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const storageService: StorageService = inject(StorageService);
  const tokenService: JwtService = inject(JwtService);

  if (typeof window === 'undefined') {
    console.warn("SSR detected: Skipping token validation.");
    return true;
  }

  const token = storageService.getItem("token");
  if (!token) {
    console.warn("No token found. Redirecting to login.");
    router.navigate(['/login']);
    return false;
  }

  const userRole = tokenService.getUserRole(token);
  console.log("Role detected:", userRole);

  if (userRole === 'ROLE_ADMIN') {
    if (state.url.startsWith('/d')) { // Allow any URL starting with "/d"
      return true;
    } else {
      router.navigate(['/d']);
      return false;
    }
  }

  if (userRole === 'OWNER') {
    if (state.url.startsWith('/o')) { // Allow any URL starting with "/o"
      return true;
    } else {
      router.navigate(['/o']);
      return false;
    }
  }

  if (userRole === 'ROLE_USER') {
    if (state.url.startsWith('/homepage')) { // Allow any URL starting with "/homepage"
      return true;
    } else {
      router.navigate(['/homepage']);
      return false;
    }
  }

  console.warn("Invalid or missing role. Redirecting to login.");
  router.navigate(['/login']);
  return false;
};
