bingMaps directive


import { Directive, ElementRef, Input, AfterViewInit, inject } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';

declare const Microsoft: any;

@Directive({
  selector: '[utilBingMaps]'
})
export class BingMapsDirective implements AfterViewInit {
  @Input() options: { center: { lat: number; lng: number }, pushpins: { lat: number; lng: number }[] } | null = null;
  private configFacade = inject(ConfigFacade);
  private bingApiKey!: string;

  constructor(private el: ElementRef) {}

  async ngAfterViewInit(): Promise<void> {
    this.bingApiKey = await this.configFacade.bingMapsAPIKey$.toPromise();
    this.loadBingMap();
  }

  private loadBingMap(): void {
    if (!this.options) return;

    const script = document.createElement('script');
    script.src = `https://www.bing.com/api/maps/mapcontrol?callback=__bingMapsLoaded&key=${this.bingApiKey}`;
    script.async = true;
    script.defer = true;

    window['__bingMapsLoaded'] = () => {
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
    };

    document.body.appendChild(script);
  }
}


pl-pharmacy-map

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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

  get mapOptions() {
    return {
      center: this.pharmacies.length ? { lat: this.pharmacies[0].latitude, lng: this.pharmacies[0].longitude } : { lat: 0, lng: 0 },
      pushpins: this.pharmacies.map((pharmacy) => ({
        lat: pharmacy.latitude,
        lng: pharmacy.longitude
      }))
    };
  }
}

pl-pharmacy-map html

<div utilBingMaps class="pharmacy-map" [options]="mapOptions"></div>



using directive


<lib-pl-pharmacy-map [pharmacies]="[selectedPharmacy]"></lib-pl-pharmacy-map>


<lib-pl-pharmacy-map [pharmacies]="pharmacies"></lib-pl-pharmacy-map>
