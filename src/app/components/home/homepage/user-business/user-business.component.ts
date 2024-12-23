import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { BusinessService } from '../../../../services/business/business.service';
import { ActivatedRoute } from '@angular/router';
import { Business } from '../../../../models/business';
import { CommonModule, Location } from '@angular/common';
import { BusinessProductComponent } from "./business-product/business-product.component";

@Component({
  selector: 'app-user-business',
  standalone: true,
  imports: [MdbTabsModule, CommonModule, BusinessProductComponent],
  templateUrl: './user-business.component.html',
  styleUrl: './user-business.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class UserBusinessComponent implements OnInit {

  business!: Business;
  businessId: any;

  constructor(private businessService : BusinessService,
              private router: ActivatedRoute,
              private location: Location
  ){}

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
        console.log('Business details:', this.business);
      },
      error => {
        console.error('Error in fetching business details:', error);
        this.business= this.business; 
      }
    );
  }

  goBack(): void {
    this.location.back(); // Navigate to the previous page
  }
}
