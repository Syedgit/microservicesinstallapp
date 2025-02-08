
actions


import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { PharmacyDetail } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

export const PlPharmacyMapActions = createActionGroup({
  source: 'PlPharmacyMap',
  events: {
    'Initialize Map': emptyProps(),
    'Set Selected Pharmacy': props<{ selectedPharmacy: PharmacyDetail }>(),
    'Set Pharmacies': props<{ pharmacies: PharmacyDetail[] }>(),
    'Set Map Loaded': props<{ loaded: boolean }>(),
    'Map Load Failure': props<{ error: string }>()
  }
});


reducer

import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';
import { PharmacyDetail } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';

export const PL_PHARMACY_MAP_FEATURE_KEY = 'pl-pharmacy-map';

export interface PlPharmacyMapState {
  selectedPharmacy: PharmacyDetail | null;
  pharmacies: PharmacyDetail[];
  mapLoaded: boolean;
  error: string | null;
}

export const initialPlPharmacyMapState: PlPharmacyMapState = {
  selectedPharmacy: null,
  pharmacies: [],
  mapLoaded: false,
  error: null
};

const reducer: ActionReducer<PlPharmacyMapState> = createReducer(
  initialPlPharmacyMapState,
  on(PlPharmacyMapActions.initializeMap, (state) => ({
    ...state,
    mapLoaded: false
  })),
  on(PlPharmacyMapActions.setSelectedPharmacy, (state, { selectedPharmacy }) => ({
    ...state,
    selectedPharmacy
  })),
  on(PlPharmacyMapActions.setPharmacies, (state, { pharmacies }) => ({
    ...state,
    pharmacies
  })),
  on(PlPharmacyMapActions.setMapLoaded, (state, { loaded }) => ({
    ...state,
    mapLoaded: loaded
  })),
  on(PlPharmacyMapActions.mapLoadFailure, (state, { error }) => ({
    ...state,
    error
  }))
);

export const PlPharmacyMapFeature = createFeature({
  name: PL_PHARMACY_MAP_FEATURE_KEY,
  reducer
});

effects


import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';
import { PlPharmacyMapService } from '../services/pl-pharmacy-map.service';
import { catchError, map, of, tap } from 'rxjs';

@Injectable()
export class PlPharmacyMapEffects {
  private readonly actions$ = inject(Actions);
  private readonly mapService = inject(PlPharmacyMapService);

  loadBingMaps$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlPharmacyMapActions.initializeMap),
      tap(() => this.mapService.loadBingMapScript()),
      map(() => PlPharmacyMapActions.setMapLoaded({ loaded: true })),
      catchError((error) => of(PlPharmacyMapActions.mapLoadFailure({ error: error.message })))
    )
  );
}


facade

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';
import { PlPharmacyMapFeature } from './pl-pharmacy-map.reducer';
import { PharmacyDetail } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

@Injectable({ providedIn: 'root' })
export class PlPharmacyMapFacade {
  protected readonly store = inject(Store);

  public readonly selectedPharmacy$ = this.store.select(
    PlPharmacyMapFeature.selectSelectedPharmacy
  );

  public readonly pharmacies$ = this.store.select(
    PlPharmacyMapFeature.selectPharmacies
  );

  public readonly mapLoaded$ = this.store.select(
    PlPharmacyMapFeature.selectMapLoaded
  );

  public initializeMap(): void {
    this.store.dispatch(PlPharmacyMapActions.initializeMap());
  }

  public setSelectedPharmacy(selectedPharmacy: PharmacyDetail): void {
    this.store.dispatch(PlPharmacyMapActions.setSelectedPharmacy({ selectedPharmacy }));
  }

  public setPharmacies(pharmacies: PharmacyDetail[]): void {
    this.store.dispatch(PlPharmacyMapActions.setPharmacies({ pharmacies }));
  }
}


service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlPharmacyMapService {
  private bingMapsApiKey = 'YOUR_BING_MAPS_API_KEY';
  public mapServiceInitialized = new BehaviorSubject<boolean>(false);
  private map!: Microsoft.Maps.Map;

  public loadBingMapScript(): void {
    if (window.Microsoft && window.Microsoft.Maps) {
      this.mapServiceInitialized.next(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.bing.com/api/maps/mapcontrol?callback=bingMapsLoaded&key=${this.bingMapsApiKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => this.mapServiceInitialized.next(true);
    document.body.appendChild(script);
  }

  public initializeMap(mapContainer: HTMLDivElement, latitude: number, longitude: number): void {
    if (!mapContainer) return;

    this.map = new Microsoft.Maps.Map(mapContainer, {
      credentials: this.bingMapsApiKey,
      center: new Microsoft.Maps.Location(latitude, longitude),
      zoom: 12
    });
  }
}


component.ts

import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PlPharmacyMapFacade } from '../store/pl-pharmacy-map.facade';
import { PharmacyDetail } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

@Component({
  selector: 'lib-pl-pharmacy-map',
  templateUrl: 'pl-pharmacy-map.component.html',
  styleUrls: ['pl-pharmacy-map.component.scss']
})
export class PlPharmacyMapComponent implements OnInit, AfterViewInit {
  @Input() pharmacies: PharmacyDetail[] = [];
  @Input() selectedPharmacy: PharmacyDetail | null = null;
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  constructor(private mapFacade: PlPharmacyMapFacade) {}

  ngOnInit(): void {
    this.mapFacade.initializeMap();
  }

  ngAfterViewInit(): void {
    this.mapFacade.mapLoaded$.subscribe((loaded) => {
      if (loaded && this.mapContainer?.nativeElement) {
        // Use service to initialize map and add pushpins
      }
    });
  }
}

component.html

<div #mapContainer class="map-container"></div>


css 


.map-container {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}


usage
<lib-pl-pharmacy-map [pharmacies]="pharmacyResults"></lib-pl-pharmacy-map>

<lib-pl-pharmacy-map [selectedPharmacy]="selectedPharmacy"></lib-pl-pharmacy-map>








