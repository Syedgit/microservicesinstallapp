📌 1️⃣ pl-pharmacy-map.component.ts
typescript
Copy
Edit
import { Component, OnInit, Input, AfterViewInit, inject } from '@angular/core';
import { PlPharmacyMapFacade } from './store/pl-pharmacy-map.facade';

@Component({
  selector: 'lib-pl-pharmacy-map',
  templateUrl: './pl-pharmacy-map.component.html',
  styleUrls: ['./pl-pharmacy-map.component.scss']
})
export class PlPharmacyMapComponent implements OnInit, AfterViewInit {
  private readonly mapFacade = inject(PlPharmacyMapFacade);

  @Input() pharmacyLocations: { lat: number; lng: number; name: string }[] = [];

  ngOnInit(): void {
    this.mapFacade.loadGoogleMap();
  }

  ngAfterViewInit(): void {
    if (this.pharmacyLocations?.length) {
      this.mapFacade.setPharmacyLocations(this.pharmacyLocations);
    }
  }
}
📌 2️⃣ pl-pharmacy-map.component.html
html
Copy
Edit
<div id="googleMapContainer" class="map-container"></div>
📌 3️⃣ pl-pharmacy-map.service.ts
typescript
Copy
Edit
import { Injectable } from '@angular/core';
import { from, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlPharmacyMapService {
  private readonly googleMapsApiKey: string = 'YOUR_GOOGLE_MAPS_API_KEY';
  private scriptLoaded = false;
  private map!: google.maps.Map;
  private markers: google.maps.Marker[] = [];
  public mapReady$ = new BehaviorSubject<boolean>(false);

  /** Loads Google Maps API dynamically */
  public loadGoogleMapScript(): Observable<void> {
    return from(
      new Promise<void>((resolve, reject) => {
        if (this.scriptLoaded || window.google?.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&callback=__googleMapsLoaded`;
        script.async = true;
        script.defer = true;

        window.__googleMapsLoaded = () => {
          this.scriptLoaded = true;
          this.mapReady$.next(true);
          resolve();
        };

        script.onerror = (error) => reject(error);
        document.body.appendChild(script);
      })
    );
  }

  /** Initializes the Google Map */
  public initializeMap(lat: number, lng: number): void {
    const mapElement = document.getElementById('googleMapContainer') as HTMLElement;

    this.map = new google.maps.Map(mapElement, {
      center: { lat, lng },
      zoom: 12
    });

    this.mapReady$.next(true);
  }

  /** Adds pushpins for pharmacies */
  public addPharmacyMarkers(pharmacies: { lat: number; lng: number; name: string }[]): void {
    this.clearMarkers();

    pharmacies.forEach((pharmacy) => {
      const marker = new google.maps.Marker({
        position: { lat: pharmacy.lat, lng: pharmacy.lng },
        map: this.map,
        title: pharmacy.name
      });

      this.markers.push(marker);
    });
  }

  /** Clears all markers */
  private clearMarkers(): void {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
  }
}
📌 4️⃣ pl-pharmacy-map.facade.ts
typescript
Copy
Edit
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';
import { PlPharmacyMapFeature } from './pl-pharmacy-map.reducer';

@Injectable({ providedIn: 'root' })
export class PlPharmacyMapFacade {
  protected readonly store = inject(Store);

  public readonly pharmacies$ = this.store.select(PlPharmacyMapFeature.selectPharmacies);
  public readonly loading$ = this.store.select(PlPharmacyMapFeature.selectLoading);

  public loadGoogleMap(): void {
    this.store.dispatch(PlPharmacyMapActions.loadGoogleMap());
  }

  public setPharmacyLocations(pharmacies: { lat: number; lng: number; name: string }[]): void {
    this.store.dispatch(PlPharmacyMapActions.setPharmacyLocations({ pharmacies }));
  }
}
📌 5️⃣ pl-pharmacy-map.actions.ts
typescript
Copy
Edit
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const PlPharmacyMapActions = createActionGroup({
  source: 'PlPharmacyMap',
  events: {
    'Load Google Map': emptyProps(),
    'Set Pharmacy Locations': props<{ pharmacies: { lat: number; lng: number; name: string }[] }>()
  }
});
📌 6️⃣ pl-pharmacy-map.effects.ts
typescript
Copy
Edit
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';
import { PlPharmacyMapService } from '../services/pl-pharmacy-map.service';

@Injectable()
export class PlPharmacyMapEffects {
  private readonly actions$ = inject(Actions);
  private readonly mapService = inject(PlPharmacyMapService);

  public loadGoogleMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlPharmacyMapActions.loadGoogleMap),
      tap(() => {
        this.mapService.loadGoogleMapScript().subscribe();
      })
    ), { dispatch: false }
  );

  public setPharmacyLocations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlPharmacyMapActions.setPharmacyLocations),
      tap(({ pharmacies }) => {
        this.mapService.addPharmacyMarkers(pharmacies);
      })
    ), { dispatch: false }
  );
}
📌 7️⃣ pl-pharmacy-map.reducer.ts
typescript
Copy
Edit
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';
import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';

export const PL_PHARMACY_MAP_FEATURE_KEY = 'pl-pharmacy-map';

export interface PlPharmacyMapState {
  pharmacies: { lat: number; lng: number; name: string }[];
  loading: boolean;
}

export const initialPlPharmacyMapState: PlPharmacyMapState = {
  pharmacies: [],
  loading: false
};

const reducer: ActionReducer<PlPharmacyMapState> = createReducer(
  initialPlPharmacyMapState,
  on(PlPharmacyMapActions.setPharmacyLocations, (state, { pharmacies }) => ({
    ...state,
    pharmacies
  }))
);

export const PlPharmacyMapFeature = createFeature({
  name: PL_PHARMACY_MAP_FEATURE_KEY,
  reducer
});
📌 8️⃣ Usage in pharmacy-search.component.ts
typescript
Copy
Edit
@Component({
  selector: 'lib-pharmacy-search',
  templateUrl: './pharmacy-search.component.html',
  styleUrls: ['./pharmacy-search.component.scss']
})
export class PharmacySearchComponent {
  public pharmacyList = [
    { lat: 40.7128, lng: -74.006, name: 'CVS New York' },
    { lat: 34.0522, lng: -118.2437, name: 'CVS Los Angeles' }
  ];
}
Usage in pharmacy-search.component.html
html
Copy
Edit
<lib-pl-pharmacy-map [pharmacyLocations]="pharmacyList"></lib-pl-pharmacy-map>
📌 9️⃣ Usage in pharmacy-detail.component.ts
typescript
Copy
Edit
@Component({
  selector: 'lib-pharmacy-detail',
  templateUrl: './pharmacy-detail.component.html',
  styleUrls: ['./pharmacy-detail.component.scss']
})
export class PharmacyDetailComponent {
  public selectedPharmacy = { lat: 40.7128, lng: -74.006, name: 'CVS New York' };
}
Usage in pharmacy-detail.component.html
html
Copy
Edit
<lib-pl-pharmacy-map [pharmacyLocations]="[selectedPharmacy]"></lib-pl-pharmacy-map>
