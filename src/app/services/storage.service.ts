import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getItem(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  getItemArray<T>(key: string): T | null {
    if (this.isBrowser) {
      try {
        const jsonData = localStorage.getItem(key);
        return jsonData ? (JSON.parse(jsonData) as T) : null; // Parse back to the original type
      } catch (error) {
        console.error('Error retrieving data:', error);
        return null;
      }
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

  setItemArray(key: string, value: any): void {
    if (this.isBrowser) {
      try {
        const jsonData = JSON.stringify(value); // Convert the value to JSON
        localStorage.setItem(key, jsonData);   // Store in localStorage
        console.log(`Data stored under key "${key}" successfully!`);
      } catch (error) {
        console.error('Error storing data:', error);
      }
    }
  }

  removeItem(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }
}
