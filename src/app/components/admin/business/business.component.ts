import { Component, OnInit } from '@angular/core';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { BusinessService } from '../../../services/business/business.service';
import { JwtService } from '../../../services/jwt.service';
import { StorageService } from '../../../services/storage.service';
import { Business } from '../../../models/business';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AddBusinessOwnerComponent } from './add-business-owner/add-business-owner.component';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [MdbTooltipModule, MdbRippleModule, CommonModule,NgxPaginationModule, FormsModule],
  templateUrl: './business.component.html',
  styleUrl: './business.component.css'
})
export class BusinessComponent implements OnInit {
    modalRef1: MdbModalRef<AddBusinessOwnerComponent> | null = null;
    businesses:Business[]  =[];
    userId:any;
    token:any;
// For Pagination
    currentPage = 1;
    itemsPerPage = 4;

    searchTerm: string = '';
    pdfSrc: any;
    excelSrc: any;
    error: string | null = null;

    constructor(private modalService: MdbModalService,
                private toastr:ToastrService,
                private businessService:BusinessService,
                private tokenService:JwtService,
                private storageService:StorageService,
                private router: Router,
                private jwtService: JwtService,
                private sanitizer: DomSanitizer
    ) {}
    ngOnInit(): void {
      this.token = this.storageService.getItem("token");
      this.userId = this.jwtService.getUserId(this.token);
      this.loadBusinesses();
    }
      openUserModal(): void {
        this.modalRef1 = this.modalService.open(AddBusinessOwnerComponent, {
          modalClass: 'modal-md',// Optional: specify modal size (e.g., 'modal-sm', 'modal-lg')
        });

        this.modalRef1.onClose.subscribe((data) => {
          if (data) {
            const requestData = {
              ...data, // Spread existing form data
            };
            console.log('Form submitted:', requestData);
            this.businessService.addBusinessOwner(requestData).subscribe(
                response => {
                  console.log("Server Response: ", response);
                  // Toastr success alert
                  this.toastr.success('Business created successfully!', 'Success');
                  // location.reload();
                  // this.router.navigate(['d/business'])
                },
                error => {
                  console.error("Error In Owner Create: ",error)
                }
            )


          }
        });
      }

      getImageUrl(imagePath: string): string {
        return this.businessService.getImageUrl(imagePath);
      }
      get filteredBusinesses(): Business[] {
        return this.businesses.filter((business) =>
          business.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }

      async loadBusinesses() {
        try {
          this.businesses = await this.businessService.getAllBusinesses().toPromise();

          // Use Promise.all to resolve all location names asynchronously
          this.businesses = await Promise.all(
            this.businesses.map(async (business) => {
              business.location = await this.getLocationName(business.location);
              return business;
            })
          );

          console.log("Businesses with resolved locations:", this.businesses);
        } catch (error) {
          console.error("Error loading businesses:", error);
        }
      }

      async getLocationName(location: string): Promise<string> {
        const trimmedInput = location.trim();

        if (/^\d/.test(trimmedInput)) {
          const [lat, lon] = location.split(',').map(coord => parseFloat(coord.trim()));
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

          try {
            const response = await fetch(url);
            const data = await response.json();
            return data.display_name || location; // Return fetched location name or original value if not found
          } catch (error) {
            console.error('Error fetching location name:', error);
            return location; // Return original location in case of error
          }
        } else {
          return location; // Return as-is if already a name
        }
      }

      truncateText(text: string, limit: number = 20): string {
        if (!text) return ''; // Handle empty values
        return text.length > limit ? text.substring(0, limit) + '...' : text;
      }

      generateReport(type: 'pdf' | 'excel') {
        this.error = null;

        let service = () => this.businessService.businessReport(type, 'business');

        service().subscribe({
            next: (data: Blob) => {
                const url = URL.createObjectURL(data);
                if (type === 'pdf') {
                    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);

                } else {
                    this.excelSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);

                }
            },
            error: (error) => {
                console.error('Error generating report:', error);
                this.error = 'An error occurred while generating the report. Please try again.';
            }
        });
    }

    downloadReport(type: 'pdf' | 'excel') {
        this.error = null;

        let service = () => this.businessService.businessReport(type, 'business');

        service().subscribe({
            next: (data: Blob) => {
                const url = URL.createObjectURL(data);
                const link = document.createElement('a');
                link.href = url;
                const extension = type === 'pdf' ? 'pdf' : 'xlsx';
                link.download = `business_report.${extension}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
            error: (error) => {
                console.error('Error downloading report:', error);
                this.error = 'An error occurred while downloading the report. Please try again.';
            }
        });
    }
    generateBothReports() {
      this.generateReport('pdf');
      this.generateReport('excel');
    }


}
