actions.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { createActionGroup, props } from '@ngrx/store';

import { PageData } from '../static-page-spots-interface';

export const PlPharmacyContentSpotActions = createActionGroup({
  source: 'PlPharmacyContentSpot',
  events: {
    'Get PlPharmacyContentSpot': props<{ cmsSpot: string }>(),
    'Get PlPharmacyContentSpot Success': props<{ plPharmacyContentSpotContent: PageData[] }>(),
    'Get PlPharmacyContentSpot Failure': props<{ error: ReportableError }>(),
    'Edit PlPharmacyContentSpot': props<{ plPharmacyContentSpot: string }>()
  }
});


effects.ts


import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { PlPharmacyContentSpotService } from '../services/pl-pharmacy-content-spot.service';
import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';

@Injectable()
export class PlPharmacyContentSpotEffects {
  private readonly actions$ = inject(Actions);
  private readonly getPlPageSpotsService = inject(PlPharmacyContentSpotService);
  private readonly errorTag = 'PlPharmacyContentSpotEffects';

  public getPlPharmacyContentSpot$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PlPharmacyContentSpotActions.getPlPharmacyContentSpot),
      switchMap(({ cmsSpot }) => {
        return this.getPlPageSpotsService.fetchPlPageContent(cmsSpot).pipe(
          map((response) => {
            return PlPharmacyContentSpotActions.getPlPharmacyContentSpotSuccess({
              plPharmacyContentSpotContent: response.data.cmsContent[0]?.content
            });
          }),
          catchError((error: unknown) => {
            return of(
              PlPharmacyContentSpotActions.getPlPharmacyContentSpotFailure({
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
import { filter, map } from 'rxjs';

import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import { PlPharmacyContentSpotFeature } from './pl-pharmacy-content-spot.reducer';

@Injectable({ providedIn: 'root' })
export class PlPharmacyContentSpotFacade {
  protected readonly store = inject(Store);

  public readonly plPharmacyContentSpot$ = this.store
    .select(PlPharmacyContentSpotFeature.selectPlPharmacyContentSpot)
    .pipe(
      filter(
        (contentSpots) => !!contentSpots && contentSpots.length > 0
      )
    );

  public readonly plPharmacyHeader$ = this.plPharmacyContentSpot$.pipe(
    map((contentSpots) =>
      contentSpots.find((spot) => spot.elementType === 'headerHtml')
    )
  );

  public readonly plPharmacyBody$ = this.plPharmacyContentSpot$.pipe(
    map((contentSpots) =>
      contentSpots.find((spot) => spot.elementType === 'bodyHtml')
    )
  );

  public readonly loading$ = this.store.select(
    PlPharmacyContentSpotFeature.selectLoading
  );

  public readonly error$ = this.store.select(
    PlPharmacyContentSpotFeature.selectError
  );

  public getPlPharmacyContentSpot(cmsSpot: string): void {
    this.store.dispatch(
      PlPharmacyContentSpotActions.getPlPharmacyContentSpot({ cmsSpot })
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
  plPharmacyContentSpotContent: PageData[];
  cmsSpot: string;
  loading: boolean;
  error: ReportableError | undefined;
}

export const initialPlPharmacyContentSpotState: PlPharmacyContentSpotState = {
  plPharmacyContentSpotContent: [],
  cmsSpot: '',
  loading: false,
  error: undefined
};

export const reducer: ActionReducer<PlPharmacyContentSpotState> = createReducer(
  initialPlPharmacyContentSpotState,
  on(PlPharmacyContentSpotActions.getPlPharmacyContentSpot, (state, { cmsSpot }) => ({
    ...state,
    cmsSpot,
    loading: true
  })),
  on(
    PlPharmacyContentSpotActions.getPlPharmacyContentSpotSuccess,
    (state, { plPharmacyContentSpotContent }) => ({
      ...state,
      plPharmacyContentSpotContent,
      loading: false
    })
  ),
  on(
    PlPharmacyContentSpotActions.getPlPharmacyContentSpotFailure,
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


service.ts

import { inject, Injectable } from '@angular/core';
import { AuthFacade } from '@digital-blocks/angular/core/store/auth';
import { PageDefinitionFacade } from '@digital-blocks/angular/core/store/page-definition';
import { ExperienceService } from '@digital-blocks/angular/core/util/experience-service';
import { mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { filter, map, Observable, of, switchMap } from 'rxjs';

import { CMSAPIResponse } from '../../../../static-page-spots/src/lib/static-page-spots-interface';
import { CmsContentConfig } from './pl-pharmacy-content-spot.config';

@Injectable({
  providedIn: 'root'
})
export class PlPharmacyContentSpotService {
  private readonly experienceService = inject(ExperienceService);
  private readonly pageDefinition = inject(PageDefinitionFacade);
  private readonly authFacade = inject(AuthFacade);

  /**
   * @description Fetches the PlPharmacyContentSpot data from the CMS.
   * 
   * @param cmsSpot The CMS spot identifier.
   * @returns Observable containing CMSAPIResponse.
   */
  public fetchPlPageContent(cmsSpot: string): Observable<CMSAPIResponse> {
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
            `${CmsContentConfig.mock}${cmsSpot}${isAuth ? '_auth.json' : '_unauth.json'}`,
            {
              data: {
                cmsContentInput: {
                  spots: [
                    {
                      spotName: cmsSpot
                    }
                  ]
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
          .pipe(mapResponseBody());
      })
    );
  }
}
