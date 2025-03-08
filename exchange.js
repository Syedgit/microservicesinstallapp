sample.actions.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { createActionGroup, props } from '@ngrx/store';

import { PageData } from '../static-page-spots-interface';

export const StaticPageSpotsActions = createActionGroup({
  source: 'StaticPageSpots',
  events: {
    'Get StaticPageSpots': props<{
      cmsSpot: string;
    }>(),
    'Get StaticPageSpots Success': props<{
      staticPageSpotContent: PageData[];
    }>(),
    'Get StaticPageSpots Failure': props<{ error: ReportableError }>(),

    'Get DormantSpots': props<{
      dormantSpot: string;
    }>(),
    'Get DormantSpots Success': props<{
      dormantSpotContent: PageData[];
    }>(),
    'Get DormantSpots Failure': props<{
      error: ReportableError;
    }>()
  }
});


sample.effects.ts

import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { StaticPageSpotsService } from '../services';

import { StaticPageSpotsActions } from './static-page-spots.actions';

@Injectable()
export class StaticPageSpotsEffects {
  private readonly actions$ = inject(Actions);

  private readonly staticPageSpotsService = inject(StaticPageSpotsService);

  private readonly errorTag = 'StaticPageSpotsEffects';

  public getStaticPageSpots$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StaticPageSpotsActions.getStaticPageSpots),
      switchMap(({ cmsSpot }) => {
        return this.staticPageSpotsService.getCmsContent(cmsSpot).pipe(
          map((staticPageSpotResponse) => {
            return StaticPageSpotsActions.getStaticPageSpotsSuccess({
              staticPageSpotContent:
                staticPageSpotResponse.data.cmsContent[0]?.content
            });
          })
        );
      }),
      catchError((error: unknown) => {
        return of(
          StaticPageSpotsActions.getStaticPageSpotsFailure({
            error: errorMessage(this.errorTag, error)
          })
        );
      })
    );
  });

  public getSecondaryStaticPageSpots$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StaticPageSpotsActions.getDormantSpots),
      switchMap(({ dormantSpot }) => {
        return this.staticPageSpotsService.getCmsContent(dormantSpot).pipe(
          map((staticPageSpotResponse) => {
            return StaticPageSpotsActions.getDormantSpotsSuccess({
              dormantSpotContent:
                staticPageSpotResponse.data.cmsContent[0]?.content
            });
          })
        );
      }),
      catchError((error: unknown) => {
        return of(
          StaticPageSpotsActions.getDormantSpotsFailure({
            error: errorMessage(this.errorTag, error)
          })
        );
      })
    );
  });
}


sample.facade.ts

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';

import { StaticPageSpotsActions } from './static-page-spots.actions';
import { StaticPageSpotsFeature } from './static-page-spots.reducer';

@Injectable({ providedIn: 'root' })
export class StaticPageSpotsFacade {
  protected readonly store = inject(Store);

  public readonly staticPageSpots$ = this.store
    .select(StaticPageSpotsFeature.selectStaticPageSpotContent)
    .pipe(
      filter(
        (staticPageSpots) => !!staticPageSpots && staticPageSpots.length > 0
      )
    );

  public readonly staticPageHeader$ = this.staticPageSpots$.pipe(
    map((staticPageSpots) =>
      staticPageSpots.find((spot) => spot.elementType === 'headerHtml')
    )
  );

  public readonly staticPageBody$ = this.staticPageSpots$.pipe(
    map((staticPageSpots) =>
      staticPageSpots.find((spot) => spot.elementType === 'bodyHtml')
    )
  );

  public readonly dormantPageSpots$ = this.store
    .select(StaticPageSpotsFeature.selectDormantSpotContent)
    .pipe(
      filter(
        (staticPageSpots) => !!staticPageSpots && staticPageSpots.length > 0
      )
    );

  public readonly dormantPageBody$ = this.dormantPageSpots$.pipe(
    map((dormantPageSpots) => {
      const spot = dormantPageSpots.find(
        (spot) => spot.elementType === 'Promos'
      );
      const elementValue = spot?.elementValue ?? '{}';

      return JSON.parse(elementValue);
    })
  );

  public readonly loading$ = this.store.select(
    StaticPageSpotsFeature.selectLoading
  );

  public readonly error$ = this.store.select(
    StaticPageSpotsFeature.selectError
  );

  public getStaticPageSpots(cmsSpot: string): void {
    this.store.dispatch(StaticPageSpotsActions.getStaticPageSpots({ cmsSpot }));
  }

  public getSecondaryStaticPageSpots(dormantSpot: string): void {
    this.store.dispatch(
      StaticPageSpotsActions.getDormantSpots({ dormantSpot })
    );
  }
}


sample.reducer.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { PageData } from '../static-page-spots-interface';

import { StaticPageSpotsActions } from './static-page-spots.actions';

export const STATIC_PAGE_SPOTS_FEATURE_KEY = 'static-page-spots';

export interface StaticPageSpotsState {
  staticPageSpotContent: PageData[];
  dormantSpotContent: PageData[];
  cmsSpot: string;
  dormantSpot: string;
  loading: boolean;
  error: ReportableError | undefined;
}

export const initialStaticPageSpotsState: StaticPageSpotsState = {
  staticPageSpotContent: [] as PageData[],
  dormantSpotContent: [] as PageData[],
  cmsSpot: '',
  dormantSpot: '',
  loading: false,
  error: undefined
};

export const reducer: ActionReducer<StaticPageSpotsState> = createReducer(
  initialStaticPageSpotsState,
  on(StaticPageSpotsActions.getStaticPageSpots, (state, { cmsSpot }) => ({
    ...state,
    cmsSpot,
    loading: true
  })),
  on(
    StaticPageSpotsActions.getStaticPageSpotsSuccess,
    (state, { staticPageSpotContent }) => ({
      ...state,
      staticPageSpotContent,
      loading: false
    })
  ),
  on(StaticPageSpotsActions.getStaticPageSpotsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(StaticPageSpotsActions.getDormantSpots, (state, { dormantSpot }) => ({
    ...state,
    dormantSpot,
    loading: false
  })),
  on(
    StaticPageSpotsActions.getDormantSpotsSuccess,
    (state, { dormantSpotContent }) => ({
      ...state,
      dormantSpotContent,
      loading: false
    })
  ),
  on(StaticPageSpotsActions.getDormantSpotsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

export const StaticPageSpotsFeature = createFeature({
  name: STATIC_PAGE_SPOTS_FEATURE_KEY,
  reducer
});

sample.service.ts 

import { inject, Injectable } from '@angular/core';
import { AuthFacade } from '@digital-blocks/angular/core/store/auth';
import { PageDefinitionFacade } from '@digital-blocks/angular/core/store/page-definition';
import { ExperienceService } from '@digital-blocks/angular/core/util/experience-service';
import { mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { filter, map, Observable, of, switchMap } from 'rxjs';

import { CMSAPIResponse } from '../../../../static-page-spots/src/lib/static-page-spots-interface';

import { CmsContentConfig } from './static-page-spots.config';

@Injectable({
  providedIn: 'root'
})
export class StaticPageSpotsService {
  private readonly experienceService = inject(ExperienceService);
  private readonly pageDefinition = inject(PageDefinitionFacade);
  private readonly authFacade = inject(AuthFacade);

  /**
   * @description To gather the StaticPageSpots object
   *
   * @function getCmsContent
   * @returns Observable of StaticPageSpotsResponse
   *
   * @cms_content
   */
  public getCmsContent(cmsSpot: string): Observable<CMSAPIResponse> {
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
            CmsContentConfig.mock +
              cmsSpot +
              (isAuth ? '_auth.json' : '_unauth.json'),
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
              maxRequestTime: 10_000 /**Added request time to match the gateway timeout as the order detail exp api takes more than 2 secs*/,
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

sample.component.ts
this is how component will call ngrx store and get the cms spots 
import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit
} from '@angular/core';
import { SkeletonSpanComponent } from '@digital-blocks/angular/core/components';
import { UserAnalyticsFacade } from '@digital-blocks/angular/core/store/user-analytics';
import { SanitizeHtmlPipe } from '@digital-blocks/angular/pharmacy/shared/util/pipe';
import {
  StaticPageSpotsFacade,
  StaticPageSpotsModule
} from '@digital-blocks/angular/pharmacy/static-pages/store/static-page-spots';

import { StaticPageBodyComponent } from './static-page-body.component';

type PageData = {
  content: {
    item: {
      Header: {
        html: string;
      };
      Body: {
        html: string;
      };
    };
  };
};

type TagData = {
  Page_Name: string;
  Page_Category: string;
};

@Component({
  selector: 'lib-static-pages',

  imports: [
    CommonModule,
    SanitizeHtmlPipe,
    StaticPageSpotsModule,
    StaticPageBodyComponent,
    SkeletonSpanComponent
  ],
  templateUrl: 'static-pages.component.html',
  styleUrls: ['static-pages.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { ngSkipHydration: 'true' }
})
export class StaticPagesComponent implements OnInit {
  @Input() data!: PageData;
  @Input() dormantSpot!: string;
  @Input() cmsSpot!: string;
  @Input() tagging!: TagData;

  public readonly userAnalyticsFacade = inject(UserAnalyticsFacade);

  protected readonly staticPage = inject(StaticPageSpotsFacade);

  public ngOnInit(): void {
    if (this.dormantSpot) {
      this.staticPage.getSecondaryStaticPageSpots(this.dormantSpot);
    }
    this.staticPage.getStaticPageSpots(this.cmsSpot);

    if (this.tagging?.Page_Name && this.tagging?.Page_Category) {
      this.userAnalyticsFacade.loadViewEventTags({
        page_name: this.tagging.Page_Name,
        page_category: this.tagging.Page_Category
      });
    }
  }
}


here is my code that i want to be same as static page ngrx store 


pl-pharmacy-content.spot.actions.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const PlPharmacyContentSpotActions = createActionGroup({
  source: 'PlPharmacyContentSpot',
  events: {
    'Get PlPharmacyContentSpot': emptyProps(),
    'Get PlPharmacyContentSpot Success': emptyProps(),
    'Get PlPharmacyContentSpot Failure': props<{ error: ReportableError }>(),
    'Edit PlPharmacyContentSpot': props<{ plPharmacyContentSpot: string }>()
  }
});

pl-pharmacy-content.spot.effects.ts
import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of } from 'rxjs';

import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';

@Injectable()
export class PlPharmacyContentSpotEffects {
  private readonly actions$ = inject(Actions);

  private readonly errorTag = 'PlPharmacyContentSpotEffects';

  public getPlPharmacyContentSpot$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PlPharmacyContentSpotActions.getPlPharmacyContentSpot),
      map(() => {
        return PlPharmacyContentSpotActions.getPlPharmacyContentSpotSuccess();
      }),
      catchError((error: unknown) => {
        return of(
          PlPharmacyContentSpotActions.getPlPharmacyContentSpotFailure({
            error: errorMessage(this.errorTag, error)
          })
        );
      })
    );
  });
}

pl-pharmacy-content.spot.facade.ts

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import { PlPharmacyContentSpotFeature } from './pl-pharmacy-content-spot.reducer';

@Injectable({ providedIn: 'root' })
export class PlPharmacyContentSpotFacade {
  protected readonly store = inject(Store);

  public readonly plPharmacyContentSpot$ = this.store.select(
    PlPharmacyContentSpotFeature.selectPlPharmacyContentSpot
  );

  public readonly loading$ = this.store.select(
    PlPharmacyContentSpotFeature.selectLoading
  );

  public readonly error$ = this.store.select(
    PlPharmacyContentSpotFeature.selectError
  );

  public editPlPharmacyContentSpot(plPharmacyContentSpot: string): void {
    this.store.dispatch(
      PlPharmacyContentSpotActions.editPlPharmacyContentSpot({
        plPharmacyContentSpot
      })
    );
  }
}

pl-pharmacy-content.spot.reducer.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';

export const PL_PHARMACY_CONTENT_SPOT_FEATURE_KEY = 'pl-pharmacy-content-spot';

export interface PlPharmacyContentSpotState {
  plPharmacyContentSpot: string;
  loading: boolean;
  error: ReportableError | undefined;
}

export const initialPlPharmacyContentSpotState: PlPharmacyContentSpotState = {
  plPharmacyContentSpot: '',
  loading: false,
  error: undefined
};

const reducer: ActionReducer<PlPharmacyContentSpotState> = createReducer(
  initialPlPharmacyContentSpotState,
  on(PlPharmacyContentSpotActions.getPlPharmacyContentSpot, (state) => ({
    ...state,
    loading: true
  })),
  on(PlPharmacyContentSpotActions.getPlPharmacyContentSpotSuccess, (state) => ({
    ...state,
    loading: false
  })),
  on(
    PlPharmacyContentSpotActions.getPlPharmacyContentSpotFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),
  on(
    PlPharmacyContentSpotActions.editPlPharmacyContentSpot,
    (state, { plPharmacyContentSpot }) => ({
      ...state,
      plPharmacyContentSpot
    })
  )
);

export const PlPharmacyContentSpotFeature = createFeature({
  name: PL_PHARMACY_CONTENT_SPOT_FEATURE_KEY,
  reducer
});

pl-pharmacy-content.spot.service.ts

import { inject, Injectable } from '@angular/core';
import { AuthFacade } from '@digital-blocks/angular/core/store/auth';
import { PageDefinitionFacade } from '@digital-blocks/angular/core/store/page-definition';
import { ExperienceService } from '@digital-blocks/angular/core/util/experience-service';
import { mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { filter, map, Observable, of, switchMap } from 'rxjs';

import { CMSAPIResponse } from '../../../../static-page-spots/src/lib/static-page-spots-interface';

import { CmsContentConfig } from './static-page-spots.config';

@Injectable({
  providedIn: 'root'
})
export class StaticPageSpotsService {
  private readonly experienceService = inject(ExperienceService);
  private readonly pageDefinition = inject(PageDefinitionFacade);
  private readonly authFacade = inject(AuthFacade);

  /**
   * @description To gather the StaticPageSpots object
   *
   * @function getCmsContent
   * @returns Observable of StaticPageSpotsResponse
   *
   * @cms_content
   */
  public getCmsContent(cmsSpot: string): Observable<CMSAPIResponse> {
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
            CmsContentConfig.mock +
              cmsSpot +
              (isAuth ? '_auth.json' : '_unauth.json'),
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
              maxRequestTime: 10_000 /**Added request time to match the gateway timeout as the order detail exp api takes more than 2 secs*/,
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




