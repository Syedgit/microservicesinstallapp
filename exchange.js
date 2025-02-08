import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Destroyable, WhitelabelService, TealiumService } from '@cvsdigital_ui/cmk-core-util';
import { first } from 'rxjs';

import { pharmacyResult } from '../../../mocks/mockRequestData';
import { pharmacyLocalString, TEALIUM } from '../../../shared/constants';
import { MapService } from '../../map.service';
import { Pharmacy } from '../../models/pharmacy';
import { LanguageToggleService } from '../../services/language-toggle/language-toggle.service';
import { PrintService } from '../../services/print/print.service';

interface SearchDirectionsForm {
  fromPosition: FormControl<string | null>;
  directionModeOptions: FormGroup<{
    directionMode: FormControl<string | null>;
  }>;
}

@Component({
  selector: 'lib-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss']
})
export class MapPageComponent extends Destroyable implements OnInit, AfterViewInit {
  public pharmacyInfo: Pharmacy | null = pharmacyResult[0];
  public localString =
    this.languageToggleService.pharmacyLocalString[this.languageToggleService.currentLanguage];
  public window: any;
  public searchDirectionsForm: FormGroup<SearchDirectionsForm> = new FormGroup({
    fromPosition: new FormControl('', Validators.required),
    directionModeOptions: new FormGroup({
      directionMode: new FormControl('driving', Validators.required)
    })
  });

  constructor(
    private mapService: MapService,
    public readonly printService: PrintService,
    public readonly whitelabelService: WhitelabelService,
    public readonly tealiumService: TealiumService,
    public readonly languageToggleService: LanguageToggleService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.closeOnDestroy(this.languageToggleService.currentLanguage$).subscribe((language) => {
      this.localString = this.languageToggleService.pharmacyLocalString[language];
    });
    this.closeOnDestroy(this.mapService.selectedPharmacy).subscribe((pharmacy) => {
      this.pharmacyInfo = pharmacy;
    });
  }

  public ngAfterViewInit(): void {
    this.mapService.mapServiceInitialized.pipe(first((value: boolean) => value)).subscribe({
      next: (resp) => {
        this.mapService.loadMap('pharmacyLocatorMapDiv');
      },
      error: (error) => {
        throw new Error('Map not Initialized.');
      }
    });
  }

  public onPrintMap(): void {
    this.eventHandler('onClick_mapPrint');
    const printElements = document.querySelector('lib-print-preview-page')!.innerHTML;
    this.printService.printResult(
      '#pharmacyLocatorDirectionsDiv',
      `<head><title>Print</title><style>
      body {
        margin: 0px;
      }
      .map-print_header {
        padding: 15px 28px;
      }
      
      .map-print_print-btn {
        padding: 0 15px;
        margin-top: 42px;
      }
      
      .map-print_header {
        line-height: 1;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 30px;
        font-weight: 500;
        margin-bottom: 38px;
        margin-top: 1.4rem;
        padding: 0 15px;
      }
      
      .map-print_header h2 {
        line-height: 1.1;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 30px;
        font-weight: 500;
        margin-bottom: 0;
        margin-top: 22px;
        padding: 0;
      }
      
      .map-print_address {
        margin-bottom: 14px;
        padding: 0 15px;
        line-height: 1.2rem;
      }
      
      .printhide {
        display: none !important;
      }
      
      .printPrimary {
        background-color: #fff !important;
        border: 1px solid #C8C8C8 !important
      }
      
      .printshow {
        display: block !important;
      }
    </style></head>
        ${printElements}
      `
    );

    this.tealiumService.viewEvent(
      TEALIUM['onLoad_mapPrint'].Page_Data,
      TEALIUM['onLoad_mapPrint'].Additional_Data
    );
  }

  public submitDirections(): void {
    this.eventHandler('onClick_mapDirections');

    this.loadDirections();
  }

  private eventHandler(event: string): void {
    this.tealiumService.linkEvent(TEALIUM[event].Page_Data);
  }

  public loadDirections(): void {
    if (
      !this.pharmacyInfo ||
      this.searchDirectionsForm.invalid ||
      this.searchDirectionsForm.controls['fromPosition'].value == null
    ) {
      return;
    }
    const drivingMode =
      this.searchDirectionsForm.get('directionModeOptions.directionMode')?.value ?? 'driving';
    const fromPosition = this.searchDirectionsForm.controls['fromPosition'].value;
    this.mapService.loadDirections(
      'pharmacyLocatorDirectionsDiv',
      this.pharmacyInfo,
      fromPosition,
      drivingMode
    );
  }
}


Service


import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { getDeviceType, DeviceType } from '@cvsdigital_ui/cmk-core-util';
import { BehaviorSubject, Observable } from 'rxjs';
import 'bingmaps';

import { Pharmacy } from './models/pharmacy';
import { LanguageToggleService } from './services/language-toggle/language-toggle.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  public bingMap!: Microsoft.Maps.Map;
  public directionsManager!: Microsoft.Maps.Directions.DirectionsManager;
  public directionMode!: string;
  public mapServiceInitialized = new BehaviorSubject<boolean>(false);
  public selectedPharmacy = new BehaviorSubject<Pharmacy | null>(null);

  private bingMapsSDKLoaded: undefined | Promise<any>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private languageToggleService: LanguageToggleService
  ) {
    this.loadBingMapsSDK().then(() => {
      Microsoft.Maps.loadModule('Microsoft.Maps.Directions', () =>
        this.mapServiceInitialized.next(true)
      );
    });
  }

  /**
   * Returns a Promise that resolves after the Bing Maps SDK has been loaded.
   * Can't load any of the Maps modules before that has been loaded.
   **/
  public loadBingMapsSDK(): Promise<any> {
    const bingUrl = `https://www.bing.com/api/maps/mapcontrol?callback=__onBingLoaded&key=${environment.bingMapsApiKey}`;

    if (!this.bingMapsSDKLoaded) {
      this.bingMapsSDKLoaded = new Promise((resolve) => {
        (<any>window)['__onBingLoaded'] = (): void => {
          resolve('Bing Maps API loaded');
        };
      });

      const node = document.createElement('script');
      node.src = bingUrl;
      node.type = 'text/javascript';
      node.async = true;
      node.defer = true;
      document.getElementsByTagName('head')[0].appendChild(node);
    }

    return this.bingMapsSDKLoaded;
  }

  private initializeMap(mapDivId: string = 'pharmacyLocatorMapDiv'): void {
    // The error callback loses the reference to "this", so using this approach instead of a BehaviorSubject on this service.
    document.getElementById('address-input')?.removeAttribute('error');
    // Ensure the calculated directions don't carry over when opening the modal for a different pharmacy.
    if (this.directionsManager) {
      this.directionsManager.clearAll();
    }

    const mapCenter = new Microsoft.Maps.Location(
      this.selectedPharmacy.value?.latitude ?? 47.5,
      this.selectedPharmacy.value?.longitude ?? -122.3
    );
    const mapDiv = document.getElementById(mapDivId);

    this.bingMap = new Microsoft.Maps.Map(mapDiv ?? '#map-direction-modal', {
      center: mapCenter,
      mapTypeId: Microsoft.Maps.MapTypeId.road,
      zoom: 13
    });
    this.directionsManager = new Microsoft.Maps.Directions.DirectionsManager(this.bingMap);

    if (this.selectedPharmacy.value) {
      this.bingMap.entities.push(new Microsoft.Maps.Pushpin(mapCenter));
    }
  }

  public loadMap(mapDivId: string): void {
    this.initializeMap(mapDivId);
  }

  public loadDirections(
    directionsDivId: string = 'pharmacyLocatorDirectionsDiv',
    selectedPharmacy: Pharmacy,
    searchedCriteria: string,
    directionMode: string = 'driving'
  ): void {
    this.initializeMap();

    this.directionsManager.clearDisplay();
    this.directionMode = directionMode;

    this.getWaypoints(selectedPharmacy, searchedCriteria).then((points) => {
      this.calculateDirections(directionsDivId, ...points);
    });
  }

  private calculateDirections(
    directionsDivId: string,
    startWaypoint: Microsoft.Maps.Directions.Waypoint,
    endWaypoint: Microsoft.Maps.Directions.Waypoint
  ): void {
    this.directionsManager.clearAll();
    this.directionsManager.addWaypoint(startWaypoint);
    this.directionsManager.addWaypoint(endWaypoint);

    this.directionsManager.setRequestOptions({
      routeOptimization: Microsoft.Maps.Directions.RouteOptimization.shortestDistance,
      maxRoutes: 0,
      routeMode:
        this.directionMode.toLowerCase() === 'walking'
          ? Microsoft.Maps.Directions.RouteMode.walking
          : Microsoft.Maps.Directions.RouteMode.driving
    });

    const directionsDiv = document.getElementById(directionsDivId);
    if (directionsDiv) {
      directionsDiv.innerHTML = '';
      this.directionsManager.setRenderOptions({
        itineraryContainer: directionsDiv
      });
    }

    // Specify a handler for when an error occurs
    Microsoft.Maps.Events.addHandler(this.directionsManager, 'directionsError', this.errorHandler);

    // Calculate directions, which displays a route on the map
    this.directionsManager.calculateDirections();
  }

  private errorHandler(error: any): void {
    // This callback loses the reference to "this", so using this approach instead of a BehaviorSubject on this service.
    document
      .getElementById('address-input')
      ?.setAttribute(
        'error',
        this.languageToggleService.pharmacyLocalString[this.languageToggleService.currentLanguage]
          .mapError
      );

    /*
     * An example error that can be returned when attempting to search for walking directions that are too far:
     * { "responseCode": "TooFar", "message": "The route distance is too long to calculate a route." }
     */

    return error;
  }

  /**
   * Creates the start and end waypoints to be used for calculating directions.
   **/
  public async getWaypoints(
    selectedPharmacy: Pharmacy,
    searchedCriteria: string
  ): Promise<[Microsoft.Maps.Directions.Waypoint, Microsoft.Maps.Directions.Waypoint]> {
    const options = {
      enableHighAccuracy: true,
      timeout: 7000,
      maximumAge: 0
    };

    const address = `${selectedPharmacy.address},${selectedPharmacy.city},${selectedPharmacy.state} ${selectedPharmacy.zipCode}`;
    const endWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: address });

    let startWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: searchedCriteria });
    if (getDeviceType() !== DeviceType.DESKTOP) {
      await this.getPosition(options)
        .then((position) => {
          startWaypoint = new Microsoft.Maps.Directions.Waypoint({
            location: new Microsoft.Maps.Location(
              position.coords.latitude,
              position.coords.longitude
            )
          });
        })
        .catch((error) => {
          startWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: searchedCriteria });
        });
    } else {
      startWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: searchedCriteria });
    }

    return [startWaypoint, endWaypoint];
  }

  private getPosition(options?: PositionOptions): Promise<any> {
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    );
  }

  public getReverseGeocode(positionCordinates: string): Observable<any> {
    const geocodeRequest = `${
      this.languageToggleService.pharmacyLocalString[this.languageToggleService.currentLanguage]
        .BINGGeoURL
    }${positionCordinates}?key=${environment.bingMapsApiKey}`;
    return this.http.get(geocodeRequest);
  }
}


pl-pharmacy-map.component.html

<!-- <ps-button (click)="onButtonClick()">Click me</ps-button> -->

<div id="myMap" class="my-map"></div>
<p>pl-pharmacy-map</p>

pl-pharmacy-map.component.ts

import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Inject
} from '@angular/core';
import {
  PlPharmacyMapFacade,
  PlPharmacyMapModule
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-map';

// eslint-disable-next-line @nx/enforce-module-boundaries -- Testing only
import { PlPharmacyMapService } from '../../../../store/pl-pharmacy-map/src/lib/services/pl-pharmacy-map.service';

import { PlPharmacyMapStore } from './pl-pharmacy-map.store';

@Component({
  selector: 'lib-pl-pharmacy-map',
  imports: [CommonModule, PlPharmacyMapModule],
  templateUrl: 'pl-pharmacy-map.component.html',
  styleUrls: ['pl-pharmacy-map.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PlPharmacyMapStore, PlPharmacyMapFacade],
  host: { ngSkipHydration: 'true' }
})
export class PlPharmacyMapComponent implements OnInit {
  constructor(
    @Inject(PlPharmacyMapFacade)
    private readonly plPharmacyMapFacade: PlPharmacyMapFacade,
    private mapFacade: PlPharmacyMapFacade //,
    //private mapService: PlPharmacyMapService
  ) {}

  ngOnInit(): void {
    this.plPharmacyMapFacade.getPlPharmacyMap();

    //this.mapService.loadBingMapScript();

    // this.mapService.getHardcodedLocation().subscribe({
    //   next: (data) => console.log('Bing Maps Response:', data),
    //   error: (error) => console.error('Bing Maps API Error:', error)
    // });
  }

  onButtonClick(): void {
    this.plPharmacyMapFacade.buttonClicked();
  }
}

map.actions.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const PlPharmacyMapActions = createActionGroup({
  source: 'PlPharmacyMap',
  events: {
    'Get PlPharmacyMap': emptyProps(),
    'Get PlPharmacyMap Success': emptyProps(),
    'Get PlPharmacyMap Failure': props<{ error: ReportableError }>(),
    'Edit PlPharmacyMap': props<{ plPharmacyMap: string }>(),
    'Button Clicked': emptyProps()
  }
});


map.effects.ts

import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';

//import { PlPharmacyMapService } from '../services/pl-pharmacy-map.service';

import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';

@Injectable()
export class PlPharmacyMapEffects {
  private readonly actions$ = inject(Actions);

  private readonly errorTag = 'PlPharmacyMapEffects';

  public getPlPharmacyMap$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PlPharmacyMapActions.getPlPharmacyMap),
      map(() => {
        return PlPharmacyMapActions.getPlPharmacyMapSuccess();
        // eslint-disable-next-line @nx/workspace/no-console-log -- Testing only
        console.log('working in Effects1');
      }),
      catchError((error: unknown) => {
        return of(
          PlPharmacyMapActions.getPlPharmacyMapFailure({
            error: errorMessage(this.errorTag, error)
          })
        );
      })
    );
  });

  public buttonClicked$ = createEffect(
    () =>
      this.actions$.pipe(
        // eslint-disable-next-line @nx/workspace/no-console-log  -- Testing only
        tap((action) => console.log('Effect received action', action)),
        ofType(PlPharmacyMapActions.buttonClicked),
        tap(() =>
          // eslint-disable-next-line @nx/workspace/no-console-log -- Testing only
          console.log('working in Effects2')
        )
      ),
    { dispatch: false }
  );
}

// @Injectable()
// export class PlPharmacyMapEffects {
//   constructor(
//     private action$: Actions,
//     private plPharmacyMapService: PlPharmacyMapService
//   ) {}

//   private readonly apiKey = 'Ar42eevYl2S4wXRGoXZYp';

//   // private readonly actions$ = inject(Actions);
//   // private readonly plPharmacyMapService = inject(PlPharmacyMapService);

//   private readonly errorTag = 'PlPharmacyMapEffects';

//   public getPlPharmacyMap$ = createEffect(() => {
//     return this.action$.pipe(
//       ofType(PlPharmacyMapActions.getPlPharmacyMap),
//       tap(() => {
//         // eslint-disable-next-line @nx/workspace/no-console-log -- for testing only
//         console.log('Working in Effects 1');
//       }),
//       map(() => {
//         // eslint-disable-next-line @nx/workspace/no-console-log -- for testing only
//         console.log('Working in Effects 2');
//       }),
//       mergeMap(() =>
//         this.plPharmacyMapService.loadBingMapScript(this.apiKey).pipe(
//           map(() => PlPharmacyMapActions.getPlPharmacyMapSuccess()),
//           catchError((error: unknown) => {
//             return of(
//               PlPharmacyMapActions.getPlPharmacyMapFailure({
//                 error: errorMessage(this.errorTag, error)
//               })
//             );
//           })
//         )
//       )
//     );
//   });
// }

map.facade.ts

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';
import { PlPharmacyMapFeature } from './pl-pharmacy-map.reducer';

@Injectable({ providedIn: 'root' })
export class PlPharmacyMapFacade {
  protected readonly store = inject(Store);

  public readonly plPharmacyMap$ = this.store.select(
    PlPharmacyMapFeature.selectPlPharmacyMap
  );

  public readonly loading$ = this.store.select(
    PlPharmacyMapFeature.selectLoading
  );

  public readonly error$ = this.store.select(PlPharmacyMapFeature.selectError);

  public getPlPharmacyMap(): void {
    this.store.dispatch(PlPharmacyMapActions.getPlPharmacyMap());
    // eslint-disable-next-line @nx/workspace/no-console-log -- for testing only
    console.log('working on Facade');
  }

  public editPlPharmacyMap(plPharmacyMap: string): void {
    this.store.dispatch(
      PlPharmacyMapActions.editPlPharmacyMap({ plPharmacyMap })
    );
  }

  public buttonClicked(): void {
    this.store.dispatch(PlPharmacyMapActions.buttonClicked());

    // eslint-disable-next-line @nx/workspace/no-console-log -- Testing
    console.log('Button was clicked');
  }
}


reducer.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { PlPharmacyMapActions } from './pl-pharmacy-map.actions';

export const PL_PHARMACY_MAP_FEATURE_KEY = 'pl-pharmacy-map';

export interface PlPharmacyMapState {
  plPharmacyMap: string;
  loading: boolean;
  error: ReportableError | undefined;
}

export const initialPlPharmacyMapState: PlPharmacyMapState = {
  plPharmacyMap: '',
  loading: false,
  error: undefined
};

const reducer: ActionReducer<PlPharmacyMapState> = createReducer(
  initialPlPharmacyMapState,
  on(PlPharmacyMapActions.getPlPharmacyMap, (state) => ({
    ...state,
    loading: true
  })),
  on(PlPharmacyMapActions.getPlPharmacyMapSuccess, (state) => ({
    ...state,
    loading: false
  })),
  on(PlPharmacyMapActions.getPlPharmacyMapFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(PlPharmacyMapActions.editPlPharmacyMap, (state, { plPharmacyMap }) => ({
    ...state,
    plPharmacyMap
  })),
  on(PlPharmacyMapActions.buttonClicked, (state) => ({
    ...state
  }))
);

export const PlPharmacyMapFeature = createFeature({
  name: PL_PHARMACY_MAP_FEATURE_KEY,
  reducer
});


map.service.ts

import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlPharmacyMapService {
  private readonly bingMapApiKey: string = 'Ar42eevYl2S4wXRGoXZYp';

  public loadBingMapScript(apiKey: string): Observable<void> {
    return from(
      new Promise<void>((resolve, reject) => {
        if (document.querySelector('#bing-map-script')) {
          resolve();

          return;
        }

        const script = document.createElement('script');

        script.id = 'bing-map-script';
        script.src = `https://www.bing.com/api/maps/mapcontrol?key=${this.bingMapApiKey}`;
        script.async = true;
        script.defer = true;

        script.addEventListener('load', () => resolve());
        script.addEventListener('error', (error) => reject(error));

        document.body.append(script);
      })
    );
  }
}


