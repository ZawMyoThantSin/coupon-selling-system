import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { StorageService } from './storage.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(StorageService);
  const router = inject(Router);
  const authToken = tokenService.getItem("token");
  // console.log("In Interceptor: " , authToken)

  // 1. Attach authentication token to outgoing requests
  const modifiedReq = req.clone({
    setHeaders: {
      Authorization: authToken ? `Bearer ${authToken}` : '', // Add token if available
    },
  });

  console.log(`Outgoing request to ${req.url}`, modifiedReq);

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`Error occurred while calling ${req.url}:`, error);
      let errorMessage = '';
      if (error.status === 498) {
        errorMessage = 'Token has expired - please log in again.';
        tokenService.removeItem("token");
        router.navigate(['/login'],)
      }else if(error.status===400){
        errorMessage = 'Invalid token signature.';
      }else if (error.status === 401) {
        errorMessage = 'Invalid token signature.';
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
