actions.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const PlPharmacyDetailActions = createActionGroup({
  source: 'PlPharmacyDetail',
  events: {
    'Get PlPharmacyDetail': emptyProps(),
    'Get PlPharmacyDetail Success': emptyProps(),
    'Get PlPharmacyDetail Failure': props<{ error: ReportableError }>(),
    'Edit PlPharmacyDetail': props<{ plPharmacyDetail: string }>()
  }
});


Effects.ts

import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of } from 'rxjs';

import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';

@Injectable()
export class PlPharmacyDetailEffects {
  private readonly actions$ = inject(Actions);

  private readonly errorTag = 'PlPharmacyDetailEffects';

  public getPlPharmacyDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PlPharmacyDetailActions.getPlPharmacyDetail),
      map(() => {
        return PlPharmacyDetailActions.getPlPharmacyDetailSuccess();
      }),
      catchError((error: unknown) => {
        return of(
          PlPharmacyDetailActions.getPlPharmacyDetailFailure({
            error: errorMessage(this.errorTag, error)
          })
        );
      })
    );
  });
}

facade.ts

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

  public editPlPharmacyDetail(plPharmacyDetail: string): void {
    this.store.dispatch(
      PlPharmacyDetailActions.editPlPharmacyDetail({ plPharmacyDetail })
    );
  }
}

reducer.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';

export const PL_PHARMACY_DETAIL_FEATURE_KEY = 'pl-pharmacy-detail';

export interface PlPharmacyDetailState {
  plPharmacyDetail: string;
  loading: boolean;
  error: ReportableError | undefined;
}

export const initialPlPharmacyDetailState: PlPharmacyDetailState = {
  plPharmacyDetail: '',
  loading: false,
  error: undefined
};

const reducer: ActionReducer<PlPharmacyDetailState> = createReducer(
  initialPlPharmacyDetailState,
  on(PlPharmacyDetailActions.getPlPharmacyDetail, (state) => ({
    ...state,
    loading: true
  })),
  on(PlPharmacyDetailActions.getPlPharmacyDetailSuccess, (state) => ({
    ...state,
    loading: false
  })),
  on(
    PlPharmacyDetailActions.getPlPharmacyDetailFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),
  on(
    PlPharmacyDetailActions.editPlPharmacyDetail,
    (state, { plPharmacyDetail }) => ({
      ...state,
      plPharmacyDetail
    })
  )
);

export const PlPharmacyDetailFeature = createFeature({
  name: PL_PHARMACY_DETAIL_FEATURE_KEY,
  reducer
});


component.ts

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { PlPharmacyDetailStore } from './pl-pharmacy-detail.store';

@Component({
  selector: 'lib-pl-pharmacy-detail',
  imports: [CommonModule],
  templateUrl: 'pl-pharmacy-detail.component.html',
  styleUrls: ['pl-pharmacy-detail.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PlPharmacyDetailStore],
  host: { ngSkipHydration: 'true' }
})
export class PlPharmacyDetailComponent {}

store.ts

import { Injectable } from '@angular/core';

@Injectable()
export class PlPharmacyDetailStore {}


mock response 

[
                { "field1": "testValue", "field2": "test2"}]
