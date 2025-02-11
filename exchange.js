import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GoogleMapsDirective } from '@digital-blocks/angular/core/util/directives';
import { Pharmacy } from '../pl-pharmacy.types';
import { PlPharmacyMapStore } from './pl-pharmacy-map.store';

@Component({
  selector: 'lib-pl-pharmacy-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsDirective],
  templateUrl: './pl-pharmacy-map.component.html',
  styleUrls: ['./pl-pharmacy-map.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PlPharmacyMapStore],
  host: { ngSkipHydration: 'true' }
})
export class PlPharmacyMapComponent implements OnInit {
  @Input() public googleURL!: string;
  @Input() public isModal!: boolean;
  @Input() public externalMapHref!: string;
  @Input() public pharmacies$!: BehaviorSubject<Pharmacy[] | undefined>;
  @Input() public selectedPharmacy$!: BehaviorSubject<Pharmacy | undefined>; // Handle Selected Pharmacy

  @Output() public createPlatFormSpecificURL = new EventEmitter<{
    baseURL: string;
    lat: string;
    long: string;
  }>();

  private readonly destroyRef = inject(DestroyRef);

  pharmacies: Pharmacy[] | undefined;
  selectedPharmacy: Pharmacy | undefined;
  options:
    | {
        center: { lat: number; lng: number };
        zoom?: number;
        markers: { position: { lat: number; lng: number } }[];
      }
    | undefined;

  public ngOnInit(): void {
    combineLatest([this.pharmacies$ ?? of([]), this.selectedPharmacy$ ?? of(undefined)])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([pharmacies, selectedPharmacy]) => {
        this.pharmacies = pharmacies;
        this.selectedPharmacy = selectedPharmacy;

        if (selectedPharmacy) {
          // If a selected pharmacy exists, prioritize it
          this.options = {
            center: {
              lat: Number(selectedPharmacy.latitude),
              lng: Number(selectedPharmacy.longitude)
            },
            zoom: 15, // More zoom for a single location
            markers: [
              {
                position: {
                  lat: Number(selectedPharmacy.latitude),
                  lng: Number(selectedPharmacy.longitude)
                }
              }
            ]
          };
        } else if (pharmacies.length > 0) {
          // Otherwise, load multiple pharmacies from search
          this.options = {
            center: {
              lat: Number(pharmacies[0].latitude),
              lng: Number(pharmacies[0].longitude)
            },
            zoom: 12,
            markers: pharmacies.map((pharmacy) => ({
              position: {
                lat: Number(pharmacy.latitude),
                lng: Number(pharmacy.longitude)
              }
            }))
          };
        }
      });
  }
}



map html

@if (options) {
  <div class="map-container">
    <h3>
      {{ selectedPharmacy ? 'Pharmacy Location' : 'Nearby Pharmacies' }}
    </h3>
    <div utilGoogleMaps [options]="options"></div>
  </div>
} @else {
  <util-spinning-loader [loading]="true" />
}


pharmacy search 

<lib-pl-pharmacy-map
  [googleURL]="googleURL"
  [isModal]="false"
  [selectedPharmacy$]="selectedPharmacy$"
  [externalMapHref]="externalMapHref"
  (createPlatFormSpecificURL)="createPlatFormSpecificURL.emit($event)" />


  <lib-pl-pharmacy-map
  [googleURL]="googleURL"
  [isModal]="false"
  [pharmacies$]="pharmacies$"
  [externalMapHref]="externalMapHref"
  (createPlatFormSpecificURL)="createPlatFormSpecificURL.emit($event)" />

