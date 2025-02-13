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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SpinningLoaderComponent } from '@digital-blocks/angular/core/components';
import { GoogleMapsDirective } from '@digital-blocks/angular/core/util/directives';
import {
  IPharmacyDetails,
  PlPharmacySearchFacade
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-search';
import { combineLatest } from 'rxjs';

import { PlPharmacyMapStore } from './pl-pharmacy-map.store';

@Component({
  selector: 'lib-pl-pharmacy-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsDirective, SpinningLoaderComponent],
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

  @Output() public createPlatFormSpecificURL = new EventEmitter<{
    baseURL: string;
    lat: string;
    long: string;
  }>();

  private readonly destroyRef = inject(DestroyRef);
  protected readonly plPharmacySearchFacade = inject(PlPharmacySearchFacade);

  pharmacies: IPharmacyDetails[] | undefined;
  selectedPharmacy: IPharmacyDetails | undefined;
  options:
    | {
        center: { lat: number; lng: number };
        zoom?: number;
        markers?: { position: { lat: number; lng: number } }[];
      }
    | undefined;

  public ngOnInit(): void {
    combineLatest([this.plPharmacySearchFacade.retailFindPharmacy$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([pharmacies]) => {
        this.pharmacies = pharmacies;

        if (pharmacies && pharmacies.length > 0) {
          const markers = pharmacies.map((pharmacy) => ({
            position: {
              lat: Number(pharmacy.latitude.toFixed(6)),
              lng: Number(pharmacy.longitude.toFixed(6))
            }
          }));

          this.options = {
            center: markers[0].position, // Center on the first pharmacy
            zoom: 12,
            markers
          };

          // Emit first pharmacy's location for directions
          this.createPlatFormSpecificURL.emit({
            baseURL: 'https://www.google.com/maps/search/?api=1&query=',
            lat: markers[0].position.lat.toFixed(6),
            long: markers[0].position.lng.toFixed(6)
          });
        }
      });
  }
}
