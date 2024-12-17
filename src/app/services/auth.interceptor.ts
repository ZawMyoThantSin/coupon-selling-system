import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { StorageService } from './storage.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(StorageService);
  const authToken = tokenService.getItem("token");
  console.log("In Interceptor: " , authToken)

  // 1. Attach authentication token to outgoing requests
  const modifiedReq = req.clone({
    setHeaders: {
      Authorization: authToken ? `Bearer ${authToken}` : '', // Add token if available
    },
  });

  console.log(`Outgoing request to ${req.url}`, modifiedReq);

  // 2. Log request and response
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 3. Handle errors globally
      console.error(`Error occurred while calling ${req.url}:`, error);
      let errorMessage = 'An unexpected error occurred';
      if (error.status === 403) {
        errorMessage = 'Unauthorized access - please log in again.';
        // Example: Redirect to login or clear session
        // authService.logout();
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      // Optionally, show a toast notification (replace with your UI framework)
      console.warn(errorMessage);

      return throwError(() => new Error(errorMessage)); // Re-throw the error
    }),
    // Log response
    tap(response => {
      console.log(`Response from ${req.url}:`, response);
    })
  );
};
