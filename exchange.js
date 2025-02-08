import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { PharmacyDetail } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

declare global {
  interface Window {
    Microsoft: typeof Microsoft;
  }
}

@Component({
  selector: 'lib-pl-pharmacy-map',
  templateUrl: 'pl-pharmacy-map.component.html',
  styleUrls: ['pl-pharmacy-map.component.scss']
})
export class PlPharmacyMapComponent implements OnInit, AfterViewInit {
  @Input() pharmacies: PharmacyDetail[] = []; // Multiple locations for search page
  @Input() selectedPharmacy: PharmacyDetail | null = null; // Single location for details page
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map!: Microsoft.Maps.Map;

  ngOnInit(): void {
    this.loadBingMaps();
  }

  ngAfterViewInit(): void {
    if (window.Microsoft && window.Microsoft.Maps) {
      this.initializeMap();
    }
  }

  private loadBingMaps(): void {
    if (window.Microsoft && window.Microsoft.Maps) {
      this.initializeMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://www.bing.com/api/maps/mapcontrol?callback=bingMapsLoaded&key=YOUR_BING_MAPS_API_KEY`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      (window as any).bingMapsLoaded = () => {
        this.initializeMap();
      };
    }
  }

  private initializeMap(): void {
    if (!this.mapContainer?.nativeElement) {
      return;
    }

    this.map = new Microsoft.Maps.Map(this.mapContainer.nativeElement, {
      credentials: 'YOUR_BING_MAPS_API_KEY',
      zoom: 12
    });

    this.addPushpins();
  }

  private addPushpins(): void {
    if (!this.map) return;

    this.map.entities.clear(); // Clear existing pushpins

    const locations = this.selectedPharmacy ? [this.selectedPharmacy] : this.pharmacies;

    locations.forEach((pharmacy) => {
      if (pharmacy.latitude !== undefined && pharmacy.longitude !== undefined) {
        const location = new Microsoft.Maps.Location(pharmacy.latitude, pharmacy.longitude);
        const pushpin = new Microsoft.Maps.Pushpin(location, {
          title: pharmacy.pharmacyName
        });
        this.map.entities.push(pushpin);
      }
    });
  }
}
