actions.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { createActionGroup, props } from '@ngrx/store';

import { PageData } from '../static-page-spots-interface';

export interface SpotRequest {
  spotName: string;
}

export const PlPharmacyContentSpotActions = createActionGroup({
  source: 'PlPharmacyContentSpot',
  events: {
    'Get PlPharmacyContentSpots': props<{ cmsSpots: SpotRequest[] }>(), // Accepts array of objects
    'Get PlPharmacyContentSpots Success': props<{ plPharmacyContentSpotContents: PageData[] }>(),
    'Get PlPharmacyContentSpots Failure': props<{ error: ReportableError }>()
  }
});


service.ts

import { inject, Injectable } from '@angular/core';
import { AuthFacade } from '@digital-blocks/angular/core/store/auth';
import { PageDefinitionFacade } from '@digital-blocks/angular/core/store/page-definition';
import { ExperienceService } from '@digital-blocks/angular/core/util/experience-service';
import { mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { filter, map, Observable, of, switchMap } from 'rxjs';

import { CMSAPIResponse, PageData } from '../../../../static-page-spots/src/lib/static-page-spots-interface';
import { CmsContentConfig } from './pl-pharmacy-content-spot.config';
import { SpotRequest } from './pl-pharmacy-content-spot.actions';

@Injectable({
  providedIn: 'root'
})
export class PlPharmacyContentSpotService {
  private readonly experienceService = inject(ExperienceService);
  private readonly pageDefinition = inject(PageDefinitionFacade);
  private readonly authFacade = inject(AuthFacade);

  /**
   * @description Fetches multiple PlPharmacyContentSpots data from the CMS.
   * 
   * @param cmsSpots The array of SpotRequest objects.
   * @returns Observable containing an array of PageData objects.
   */
  public fetchMultiplePlPageContents(cmsSpots: SpotRequest[]): Observable<PageData[]> {
    return this.pageDefinition.page$.pipe(
      filter((page) => page !== undefined),
      switchMap((page) => {
        return page.metadata?.authenticated
          ? of(true)
          : this.authFacade.guestTokenValid$.pipe(
              filter((guestTokenValid) => guestTokenValid),
              map(() => false)
            );
      }),
      switchMap((isAuth) => {
        return this.experienceService
          .post<CMSAPIResponse>(
            CmsContentConfig.clientId,
            CmsContentConfig.experiences,
            `${CmsContentConfig.mock}${isAuth ? '_auth.json' : '_unauth.json'}`,
            {
              data: {
                cmsContentInput: {
                  spots: cmsSpots // Send array of objects
                }
              }
            },
            {
              maxRequestTime: 10_000, // Matches gateway timeout
              additionalHeaders: {
                'x-appName': CmsContentConfig.appName
              }
            }
          )
          .pipe(
            mapResponseBody(),
            map((response) => response.data.cmsContent) // Return array of spot objects
          );
      })
    );
  }
}


effects.ts


import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { PlPharmacyContentSpotService } from '../services/pl-pharmacy-content-spot.service';
import { PlPharmacyContentSpotActions, SpotRequest } from './pl-pharmacy-content-spot.actions';

@Injectable()
export class PlPharmacyContentSpotEffects {
  private readonly actions$ = inject(Actions);
  private readonly getPlPageSpotsService = inject(PlPharmacyContentSpotService);
  private readonly errorTag = 'PlPharmacyContentSpotEffects';

  public getPlPharmacyContentSpots$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PlPharmacyContentSpotActions.getPlPharmacyContentSpots),
      switchMap(({ cmsSpots }: { cmsSpots: SpotRequest[] }) => { // Ensure correct type
        return this.getPlPageSpotsService.fetchMultiplePlPageContents(cmsSpots).pipe(
          map((spotData) => {
            return PlPharmacyContentSpotActions.getPlPharmacyContentSpotsSuccess({
              plPharmacyContentSpotContents: spotData
            });
          }),
          catchError((error: unknown) => {
            return of(
              PlPharmacyContentSpotActions.getPlPharmacyContentSpotsFailure({
                error: errorMessage(this.errorTag, error)
              })
            );
          })
        );
      })
    );
  });
}


facade.ts

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { PlPharmacyContentSpotActions, SpotRequest } from './pl-pharmacy-content-spot.actions';
import { PlPharmacyContentSpotFeature } from './pl-pharmacy-content-spot.reducer';

@Injectable({ providedIn: 'root' })
export class PlPharmacyContentSpotFacade {
  protected readonly store = inject(Store);

  public readonly plPharmacyContentSpots$ = this.store.select(
    PlPharmacyContentSpotFeature.selectPlPharmacyContentSpotContents
  );

  public getPlPharmacyContentSpots(cmsSpots: SpotRequest[]): void {
    this.store.dispatch(
      PlPharmacyContentSpotActions.getPlPharmacyContentSpots({ cmsSpots })
    );
  }
}


reducer.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { PageData } from '../static-page-spots-interface';
import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';

export const PL_PHARMACY_CONTENT_SPOT_FEATURE_KEY = 'pl-pharmacy-content-spot';

export interface PlPharmacyContentSpotState {
  plPharmacyContentSpotContents: PageData[]; // Store as an array of objects
  loading: boolean;
  error: ReportableError | undefined;
}

export const initialPlPharmacyContentSpotState: PlPharmacyContentSpotState = {
  plPharmacyContentSpotContents: [],
  loading: false,
  error: undefined
};

export const reducer: ActionReducer<PlPharmacyContentSpotState> = createReducer(
  initialPlPharmacyContentSpotState,
  on(PlPharmacyContentSpotActions.getPlPharmacyContentSpots, (state) => ({
    ...state,
    loading: true
  })),
  on(
    PlPharmacyContentSpotActions.getPlPharmacyContentSpotsSuccess,
    (state, { plPharmacyContentSpotContents }) => ({
      ...state,
      plPharmacyContentSpotContents, // Store as an array
      loading: false
    })
  ),
  on(
    PlPharmacyContentSpotActions.getPlPharmacyContentSpotsFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  )
);

export const PlPharmacyContentSpotFeature = createFeature({
  name: PL_PHARMACY_CONTENT_SPOT_FEATURE_KEY,
  reducer
});
