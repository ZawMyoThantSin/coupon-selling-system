import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { businessCategory } from '../../../../models/business-category';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { CategoryService } from '../../../../services/category/category.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { get } from 'jquery';

@Component({
  selector: 'app-create-shop',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-shop.component.html',
  styleUrl: './create-shop.component.scss'
})
export class CreateShopComponent {
  private map: any;
  private marker: any;
  private L: any;
  imageError:any;
  locationError:any;

  formData = {
    name: '',
    location: '',
    description: '',
    contactNumber: '',
    category: '',
    tempLocation: ''
  };

  categories: businessCategory[] = [];
  previewUrl: string | null = null;
  selectedFile: File | null = null; // For the uploaded file

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private http: HttpClient,
              public modalRef: MdbModalRef<CreateShopComponent>,
              private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
      this.loadCategories();

      if (isPlatformBrowser(this.platformId)) {
        import('leaflet').then(L => {
          import('leaflet-fullscreen').then(() => {
            this.L = L;

            // Initial marker coordinates
            const markerCoordinates: [number, number] = [16.775216025398958, 96.15902781486511];
            this.formData.location = "16.77432233629968,96.15872740745546";
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
                this.getLocationName(lat, lng);
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
  }



onFileChange(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;

    // Generate a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    this.previewUrl = null;
  }
}


  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      },
    });
  }

  close(): void {
    this.modalRef.close();
  }

  submitForm(): void {

    let hasError = false;

  // Check if an image is selected
  if (!this.selectedFile) {
    this.imageError = "Please upload an image.";
    hasError = true;
  } else {
    this.imageError = ""; // Clear error if image exists
  }

  // Check if location is provided
  if (!this.formData.tempLocation || this.formData.tempLocation.trim() === "") {
    this.locationError = "Location is required.";
    hasError = true;
  } else {
    this.locationError = ""; // Clear error if location exists
  }

  // Stop form submission if there are errors
  if (hasError) {
    return;
  }

    if (this.modalRef) {
      if(this.formData){
        const formData = new FormData();
        formData.append('name', this.formData.name);
        formData.append('location', this.formData.location);
        formData.append('description', this.formData.description);
        formData.append('contactNumber', this.formData.contactNumber);
        formData.append('categoryId', this.formData.category);
        if (this.selectedFile) {
          formData.append('image', this.selectedFile);
        }
        this.modalRef.close(formData); // Pass FormData to the parent
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
        this.formData.location = `${lat}, ${lon}`;
        const locationName:any = this.getLocationName(lat, lon);
        this.formData.tempLocation = locationName; // Update the formData location
        // Move the map to the searched location
        this.map.setView([lat, lon], 15);
      } else {
        console.log('Location not found');
      }
    });
  }

  getLocationName(lat: number, lon: number):string | void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const locationName = data.display_name;
        this.formData.location = `${lat}, ${lon}`;
        console.log(`Location Name: ${locationName}`);
        this.formData.tempLocation = locationName; // Update the formData location
        return locationName;
      })
      .catch((error) => {
        console.error('Error fetching location name:', error);
      });
  }

}
