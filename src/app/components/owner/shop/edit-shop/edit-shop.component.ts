import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Business } from '../../../../models/business';
import { businessCategory } from '../../../../models/business-category';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../../../services/business/business.service';
import { JwtService } from '../../../../services/jwt.service';
import { StorageService } from '../../../../services/storage.service';
import { CategoryService } from '../../../../services/category/category.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-shop',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule ],
  templateUrl: './edit-shop.component.html',
  styleUrl: './edit-shop.component.css'
})
export class EditShopComponent implements OnInit{
    editForm!: FormGroup;
    businessId!: number;
    business!: Business;
    imagePreview: string | ArrayBuffer | null = null;
    imageFile: File | null = null;
    imageError: string | null = null;
    token! :string | null ;
    userId!:any ;
    businesses: any[] | null = null;
    private map: any;
    private marker: any;
    private L: any;
    locationError:any;

    categories: businessCategory[] = [];

    constructor(
      @Inject(PLATFORM_ID) private platformId: Object,
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private businessService: BusinessService,
       private jwtService: JwtService,
       private storageService: StorageService,
       private categoryService: CategoryService,
       private http: HttpClient
    ) {}


  ngOnInit(): void {
      this.editForm = this.fb.group({
        name: ['', Validators.required],
        location: ['', Validators.required],
        tempLocation: ['', Validators.required],
        description: ['', Validators.maxLength(500)],
        contactNumber: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
        category: ['', Validators.required],
        status: [false],
        userName: [{ value: '', disabled: true }],
        userEmail: [{value:'',disabled: true}],
      });

      this.loadCategories();

      this.businessId = +this.route.snapshot.paramMap.get('id')!;

      this.token = this.storageService.getItem("token");
      if (this.token) {
        this.userId = this.jwtService.getUserId(this.token);
        this.businessService.getAllBusiness(this.userId).subscribe(
          response => {
            this.businesses = response;
            console.log("RES: ", this.businesses);
          },
          error => {
            console.error("ERROR IN FETCHING: ", error);
          }
        );
      } else {
        console.error("No token found");
        this.router.navigate(['/login']);
      }

      if (isPlatformBrowser(this.platformId)) {
        import('leaflet').then(L => {
          import('leaflet-fullscreen').then(() => {
            this.L = L;

            // Initial marker coordinates
            const markerCoordinates: [number, number] = [16.775216025398958, 96.15902781486511];
            this.map = L.map('map').setView(markerCoordinates, 15);

            // Add tile layer
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors',
            }).addTo(this.map);

            // Add fullscreen control
            L.control.fullscreen({
              position: 'topleft',
              title: 'View Fullscreen',
              titleCancel: 'Exit Fullscreen',
            }).addTo(this.map);

            // Add click event for selecting a location
            this.map.on('click', (e: any) => {
              const { lat, lng } = e.latlng;

              // Remove previous marker if it exists
              if (this.marker) {
                this.map.removeLayer(this.marker);
              }

              // Add new marker at clicked location
              this.marker = L.marker([lat, lng])
                .addTo(this.map)
                .bindPopup(`Latitude: ${lat}, Longitude: ${lng}`)
                .openPopup();
                // this.getLocationName(lat, lng);
              console.log(`Selected Location: Latitude: ${lat}, Longitude: ${lng}`);
            });

            // Create a custom control for the search box
            const SearchControl = L.Control.extend({
              options: { position: 'topright' }, // Temporary position, CSS will override
              onAdd: () => {
                const div = L.DomUtil.create('div', 'leaflet-control-search');
                div.innerHTML = `<input type="text" id="searchInput" placeholder="Search location..." />`;
                return div;
              }
            });

            // Add search box to the map
            this.map.addControl(new SearchControl());

            // Listen for Enter key to search
            setTimeout(() => {
              const input = document.getElementById('searchInput') as HTMLInputElement;
              input.addEventListener('keyup', (event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                  this.searchLocation(input.value);
                }
              });
            }, 500);
          });
        });
      }

      this.businessService.getById(this.businessId).subscribe(
        (response: Business) => {
          this.business = response;
          this.editForm.patchValue(response);
          this.getLocationName(response.location);
          this.setCategoryIfBusinessLoaded();
        },
        (error) => {
          console.error('Error fetching business data:', error);
          this.router.navigate(['/']);
        }
      );

    }


    onImageChange(event: Event): void {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          this.imageError = 'Only image files are allowed.';
          return;
        }

        this.imageError = null;
        if (this.business) {
          this.business.imageFile= file; // Assign the file object here
        }
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
        console.log('Uploaded File Name:', file.name);
      }
    }


    getImageUrl(imagePath: string): string {
      return this.businessService.getImageUrl(imagePath);
    }



    onSubmit(): void {
      if (this.editForm.invalid) {
        console.error('Form is invalid');
        return;
      }


      const formData = new FormData();
      const formValue=this.editForm.value;
      formData.append('name', formValue.name ?? '');
      formData.append('userId',this.userId ?? '');
      formData.append('location', formValue.location ?? '');
      formData.append('description', formValue.description ?? '');
      formData.append('contactNumber', formValue.contactNumber ?? '');
      formData.append('categoryId', formValue.category ?? '');



  // If there's a new image file
  if (this.business.imageFile) {
    formData.append('imageFile', this.business.imageFile, this.business.imageFile.name);
  }

      this.businessService.update(this.businessId, formData).subscribe(
        success => {
          console.log('Business updated successfully');
          this.router.navigate(['/o/shop', this.businessId]);
        },
        error => console.error('Error updating business:', error)
      );
    }

    onCancel(): void {
      this.router.navigate(['/']);
    }

    goBack(): void {
      this.router.navigate(['/o/shop', this.businessId]);
    }




    loadCategories(): void {
      this.categoryService.getAllCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
          this.setCategoryIfBusinessLoaded();
        },
        error: (error) => {
          console.error('Error fetching categories:', error);
        },
      });
    }

    setCategoryIfBusinessLoaded(): void {
      if (this.business && this.categories.length > 0) {
        const selectedCategory = this.categories.find(
          (category) => category.id === this.business.categoryId
        );
        if (selectedCategory) {
          this.editForm.get('category')?.setValue(selectedCategory.id);
          console.log("Selected Category from Business:", selectedCategory);
        }
      }
    }

    searchLocation(query: string) {
      if (!query) return;

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`;

      this.http.get(url).subscribe((response: any) => {
        if (response.length > 0) {
          const { lat, lon, display_name } = response[0];

          // Remove previous marker if it exists
          if (this.marker) {
            this.map.removeLayer(this.marker);
          }

          // Add a new marker for the searched location
          this.marker = this.L.marker([lat, lon])
            .addTo(this.map)
            .bindPopup(`<b>${display_name}</b>`)
            .openPopup();

          // Move the map to the searched location
          this.map.setView([lat, lon], 15);
        } else {
          console.log('Location not found');
        }
      });
    }

    getLocationName(location: string) {
      const [lat, lon] = location.split(',').map(coord => parseFloat(coord.trim()));
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const locationName = data.display_name;

          this.editForm.get('location')?.setValue(`${lat}, ${lon}`);
          console.log(`Location Name: ${locationName}`);
          this.editForm.get('tempLocation')?.setValue(locationName);
        })
        .catch((error) => {
          console.error('Error fetching location name:', error);
        });
    }

  }
