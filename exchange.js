interface

export interface Address {
  line: string[];
  city: string | null;
  state: string | null;
  postalCode: string | null;
  phoneNumber: string;
}

export interface DayHour {
  day: string;
  hours: string;
}

export interface PharmacyHours {
  dayHours: DayHour[];
}

export interface PharmacyDetail {
  pharmacyNumber: string;
  pharmacyName: string;
  nationalProviderId: string;
  addresses: Address;
  distance: number;
  maintenanceChoice: boolean;
  nintyDayRetail: boolean;
  vaccineNetwork: boolean;
  prefPharmInd: boolean;
  pharmacyHours: PharmacyHours;
  open24hours: boolean;
  spokenLanguages: string;
  websiteURL: string;
  stateLicense: string;
  physicalDisabilityInd: string;
  county: string | null;
  cctInd: boolean;
  dispenseType: string;
  latitude: number;
  longitude: number;
  islandDesignation: string | null;
  specialtyInd: string;
  network: string;
  pharmacyLob: string;
  storeId: string;
}

mock.ts

import { PharmacyDetail } from './pl-pharmacy-detail.interface';

export const MOCK_PHARMACY_DETAIL: PharmacyDetail[] = [
  {
    pharmacyNumber: '001',
    pharmacyName: 'Mock Pharmacy',
    nationalProviderId: 'NPI123456',
    addresses: {
      line: ['123 Main St'],
      city: 'MockCity',
      state: 'MC',
      postalCode: '12345',
      phoneNumber: '123-456-7890'
    },
    distance: 0.75,
    maintenanceChoice: false,
    nintyDayRetail: false,
    vaccineNetwork: true,
    prefPharmInd: false,
    pharmacyHours: {
      dayHours: [
        { day: 'sunday', hours: '0917' },
        { day: 'monday', hours: '0820' },
        { day: 'tuesday', hours: '0820' },
        { day: 'wednesday', hours: '0820' },
        { day: 'thursday', hours: '0820' },
        { day: 'friday', hours: '0820' },
        { day: 'saturday', hours: '0918' }
      ]
    },
    open24hours: false,
    spokenLanguages: 'English, Spanish',
    websiteURL: 'https://mockpharmacy.com',
    stateLicense: 'MC123456',
    physicalDisabilityInd: 'Y',
    county: 'MockCounty',
    cctInd: true,
    dispenseType: 'Retail',
    latitude: 40.7128,
    longitude: -74.0060,
    islandDesignation: null,
    specialtyInd: 'N',
    network: 'MockNetwork',
    pharmacyLob: 'Retail',
    storeId: '001'
  }
];

Effect.ts

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of } from 'rxjs';
import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';
import { MOCK_PHARMACY_DETAIL } from './mock';

@Injectable()
export class PlPharmacyDetailEffects {
  private readonly actions$ = inject(Actions);

  public getPlPharmacyDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PlPharmacyDetailActions.getPlPharmacyDetail),
      map(() => {
        return PlPharmacyDetailActions.getPlPharmacyDetailSuccess({
          data: MOCK_PHARMACY_DETAIL
        });
      }),
      catchError((error: unknown) => {
        return of(
          PlPharmacyDetailActions.getPlPharmacyDetailFailure({
            error: 'Failed to load pharmacy details'
          })
        );
      })
    );
  });
}

Reducer.ts

import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';
import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';
import { PharmacyDetail } from './pl-pharmacy-detail.interface';

export const PL_PHARMACY_DETAIL_FEATURE_KEY = 'pl-pharmacy-detail';

export interface PlPharmacyDetailState {
  plPharmacyDetail: PharmacyDetail[];
  loading: boolean;
  error: string | undefined;
}

export const initialPlPharmacyDetailState: PlPharmacyDetailState = {
  plPharmacyDetail: [],
  loading: false,
  error: undefined
};

const reducer: ActionReducer<PlPharmacyDetailState> = createReducer(
  initialPlPharmacyDetailState,
  on(PlPharmacyDetailActions.getPlPharmacyDetail, (state) => ({
    ...state,
    loading: true
  })),
  on(PlPharmacyDetailActions.getPlPharmacyDetailSuccess, (state, { data }) => ({
    ...state,
    plPharmacyDetail: data,
    loading: false
  })),
  on(PlPharmacyDetailActions.getPlPharmacyDetailFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

export const PlPharmacyDetailFeature = createFeature({
  name: PL_PHARMACY_DETAIL_FEATURE_KEY,
  reducer
});

facade

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';
import { PlPharmacyDetailFeature } from './pl-pharmacy-detail.reducer';

@Injectable({ providedIn: 'root' })
export class PlPharmacyDetailFacade {
  protected readonly store = inject(Store);

  public readonly plPharmacyDetail$ = this.store.select(
    PlPharmacyDetailFeature.selectPlPharmacyDetail
  );

  public readonly loading$ = this.store.select(
    PlPharmacyDetailFeature.selectLoading
  );

  public readonly error$ = this.store.select(
    PlPharmacyDetailFeature.selectError
  );

  public getPlPharmacyDetail(): void {
    this.store.dispatch(PlPharmacyDetailActions.getPlPharmacyDetail());
  }
}
store.ts

import { Injectable, inject } from '@angular/core';
import { PlPharmacyDetailFacade } from './pl-pharmacy-detail.facade';

@Injectable()
export class PlPharmacyDetailStore {
  private readonly facade = inject(PlPharmacyDetailFacade);

  public getPharmacyDetailFromStore(): void {
    this.facade.getPlPharmacyDetail();
  }
}

component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PlPharmacyDetailStore } from './pl-pharmacy-detail.store';

@Component({
  selector: 'lib-pl-pharmacy-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'pl-pharmacy-detail.component.html',
  styleUrls: ['pl-pharmacy-detail.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PlPharmacyDetailStore],
  host: { ngSkipHydration: 'true' }
})
export class PlPharmacyDetailComponent implements OnInit {
  constructor(private readonly store: PlPharmacyDetailStore) {}

  ngOnInit(): void {
    this.store.getPharmacyDetailFromStore();
  }
}
