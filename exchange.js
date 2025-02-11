directive

import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  AfterViewInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { Loader } from '@googlemaps/js-api-loader';
import { firstValueFrom } from 'rxjs';

@Directive({
  selector: '[utilGoogleMaps]'
})
export class GoogleMapsDirective implements AfterViewInit {
  @Input() locations!: { lat: number; lng: number; label?: string }[];

  @Input() mapHeight = '18.75rem';

  elementRef = inject(ElementRef);
  renderer = inject(Renderer2);
  config = inject(ConfigFacade);
  platformId = inject(PLATFORM_ID);

  apiKey!: string;
  map!: google.maps.Map;

  async ngAfterViewInit() {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'height',
      this.mapHeight
    );

    if (isPlatformBrowser(this.platformId)) {
      this.apiKey = await firstValueFrom(this.config.googleMapsAPIKey$);
      this.createMap();
    }
  }

  private async createMap() {
    const loader = new Loader({
      apiKey: this.apiKey,
      version: 'weekly'
    });

    const googleMaps = await loader.importLibrary('maps');
    const { AdvancedMarkerElement } = await loader.importLibrary('marker');

    // Default center: If no locations, fallback to NYC
    const defaultCenter = { lat: 40.7128, lng: -74.006 };

    this.map = new googleMaps.Map(this.elementRef.nativeElement, {
      zoom: this.locations.length === 1 ? 15 : 12,
      center: this.locations.length ? this.locations[0] : defaultCenter,
      mapId: 'PL-PHARMACY-MAP'
    });

    this.locations.forEach((location) => {
      new AdvancedMarkerElement({
        map: this.map,
        position: { lat: location.lat, lng: location.lng }
      });
    });

    this.fitBounds();
  }

  private fitBounds() {
    if (this.locations.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      this.locations.forEach((loc) => bounds.extend(loc));
      this.map.fitBounds(bounds);
    }
  }
}




pl-pharmacy-map.component.ts

import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnInit
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GoogleMapsDirective } from '@digital-blocks/angular/core/util/directives';
import { PharmacyDetail } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

@Component({
  selector: 'lib-pl-pharmacy-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsDirective],
  templateUrl: 'pl-pharmacy-map.component.html',
  styleUrls: ['pl-pharmacy-map.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { ngSkipHydration: 'true' }
})
export class PlPharmacyMapComponent implements OnInit {
  @Input() pharmacies$!: BehaviorSubject<PharmacyDetail[]>;

  locations: { lat: number; lng: number; label?: string }[] = [];

  ngOnInit(): void {
    this.pharmacies$.subscribe((pharmacies) => {
      this.locations = pharmacies.map((pharmacy) => ({
        lat: Number(pharmacy.latitude),
        lng: Number(pharmacy.longitude),
        label: pharmacy.pharmacyName
      }));
    });
  }
}




pl-pharmacy-map.html

@if (locations.length) {
  <div class="map-container">
    <div utilGoogleMaps [locations]="locations"></div>
  </div>
} @else {
  <util-spinning-loader [loading]="true" />
}




usage


<lib-pl-pharmacy-map [pharmacies$]="selectedPharmacy$"></lib-pl-pharmacy-map>
<lib-pl-pharmacy-map [pharmacies$]="pharmacies$"></lib-pl-pharmacy-map>


<lib-pl-pharmacy-map [selectedPharmacy$]="selectedPharmacy$"></lib-pl-pharmacy-m
