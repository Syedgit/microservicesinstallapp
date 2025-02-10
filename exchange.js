pharmacy-map-component.ts

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
  private markers: google.maps.Marker[] = [];
  private isBrowser: boolean;

  pharmacies$ = this.mapFacade.pharmacies$;
  selectedPharmacy$ = this.mapFacade.selectedPharmacy$;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Ensure only loads in the browser
  }

  ngOnInit(): void {
    if (!this.isBrowser) return; // Prevent execution on the server

    this.pharmacies$.subscribe((pharmacies) => {
      if (this.map) {
        this.loadMarkers(pharmacies);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return; // Prevent execution on the server

    this.initializeMap();
  }

  private async initializeMap(): Promise<void> {
    const loader = new Loader({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
      version: 'weekly'
    });

    const googleMaps = await loader.importLibrary('maps');

    this.map = new googleMaps.Map(this.mapElement.nativeElement.querySelector('#googleMap'), {
      center: { lat: 40.7128, lng: -74.0060 },
      zoom: 12
    });

    this.pharmacies$.subscribe((pharmacies) => {
      this.loadMarkers(pharmacies);
    });
  }

  private loadMarkers(pharmacies: PharmacyLocation[]): void {
    if (!this.map) return;

    // Clear old markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    pharmacies.forEach(pharmacy => {
      const marker = new google.maps.Marker({
        position: { lat: pharmacy.latitude, lng: pharmacy.longitude },
        map: this.map,
        title: pharmacy.name
      });

      this.markers.push(marker);
    });
  }
}


pharmacy.map html

<div *ngIf="isBrowser" id="googleMap" class="google-map"></div>


pharmacy.types
]
export interface PharmacyLocation {
  name: string;
  latitude: number;
  longitude: number;
}

pharmacy actions

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PharmacyLocation } from '../pharmacy-map.types';

export const PharmacyMapActions = createActionGroup({
  source: 'PharmacyMap',
  events: {
    'Set Pharmacies On Map': props<{ pharmacies: PharmacyLocation[] }>(),
    'Clear Pharmacies From Map': emptyProps(),
    'Set Selected Pharmacy': props<{ selectedPharmacy: PharmacyLocation }>(),
  }
});

pharmacy reducer

import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';
import { PharmacyMapActions } from './pharmacy-map.actions';
import { PharmacyLocation } from '../pharmacy-map.types';

export const PHARMACY_MAP_FEATURE_KEY = 'pharmacy-map';

export interface PharmacyMapState {
  pharmacies: PharmacyLocation[];
  selectedPharmacy: PharmacyLocation | null;
}

export const initialPharmacyMapState: PharmacyMapState = {
  pharmacies: [],
  selectedPharmacy: null
};

const reducer: ActionReducer<PharmacyMapState> = createReducer(
  initialPharmacyMapState,
  on(PharmacyMapActions.setPharmaciesOnMap, (state, { pharmacies }) => ({
    ...state,
    pharmacies
  })),
  on(PharmacyMapActions.clearPharmaciesFromMap, (state) => ({
    ...state,
    pharmacies: []
  })),
  on(PharmacyMapActions.setSelectedPharmacy, (state, { selectedPharmacy }) => ({
    ...state,
    selectedPharmacy
  }))
);

export const PharmacyMapFeature = createFeature({
  name: PHARMACY_MAP_FEATURE_KEY,
  reducer
});

pharmacy effects

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { PharmacyMapActions } from './pharmacy-map.actions';

@Injectable()
export class PharmacyMapEffects {
  private readonly actions$ = inject(Actions);

  storeSelectedPharmacy$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PharmacyMapActions.setSelectedPharmacy),
        tap(({ selectedPharmacy }) => {
          sessionStorage.setItem(
            'selectedPharmacy',
            JSON.stringify(selectedPharmacy)
          );
        })
      ),
    { dispatch: false }
  );

  clearPharmacyOnLeave$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PharmacyMapActions.clearPharmaciesFromMap),
        tap(() => {
          sessionStorage.removeItem('selectedPharmacy');
        })
      ),
    { dispatch: false }
  );
}

facade

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PharmacyMapActions } from './pharmacy-map.actions';
import { PharmacyMapFeature } from './pharmacy-map.reducer';
import { PharmacyLocation } from '../pharmacy-map.types';

@Injectable({ providedIn: 'root' })
export class PharmacyMapFacade {
  protected readonly store = inject(Store);

  public readonly pharmacies$: Observable<PharmacyLocation[]> =
    this.store.select(PharmacyMapFeature.selectPharmacies);

  public readonly selectedPharmacy$: Observable<PharmacyLocation | null> =
    this.store.select(PharmacyMapFeature.selectSelectedPharmacy);

  public setPharmacies(pharmacies: PharmacyLocation[]): void {
    this.store.dispatch(PharmacyMapActions.setPharmaciesOnMap({ pharmacies }));
  }

  public clearPharmacies(): void {
    this.store.dispatch(PharmacyMapActions.clearPharmaciesFromMap());
  }

  public setSelectedPharmacy(selectedPharmacy: PharmacyLocation): void {
    this.store.dispatch(
      PharmacyMapActions.setSelectedPharmacy({ selectedPharmacy })
    );
  }
}


