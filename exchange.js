facade

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import {
  PlPharmacyContentSpotActions,
  SpotRequest
} from './pl-pharmacy-content-spot.actions';
import {
  PlPharmacyContentSpotFeature,
  PlPharmacyContentSpotState
} from './pl-pharmacy-content-spot.reducer';

@Injectable({ providedIn: 'root' })
export class PlPharmacyContentSpotFacade {
  protected readonly store = inject(Store<PlPharmacyContentSpotState>);

  public readonly plPharmacyContentSpots$ = this.store.select(
    PlPharmacyContentSpotFeature.selectPlPharmacyContentSpots
  );

  public getPlPharmacyContentSpots(spots: SpotRequest[]): void {
    this.store.dispatch(
      PlPharmacyContentSpotActions.getPlPharmacyContentSpots({
        cmsSpots: spots
      })
    );
  }
}


effects

import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { PlPharmacyContentSpotService } from '../services/pl-pharmacy-content-spot.service';

import {
  PlPharmacyContentSpotActions,
  SpotRequest
} from './pl-pharmacy-content-spot.actions';

@Injectable()
export class PlPharmacyContentSpotEffects {
  private readonly actions$ = inject(Actions);
  private readonly getPlPageSpotsService = inject(PlPharmacyContentSpotService);
  private readonly errorTag = 'PlPharmacyContentSpotEffects';

  public getPlPharmacyContentSpots$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PlPharmacyContentSpotActions.getPlPharmacyContentSpots),
      switchMap(({ cmsSpots }: { cmsSpots: SpotRequest[] }) => {
        return this.getPlPageSpotsService
          .fetchMultiplePlPageContents(cmsSpots)
          .pipe(
            map((spotData) => {
              return PlPharmacyContentSpotActions.getPlPharmacyContentSpotsSuccess(
                {
                  plPharmacyContentSpots: spotData
                }
              );
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


sample request thats how it is being passed from component to pl pharmacy content facade 

 cmsSpots: [
          {
            spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot'
          },
          {
            spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot'
          }
        ]
