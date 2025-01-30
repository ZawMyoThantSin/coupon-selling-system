import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  private map: any;
  private marker: any;
  private L: any;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then(L => {
        import('leaflet-fullscreen').then(() => {
          this.L = L;

          // Initial marker coordinates
          const markerCoordinates: [number, number] = [16.777091763706654, 96.1376074923755];

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

  geocodeAddress(address: string) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json`;

    this.http.get(url).subscribe((response: any) => {
      console.log('Length:', response.length);
      if (response && response.length > 0) {
        const location = response[0];
        const { lat, lon, display_name } = location;
        console.log("Response: "+ response);
        console.log(`Latitude: ${lat}, Longitude: ${lon}`);
        console.log(`Corrected Place Name: ${display_name}`); // Display structured place name
      } else {
        console.log('No results found.');
      }
    });
  }

}
