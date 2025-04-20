
Pl-pharmacy-search.component.ts


public listenToLocationSuggestions(): void {
    this.plPharmacySearchStore.locationSuggestions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((suggestedLocations: LocationSuggestionItem[]) => {
        if (this.filteredServiceAreaList.length > 0) {
          const suggestedLocationAndServiceAreaList = [
            ..._cloneDeep(suggestedLocations),
            ..._cloneDeep(this.filteredServiceAreaList)
          ];

          this.plPharmacySearchStore.updateLocationSuggestions({
            locationSuggestions: suggestedLocationAndServiceAreaList.slice(0, 8)
          });

          this.filteredServiceAreaList = [];
        }
      });
  }

Pl-pharmacy-search.facade.ts 

import { Injectable, inject } from '@angular/core';
import {
  Address,
  LocationSuggestionItem
} from '@digital-blocks/angular/pharmacy/shared/services';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { LocationSearchActions } from './location-search.actions';
import { LocationSearchFeature } from './location-search.reducer';

@Injectable({ providedIn: 'root' })
export class LocationSearchFacade {
  protected readonly store = inject(Store);

  public readonly loading$ = this.store.select(
    LocationSearchFeature.selectLoading
  );

  public readonly locationSuggestions$: Observable<LocationSuggestionItem[]> =
    this.store.select(LocationSearchFeature.selectLocationSuggestions);

  public readonly selectSelectedLocation$: Observable<Address | undefined> =
    this.store.select(LocationSearchFeature.selectSelectedLocation);


  public readonly hideLocationSearch$ = this.store.select(
    LocationSearchFeature.selectHideLocationSearch
  );

  public getAutoSuggest(searchTerm: string) {
    this.store.dispatch(
      LocationSearchActions.getAutoSuggestLocation({ searchTerm })
    );
    this.setSelectedLocation();
  }
  

  public updateLocationSuggestions(updatedSuggestionList: {
    locationSuggestions: LocationSuggestionItem[];
  }): void {
    this.store.dispatch(
      LocationSearchActions.getAutoSuggestLocationSuccess(updatedSuggestionList)
    );
  }
}


location-search.facde.ts


import { Injectable, inject } from '@angular/core';
import {
  Address,
  LocationSuggestionItem
} from '@digital-blocks/angular/pharmacy/shared/services';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { LocationSearchActions } from './location-search.actions';
import { LocationSearchFeature } from './location-search.reducer';

@Injectable({ providedIn: 'root' })
export class LocationSearchFacade {
  protected readonly store = inject(Store);

  public readonly loading$ = this.store.select(
    LocationSearchFeature.selectLoading
  );

  public readonly locationSuggestions$: Observable<LocationSuggestionItem[]> =
    this.store.select(LocationSearchFeature.selectLocationSuggestions);

  public readonly selectSelectedLocation$: Observable<Address | undefined> =
    this.store.select(LocationSearchFeature.selectSelectedLocation);

  public selectCurrentLocation$: Observable<Address | undefined> =
    this.store.select(LocationSearchFeature.selectCurrentLocation);

  public readonly error$ = this.store.select(LocationSearchFeature.selectError);

  public readonly selectDefaultAddress$ = this.store.select(
    LocationSearchFeature.selectDefaultAddress
  );

  public readonly hideLocationSearch$ = this.store.select(
    LocationSearchFeature.selectHideLocationSearch
  );

  public getAutoSuggest(searchTerm: string) {
    this.store.dispatch(
      LocationSearchActions.getAutoSuggestLocation({ searchTerm })
    );
    this.setSelectedLocation();
  }

  public setSelectedLocation(selectedLocation?: Address) {
    this.store.dispatch(
      LocationSearchActions.setSelectedLocation({ selectedLocation })
    );
  }

  public resetStateOnInputClear() {
    this.store.dispatch(LocationSearchActions.resetStateOnInputClear());
  }

  public getCurrentLocation() {
    this.store.dispatch(LocationSearchActions.getCurrentLocation());
  }

  public setDefaultAddress(defaultAddress: Address): void {
    this.store.dispatch(
      LocationSearchActions.setDefaultAddress({ defaultAddress })
    );
  }

  public setHideLocationSearch(hideSearch: boolean): void {
    this.store.dispatch(
      LocationSearchActions.hideLocationSearch({ hideSearch })
    );
  }

  public updateLocationSuggestions(updatedSuggestionList: {
    locationSuggestions: LocationSuggestionItem[];
  }): void {
    this.store.dispatch(
      LocationSearchActions.getAutoSuggestLocationSuccess(updatedSuggestionList)
    );
  }
}

Location-search.reducer.ts 

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import {
  Address,
  LocationSuggestionItem
} from '@digital-blocks/angular/pharmacy/shared/services';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { LocationSearchActions } from './location-search.actions';

export const LOCATION_SEARCH_FEATURE_KEY = 'location-search';

export interface LocationSearchState {
  loading: boolean;
  error: ReportableError | undefined;
  locationSuggestions: LocationSuggestionItem[];
  selectedLocation: Address | undefined;
  currentLocation: Address | undefined;
  defaultAddress: Address | undefined;
  hideLocationSearch: boolean;
}

export const initialLocationSearchState: LocationSearchState = {
  loading: false,
  error: undefined,
  locationSuggestions: [],
  selectedLocation: undefined,
  currentLocation: undefined,
  defaultAddress: undefined,
  hideLocationSearch: false
};

export const reducer: ActionReducer<LocationSearchState> = createReducer(
  initialLocationSearchState,
  on(LocationSearchActions.getAutoSuggestLocation, (state) => ({
    ...state,
    loading: true,
    locationSuggestions: [],
    error: undefined
  })),
  on(
    LocationSearchActions.getAutoSuggestLocationSuccess,
    (state, { locationSuggestions }) => ({
      ...state,
      loading: false,
      locationSuggestions,
      error: undefined
    })
  ),
  on(
    LocationSearchActions.getAutoSuggestLocationFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      locationSuggestions: [],
      error
    })
  ),
  on(
    LocationSearchActions.setSelectedLocation,
    (state, { selectedLocation }) => ({
      ...state,
      loading: false,
      selectedLocation
    })
  ),
  on(LocationSearchActions.resetStateOnInputClear, (state) => ({
    ...state,
    ...initialLocationSearchState,
    loading: false
  })),
  on(LocationSearchActions.getCurrentLocation, (state) => ({
    ...state,
    loading: true,
    currentLocation: undefined
  })),
  on(
    LocationSearchActions.getCurrentLocationSuccess,
    (state, { currentLocation }) => ({
      ...state,
      loading: true,
      currentLocation
    })
  ),
  on(LocationSearchActions.getCurrentLocationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(LocationSearchActions.setDefaultAddress, (state, { defaultAddress }) => ({
    ...state,
    loading: false,
    defaultAddress,
    selectedLocation: defaultAddress
  })),
  on(LocationSearchActions.hideLocationSearch, (state, { hideSearch }) => ({
    ...state,
    loading: false,
    hideLocationSearch: hideSearch
  }))
);

export const LocationSearchFeature = createFeature({
  name: LOCATION_SEARCH_FEATURE_KEY,
  reducer
});

Location-search.component.ts

import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit,
  HostBinding,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserAnalyticsFacade } from '@digital-blocks/angular/core/store/user-analytics';
import { CustomTypeAheadComponent } from '@digital-blocks/angular/pharmacy/shared/components';
import {
  Value,
  Address,
  LocationSearchStaticContent
} from '@digital-blocks/angular/pharmacy/shared/services';
import {
  LocationSearchModule,
  LocationSearchFacade
} from '@digital-blocks/angular/pharmacy/shared/store/location-search';
import { SanitizeHtmlPipe } from '@digital-blocks/angular/pharmacy/shared/util/pipe';
import { BehaviorSubject, filter } from 'rxjs';

import { LocationSearchStore } from './location-search.store';

export interface LocationTag {
  displayed: string;
  link_name: string;
}
export const locationTag: LocationTag = {
  displayed: 'search_location:recommendations_displayed',
  link_name: 'search_location:recommendation_clicked'
};
@Component({
  selector: 'lib-location-search',

  imports: [
    CommonModule,
    LocationSearchModule,
    CustomTypeAheadComponent,
    SanitizeHtmlPipe
  ],
  templateUrl: 'location-search.component.html',
  styleUrls: ['location-search.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [LocationSearchStore],
  host: { ngSkipHydration: 'true' }
})
export class LocationSearchComponent implements OnInit {
  @Input() public showUseCurrentLocationBtn = true;
  @Input() public enableZipcodeSearch = true;
  @Input() public locationSearchStaticContent!: LocationSearchStaticContent;
  @Input() public customizedClass = '';
  @Input() public clearInput = false;
  @Input() public isUseCurrentLocationBtnFullWidth = false;
  @Input() public userCurrentLocationBtnLeadingImage = '';
  @HostBinding('class')
  public get getLocationSearchHostClass() {
    return `${this.customizedClass}-host-class`;
  }

  public locationSearchErrorText$ = new BehaviorSubject<string>('');
  public locationList!: Value[];
  suggestionSelected = false;
  public locationDisplay = false;

  public locationSearchFacade = inject(LocationSearchFacade);
  public locationSearchStore = inject(LocationSearchStore);

  private readonly userAnalyticsFacade = inject(UserAnalyticsFacade);
  private previousSearchTerm = '';
  protected readonly destroyRef = inject(DestroyRef);
  initialValue = '';

  ngOnInit(): void {
    this.setLocationSearchError();
    this.listenLocationSuggestions();
    // Clear location state each time component loads
    this.locationSearchFacade.setSelectedLocation();

    this.locationSearchStore.locationInputValue$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((searchTerm) => {
        this.initialValue = searchTerm ?? '';
        this.previousSearchTerm = searchTerm ?? '';
      });
  }

  private setLocationSearchError() {
    this.locationSearchFacade.error$
      .pipe(filter((error) => error !== undefined))
      .subscribe(() => {
        this.locationSearchErrorText$.next(
          this.locationSearchStaticContent.searchErrorText
        );
      });
  }

  private listenLocationSuggestions() {
    this.locationSearchFacade.locationSuggestions$
      .pipe(filter((suggestionList) => suggestionList.length > 0))
      .subscribe(() => {
        this.locationSearchErrorText$.next('');
      });
  }

  /**
   * @public
   * @return: void
   * @description: method called on when user type the
   * zipcode or location in type-a-head input element
   */
  public handleSearch(searchTerm: string): void {
    this.suggestionSelected = false;
    this.locationSearchErrorText$.next('');
    if (!searchTerm) {
      return;
    }
    if (searchTerm.length >= 3) {
      if (!this.locationDisplay) {
        this.userAnalyticsFacade.linkEvent(locationTag.displayed, {
          search_characters: searchTerm // Pass c24 to track the search string entered by user
        });

        this.locationDisplay = true;
      }

      this.locationSearchFacade.getAutoSuggest(searchTerm);
    }
  }

  /**
   * @public
   * @return: void
   * @description: method called on selecting suggested location from type-a-head list and set selected location in state
   */
  public handleSuggestionSelected(event: Address): void {
    this.suggestionSelected = true;
    this.locationSearchFacade.setSelectedLocation(event);
    this.previousSearchTerm = event.formattedAddress;
    this.userAnalyticsFacade.linkEvent(locationTag.link_name, {
      selected_suggestion: event.formattedAddress // Pass c25 to track which recommended search results user selected
    });
  }

  public onInputClear() {
    this.suggestionSelected = false;
    this.locationSearchFacade.resetStateOnInputClear();
    this.previousSearchTerm = '';
  }

  public checkZipcodeValid(searchTerm: string): boolean {
    return searchTerm
      ? searchTerm.length === 5 && !Number.isNaN(Number(searchTerm))
      : false;
  }

  public freeInputZipcodeSearch(searchTerm: string) {
    this.locationDisplay = false;
    if (this.previousSearchTerm === searchTerm) {
      return;
    } else {
      this.previousSearchTerm = searchTerm;
    }
    if (searchTerm?.length >= 3 && this.enableZipcodeSearch) {
      if (this.checkZipcodeValid(searchTerm)) {
        this.locationSearchFacade.setSelectedLocation({
          postalCode: searchTerm,
          formattedAddress: searchTerm
        });
      } else if (!this.suggestionSelected) {
        this.locationSearchErrorText$.next(
          this.locationSearchStaticContent.searchErrorText
        );
        this.userAnalyticsFacade.linkEvent(
          'search_medication:get_price:error',
          {
            error_messages: '1',
            field_errors: this.locationSearchStaticContent.searchErrorText
          }
        );

        this.locationSearchFacade.resetStateOnInputClear();
      }
    }
  }

  public useMyLocation() {
    this.userAnalyticsFacade.linkEvent('use_my_current_location');
    this.locationSearchFacade.getCurrentLocation();
  }
}
