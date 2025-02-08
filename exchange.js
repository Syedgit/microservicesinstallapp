pl-pharmacy-map.actions.ts

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PharmacyDetail } from '../pl-pharmacy-map.types';

export const PlPharmacyMapActions = createActionGroup({
  source: 'PlPharmacyMap',
  events: {
    'Load Bing Map': emptyProps(),
    'Set Map Pharmacies': props<{ pharmacies: PharmacyDetail[] }>(),
    'Set Selected Pharmacy': props<{ selectedPharmacy: PharmacyDetail | null }>(),
    'Clear Selected Pharmacy': emptyProps(),
    'Map Loaded': emptyProps()
  }
});

pl-pharmacy-map.reducer.ts

import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';
import { PharmacyDetail } from '../pl-pharmacy-map.types';
import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';

export const PL_PHARMACY_MAP_FEATURE_KEY = 'pl-pharmacy-map';

export interface PlPharmacyMapState {
  pharmacies: PharmacyDetail[];
  selectedPharmacy: PharmacyDetail | null;
  mapLoaded: boolean;
}

export const initialPlPharmacyMapState: PlPharmacyMapState = {
  pharmacies: [],
  selectedPharmacy: null,
  mapLoaded: false
};

const reducer: ActionReducer<PlPharmacyMapState> = createReducer(
  initialPlPharmacyMapState,
  on(PlPharmacyMapActions.setMapPharmacies, (state, { pharmacies }) => ({
    ...state,
    pharmacies
  })),
  on(PlPharmacyMapActions.setSelectedPharmacy, (state, { selectedPharmacy }) => ({
    ...state,
    selectedPharmacy
  })),
  on(PlPharmacyMapActions.mapLoaded, (state) => ({
    ...state,
    mapLoaded: true
  }))
);

export const PlPharmacyMapFeature = createFeature({
  name: PL_PHARMACY_MAP_FEATURE_KEY,
  reducer
});

pl-pharmacy.effects.ts

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';

@Injectable()
export class PlPharmacyMapEffects {
  private readonly actions$ = inject(Actions);

  public loadBingMap$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PlPharmacyMapActions.loadBingMap),
        tap(() => {
          const script = document.createElement('script');
          script.src = `https://www.bing.com/api/maps/mapcontrol?key=YOUR_BING_MAPS_API_KEY&callback=bingMapsLoaded`;
          script.async = true;
          document.body.appendChild(script);

          window['bingMapsLoaded'] = () => {
            // Notify store when map is ready
            PlPharmacyMapActions.mapLoaded();
          };
        })
      ),
    { dispatch: false }
  );
}

pl-pharmacy.facade.ts

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PharmacyDetail } from '../pl-pharmacy-map.types';
import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';
import { PlPharmacyMapFeature } from './pl-pharmacy-map.reducer';

@Injectable({ providedIn: 'root' })
export class PlPharmacyMapFacade {
  protected readonly store = inject(Store);

  public readonly pharmacies$ = this.store.select(PlPharmacyMapFeature.selectPharmacies);
  public readonly selectedPharmacy$ = this.store.select(PlPharmacyMapFeature.selectSelectedPharmacy);
  public readonly mapLoaded$ = this.store.select(PlPharmacyMapFeature.selectMapLoaded);

  public loadBingMap(): void {
    this.store.dispatch(PlPharmacyMapActions.loadBingMap());
  }

  public setMapPharmacies(pharmacies: PharmacyDetail[]): void {
    this.store.dispatch(PlPharmacyMapActions.setMapPharmacies({ pharmacies }));
  }

  public setSelectedPharmacy(selectedPharmacy: PharmacyDetail | null): void {
    this.store.dispatch(PlPharmacyMapActions.setSelectedPharmacy({ selectedPharmacy }));
  }
}


pl-pharmacy-map.component.ts

import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { PlPharmacyMapFacade } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-map';

@Component({
  selector: 'lib-pl-pharmacy-map',
  imports: [CommonModule],
  templateUrl: 'pl-pharmacy-map.component.html',
  styleUrls: ['pl-pharmacy-map.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { ngSkipHydration: 'true' }
})
export class PlPharmacyMapComponent implements OnInit, AfterViewInit {
  pharmacies$ = this.mapFacade.pharmacies$;
  selectedPharmacy$ = this.mapFacade.selectedPharmacy$;

  constructor(private readonly mapFacade: PlPharmacyMapFacade) {}

  ngOnInit(): void {
    this.mapFacade.loadBingMap();
  }

  ngAfterViewInit(): void {
    this.mapFacade.mapLoaded$.subscribe((loaded) => {
      if (loaded) {
        this.initializeMap();
      }
    });
  }

  private initializeMap(): void {
    this.pharmacies$.subscribe((pharmacies) => {
      const map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        credentials: 'YOUR_BING_MAPS_API_KEY',
        zoom: 12
      });

      pharmacies.forEach((pharmacy) => {
        if (pharmacy.latitude && pharmacy.longitude) {
          const pushpin = new Microsoft.Maps.Pushpin(
            new Microsoft.Maps.Location(pharmacy.latitude, pharmacy.longitude),
            { title: pharmacy.pharmacyName }
          );
          map.entities.push(pushpin);
        }
      });
    });
  }
}

pl-pharmacy-map.html

<div class="map-container">
  <div id="myMap" class="my-map"></div>
</div>


pharmacy-search.html

<lib-pl-pharmacy-map [pharmacies]="searchResults"></lib-pl-pharmacy-map>


import { Component } from '@angular/core';
import { PharmacyDetail } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

@Component({
  selector: 'lib-pharmacy-search',
  templateUrl: './pharmacy-search.component.html',
  styleUrls: ['./pharmacy-search.component.scss']
})
export class PharmacySearchComponent {
  searchResults: PharmacyDetail[] = []; // Loaded from API

  constructor() {
    // Simulated search results for testing
    this.searchResults = [
      { pharmacyName: "CVS Pharmacy", latitude: 40.7128, longitude: -74.0060 },
      { pharmacyName: "Walgreens", latitude: 34.0522, longitude: -118.2437 }
    ];
  }
}


pharmacy-detail.html

<lib-pl-pharmacy-map [selectedPharmacy]="selectedPharmacy"></lib-pl-pharmacy-map>


import { Component } from '@angular/core';
import { PlPharmacyDetailFacade, PharmacyDetail } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

@Component({
  selector: 'lib-pharmacy-detail',
  templateUrl: './pharmacy-detail.component.html',
  styleUrls: ['./pharmacy-detail.component.scss']
})
export class PharmacyDetailComponent {
  selectedPharmacy: PharmacyDetail | null = null;

  constructor(private facade: PlPharmacyDetailFacade) {
    this.facade.selectedPharmacy$.subscribe((pharmacy) => {
      this.selectedPharmacy = pharmacy;
    });
  }
}



