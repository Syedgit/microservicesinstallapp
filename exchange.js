Effects


import { TestBed } from '@angular/core/testing';
import { AuthFacade } from '@digital-blocks/angular/core/store/auth';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { PlPharmacyContentSpotService } from '../services';
import { plPharmacySpotsMockResponse, error } from './mocks/pl-pharmacy-content-spot.constants.spec';
import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import { PlPharmacyContentSpotEffects } from './pl-pharmacy-content-spot.effects';

describe('PlPharmacyContentSpotEffects', () => {
  let actions$: Observable<any>;
  let effects: PlPharmacyContentSpotEffects;
  let plPharmacySpotsService: PlPharmacyContentSpotService;

  const cmsContentSpots = [
    { spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot' },
    { spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlPharmacyContentSpotEffects,
        provideMockStore(),
        provideMockActions(() => actions$),
        {
          provide: PlPharmacyContentSpotService,
          useValue: {
            fetchMultiplePlPageContents: jest.fn(() => of(plPharmacySpotsMockResponse)), // ✅ Ensure this method exists
          }
        },
        {
          provide: AuthFacade,
          useValue: { guestTokenValid$: of(true) }
        }
      ]
    });

    effects = TestBed.inject(PlPharmacyContentSpotEffects);
    plPharmacySpotsService = TestBed.inject(PlPharmacyContentSpotService);
  });

  describe('getPlPharmacyContentSpots$', () => {
    it('should dispatch success action when service returns data', async () => {
      const expectedAction = PlPharmacyContentSpotActions.getPlPharmacyContentSpotsSuccess({
        fullResponse: plPharmacySpotsMockResponse
      });

      actions$ = of(PlPharmacyContentSpotActions.getPlPharmacyContentSpots({ cmsSpots: cmsContentSpots }));

      jest.spyOn(plPharmacySpotsService, 'fetchMultiplePlPageContents').mockReturnValue(of(plPharmacySpotsMockResponse));

      expect(await firstValueFrom(effects.getPlPharmacyContentSpots$)).toEqual(expectedAction);
    });

    it('should dispatch failure action when service throws an error', async () => {
      const expectedAction = PlPharmacyContentSpotActions.getPlPharmacyContentSpotsFailure({
        error: errorMessage(effects.constructor.name, error)
      });

      actions$ = of(PlPharmacyContentSpotActions.getPlPharmacyContentSpots({ cmsSpots: cmsContentSpots }));

      jest.spyOn(plPharmacySpotsService, 'fetchMultiplePlPageContents').mockReturnValue(
        throwError(() => errorMessage(effects.constructor.name, error))
      );

      expect(await firstValueFrom(effects.getPlPharmacyContentSpots$)).toEqual(expectedAction);
    });
  });
});


Reducer


import { mockPageContent } from './mocks/pl-pharmacy-content-spot.constants.spec';
import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import { initialPlPharmacyContentSpotState, reducer } from './pl-pharmacy-content-spot.reducer';

describe('PlPharmacyContentSpotReducer', () => {
  it('should set loading to true on getPlPharmacyContentSpots', () => {
    const action = PlPharmacyContentSpotActions.getPlPharmacyContentSpots({
      cmsSpots: [
        { spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot' },
        { spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot' }
      ]
    });

    const expectedState = {
      ...initialPlPharmacyContentSpotState,
      loading: true
    };

    expect(reducer(initialPlPharmacyContentSpotState, action)).toEqual(expectedState);
  });

  it('should update fullApiResponse on getPlPharmacyContentSpotsSuccess', () => {
    const action = PlPharmacyContentSpotActions.getPlPharmacyContentSpotsSuccess({
      fullResponse: { data: { cmsContent: mockPageContent } } // ✅ Ensure correct structure
    });

    const expectedState = {
      ...initialPlPharmacyContentSpotState,
      fullApiResponse: { data: { cmsContent: mockPageContent } },
      loading: false
    };

    expect(reducer(initialPlPharmacyContentSpotState, action)).toEqual(expectedState);
  });
});


facade


import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mockPageContent } from './mocks/pl-pharmacy-content-spot.constants.spec';
import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import { PlPharmacyContentSpotFacade } from './pl-pharmacy-content-spot.facade';
import { PlPharmacyContentSpotState, PlPharmacyContentSpotFeature } from './pl-pharmacy-content-spot.reducer';

describe('PlPharmacyContentSpotFacade', () => {
  let facade: PlPharmacyContentSpotFacade;
  let store: MockStore<PlPharmacyContentSpotState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlPharmacyContentSpotFacade,
        provideMockStore({
          initialState: {
            fullApiResponse: null,
            loading: false,
            error: undefined
          },
          selectors: [
            { selector: PlPharmacyContentSpotFeature.selectFullApiResponse, value: mockPageContent }
          ]
        })
      ]
    });

    facade = TestBed.inject(PlPharmacyContentSpotFacade);
    store = TestBed.inject(MockStore);
  });

  describe('getPlPharmacyContentSpots', () => {
    it('should dispatch action to getPlPharmacyContentSpots', () => {
      const action = PlPharmacyContentSpotActions.getPlPharmacyContentSpots({
        cmsSpots: [
          { spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot' },
          { spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot' }
        ]
      });

      const spy = jest.spyOn(store, 'dispatch');

      facade.getPlPharmacyContentSpots([
        { spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot' },
        { spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot' }
      ]);

      expect(spy).toHaveBeenCalledWith(action);
    });
  });
});


action

import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';

describe('PlPharmacyContentSpotActions', () => {
  it('should create actions successfully', () => {
    expect(PlPharmacyContentSpotActions).toBeTruthy();
  });
});

