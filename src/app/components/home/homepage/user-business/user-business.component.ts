import { Component, CUSTOM_ELEMENTS_SCHEMA, Injector, OnInit, Type } from '@angular/core';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { BusinessService } from '../../../../services/business/business.service';
import { ActivatedRoute } from '@angular/router';
import { Business } from '../../../../models/business';
import { CommonModule, Location } from '@angular/common';
import { BusinessProductComponent } from "./business-product/business-product.component";
import { BusinessReviewComponent } from "./business-review/business-review.component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-business',
  standalone: true,
  imports: [MdbTabsModule, CommonModule],
  templateUrl: './user-business.component.html',
  styleUrl: './user-business.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class UserBusinessComponent implements OnInit {
  businessProductComponent!: Type<any> | null;
  businessReviewComponent!: Type<any> | null;
  mapUrl: SafeResourceUrl;

  business!: Business;
  businessId: any;

  constructor(private businessService : BusinessService,
              private injector: Injector,
              private router: ActivatedRoute,
              private location: Location,
              private sanitizer: DomSanitizer
  ){
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.google.com/maps?q=16.778164142401746,96.142258644104&output=embed'
    );
  }

  ngOnInit(): void {

    this.router.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id !== this.businessId) { // Only update if the id has changed
        this.businessId = id;
        this.getBusinessDetail(id);
      }
    });
  }

  getBusinessDetail(id: number): void {
    this.businessService.getById(id).subscribe(
      response => {
        this.business = response;
        this.getLocationName(this.business.location);
        const trimmedInput = this.business.location.trim();

        if (/^\d/.test(trimmedInput)) {
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.google.com/maps?q=${this.business.location}&output=embed`
        );
        }
        // console.log('Business details:', this.business);
      },
      error => {
        console.error('Error in fetching business details:', error);
        this.business= this.business;
      }
    );
  }

  getBusinessImageUrl(imagePath: string): any {
    return this.businessService.getImageUrl(imagePath);
  }

  goBack(): void {
    this.location.back(); // Navigate to the previous page
  }

  async loadProductComponent() {
    const { BusinessProductComponent } = await import(
      './business-product/business-product.component'
    );
    this.businessProductComponent = BusinessProductComponent;
  }

  async loadReviewComponent() {
    const { BusinessReviewComponent } = await import(
      './business-review/business-review.component'
    );
    this.businessReviewComponent = BusinessReviewComponent;
  }

  getLocationName(location: string) {
    const trimmedInput = location.trim();

    if (/^\d/.test(trimmedInput)) {
    console.log("here")
    const [lat, lon] = location.split(',').map(coord => parseFloat(coord.trim()));
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const locationName = data.display_name;
        this.business.location = locationName;
        console.log(`Location Name: ${locationName}`);
      })
      .catch((error) => {
        console.error('Error fetching location name:', error);
      });
    }else{
      this.business.location = location;
    }
  }
}
