directive

import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  Input,
  PLATFORM_ID,
  Inject,
  AfterViewInit
} from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';

@Directive({
  selector: '[utilBingMaps]'
})
export class BingMapsDirective implements AfterViewInit {
  @Input() options: { center: { lat: number; lng: number }, pushpins: { lat: number; lng: number }[] } | null = null;

  private bingApiKey!: string;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef,
    private configFacade: ConfigFacade,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return; // ✅ Prevent SSR from running Microsoft Maps

    this.bingApiKey = await this.configFacade.bingMapsAPIKey$.toPromise();
    this.loadBingMap();
  }

  private loadBingMap(): void {
    if (!this.options) return;

    const scriptId = 'bing-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.bing.com/api/maps/mapcontrol?callback=__bingMapsLoaded&key=${this.bingApiKey}`;
      script.async = true;
      script.defer = true;

      window['__bingMapsLoaded'] = () => {
        this.initializeMap();
      };

      document.body.appendChild(script);
    } else {
      this.initializeMap();
    }
  }

  private initializeMap(): void {
    if (!this.options) return;

    const map = new Microsoft.Maps.Map(this.el.nativeElement, {
      credentials: this.bingApiKey,
      center: new Microsoft.Maps.Location(this.options.center.lat, this.options.center.lng),
      zoom: 12
    });

    this.options.pushpins.forEach((pin) => {
      const location = new Microsoft.Maps.Location(pin.lat, pin.lng);
      const pushpin = new Microsoft.Maps.Pushpin(location);
      map.entities.push(pushpin);
    });
  }
}


pl-pharmacy-map component

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { BingMapsDirective } from './bing-maps.directive';
import { PharmacyDetail } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

@Component({
  selector: 'lib-pl-pharmacy-map',
  standalone: true,
  imports: [CommonModule, BingMapsDirective],
  templateUrl: 'pl-pharmacy-map.component.html',
  styleUrls: ['pl-pharmacy-map.component.scss']
})
export class PlPharmacyMapComponent {
  @Input() pharmacies: PharmacyDetail[] = [];

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get mapOptions() {
    return this.isBrowser
      ? {
          center: this.pharmacies.length
            ? { lat: this.pharmacies[0].latitude, lng: this.pharmacies[0].longitude }
            : { lat: 0, lng: 0 },
          pushpins: this.pharmacies.map((pharmacy) => ({
            lat: pharmacy.latitude,
            lng: pharmacy.longitude
          }))
        }
      : null;
  }
}


map html

@if (mapOptions) {
  <div utilBingMaps class="pharmacy-map" [options]="mapOptions"></div>
}
