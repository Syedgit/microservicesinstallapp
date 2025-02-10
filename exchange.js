import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  ElementRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PharmacyMapFacade } from '../store/pharmacy-map.facade';
import { PharmacyLocation } from '../store/pharmacy-map.types';
import { Loader } from '@googlemaps/js-api-loader';

@Component({
  selector: 'lib-pharmacy-map',
  templateUrl: './pharmacy-map.component.html',
  styleUrls: ['./pharmacy-map.component.scss']
})
export class PharmacyMapComponent implements OnInit, AfterViewInit {
  private mapFacade = inject(PharmacyMapFacade);
  private mapElement = inject(ElementRef);
  private map!: google.maps.Map;
  private marker!: google.maps.marker.AdvancedMarkerElement;
  private isBrowser: boolean;

  selectedPharmacy$ = this.mapFacade.selectedPharmacy$;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.selectedPharmacy$.subscribe((pharmacy) => {
      if (pharmacy && this.map) {
        this.loadMarker(pharmacy);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.initializeMap();
  }

  private async initializeMap(): Promise<void> {
    const loader = new Loader({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
      version: 'weekly'
    });

    const googleMaps = await loader.importLibrary('maps');
    const { AdvancedMarkerElement } = await loader.importLibrary('marker');

    this.map = new googleMaps.Map(this.mapElement.nativeElement.querySelector('#googleMap'), {
      center: { lat: 40.7128, lng: -74.0060 }, // Default center (New York)
      zoom: 12
    });

    this.selectedPharmacy$.subscribe((pharmacy) => {
      if (pharmacy) {
        this.loadMarker(pharmacy, AdvancedMarkerElement);
      }
    });
  }

  private loadMarker(pharmacy: PharmacyLocation, AdvancedMarkerElement?: typeof google.maps.marker.AdvancedMarkerElement): void {
    if (!this.map || !pharmacy) return;

    if (!AdvancedMarkerElement) {
      AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;
    }

    // Remove existing marker
    if (this.marker) {
      this.marker.map = null;
    }

    this.marker = new AdvancedMarkerElement({
      map: this.map,
      position: { lat: pharmacy.latitude, lng: pharmacy.longitude },
      title: pharmacy.name
    });
  }
}
