actions

import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { PharmacyDetail } from '../pl-pharmacy-detail.types';

export const PlPharmacyDetailActions = createActionGroup({
  source: 'PlPharmacyDetail',
  events: {
    'Set Selected Pharmacy': props<{ selectedPharmacy: PharmacyDetail }>(),
    'Clear Selected Pharmacy': emptyProps()
  }
});

Facade

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PharmacyDetail } from '../pl-pharmacy-detail.types';

import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';
import { PlPharmacyDetailFeature } from './pl-pharmacy-detail.reducer';

@Injectable({ providedIn: 'root' })
export class PlPharmacyDetailFacade {
  protected readonly store = inject(Store);

  public readonly selectedPharmacy$: Observable<PharmacyDetail | null> =
    this.store.select(PlPharmacyDetailFeature.selectSelectedPharmacy);

  public readonly loading$ = this.store.select(
    PlPharmacyDetailFeature.selectLoading
  );

  public readonly error$ = this.store.select(
    PlPharmacyDetailFeature.selectError
  );

  public setSelectedPharmacy(selectedPharmacy: PharmacyDetail): void {
    this.store.dispatch(
      PlPharmacyDetailActions.setSelectedPharmacy({ selectedPharmacy })
    );
  }

  clearSelectedPharmacy(): void {
    this.store.dispatch(PlPharmacyDetailActions.clearSelectedPharmacy());
  }
}

reducer 

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { PharmacyDetail } from '../pl-pharmacy-detail.types';

import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';

export const PL_PHARMACY_DETAIL_FEATURE_KEY = 'pl-pharmacy-detail';

export interface PlPharmacyDetailState {
  selectedPharmacy: PharmacyDetail | null;
  loading: boolean;
  error: ReportableError | undefined;
}

export const initialPlPharmacyDetailState: PlPharmacyDetailState = {
  selectedPharmacy: null,
  loading: false,
  error: undefined
};

const reducer: ActionReducer<PlPharmacyDetailState> = createReducer(
  initialPlPharmacyDetailState,
  on(
    PlPharmacyDetailActions.setSelectedPharmacy,
    (state, { selectedPharmacy }) => ({
      ...state,
      selectedPharmacy,
      loading: true
    })
  ),
  on(PlPharmacyDetailActions.clearSelectedPharmacy, (state) => ({
    ...state,
    selectedPharmacy: null,
    loading: false
  }))
);

export const PlPharmacyDetailFeature = createFeature({
  name: PL_PHARMACY_DETAIL_FEATURE_KEY,
  reducer
});


Effects

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';

@Injectable()
export class PlPharmacyDetailEffects {
  private readonly actions$ = inject(Actions);
  storeSelectedPharmacy$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PlPharmacyDetailActions.setSelectedPharmacy),
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
        ofType(PlPharmacyDetailActions.clearSelectedPharmacy),
        tap(() => {
          sessionStorage.removeItem('selectedPharmacy');
        })
      ),
    { dispatch: false }
  );
}

pl-Pharmacy-detail.store.ts 

import { Injectable, inject } from '@angular/core';
import {
  PlPharmacyDetailFacade,
  PharmacyDetail
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';
import { Observable } from 'rxjs';

@Injectable()
export class PlPharmacyDetailStore {
  private readonly pharmacyDetailFacade = inject(PlPharmacyDetailFacade);

  public readonly selectedPharmacy$: Observable<PharmacyDetail | null> =
    this.pharmacyDetailFacade.selectedPharmacy$;
}


Component.ts

import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  inject
} from '@angular/core';
import {
  PharmacyDetail,
  PlPharmacyDetailFacade
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

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
  public selectedPharmacy = {};
  protected readonly pharmacyDetailFacade = inject(PlPharmacyDetailFacade);
  selectedPharmacy$ = this.pharmacyDetailFacade.selectedPharmacy$;
  constructor(private readonly pharmacyDetailStore: PlPharmacyDetailStore) {}

  ngOnInit(): void {
    this.pharmacyDetailStore.selectedPharmacy$.subscribe(
      (data: PharmacyDetail | null) => {
        if (data?.pharmacyNumber) {
          this.selectedPharmacy = data;
        }
      }
    );
    // this.selectedPharmacy$.subscribe((selectedPharmacy) => {
    //   if (selectedPharmacy) {
    //     this.selectedPharmacy = selectedPharmacy;
    //   }
    // });
  }
}

