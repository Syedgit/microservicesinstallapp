effects.ts


import { TestBed } from '@angular/core/testing';
import { AuthFacade } from '@digital-blocks/angular/core/store/auth';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { PlPharmacyContentSpotService } from '../services';

import {
  error,
  plPharmacySpotsMockResponse
} from './mocks/pl-pharmacy-content-spot.constants.spec';
import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import { PlPharmacyContentSpotEffects } from './pl-pharmacy-content-spot.effects';

describe('PlPharmacyEffects', () => {
  let actions$: Observable<any>;
  let effects: PlPharmacyContentSpotEffects;
  let plPharmacySpotsService: PlPharmacyContentSpotService;
  const cmsContentSpots = [
    {
      spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot'
    },
    {
      spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot'
    }
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
            getCmsContent: jest.fn(() => {
              return of(undefined);
            })
          }
        },
        {
          provide: AuthFacade,
          useValue: {
            guestTokenValid$: of(true)
          }
        }
      ]
    });

    effects = TestBed.inject(PlPharmacyContentSpotEffects);
    plPharmacySpotsService = TestBed.inject(PlPharmacyContentSpotService);
  });

  describe('getCmsContent$', () => {
    it('returns pl spots Success"', async () => {
      const expectedAction =
        PlPharmacyContentSpotActions.getPlPharmacyContentSpotsSuccess({
          plPharmacyContentSpots: plPharmacySpotsMockResponse
        });

      actions$ = of(
        PlPharmacyContentSpotActions.getPlPharmacyContentSpots({
          cmsSpots: cmsContentSpots
        })
      );

      jest
        .spyOn(plPharmacySpotsService, 'fetchMultiplePlPageContents')
        .mockReturnValue(of(plPharmacySpotsMockResponse));

      expect(await firstValueFrom(effects.getPlPharmacyContentSpots$)).toEqual(
        expectedAction
      );
    });
  });

  it('returns "Get CMS Api Errors" when it errors', async () => {
    const expectedAction =
      PlPharmacyContentSpotActions.getPlPharmacyContentSpotsFailure({
        error: errorMessage(effects.constructor.name, error)
      });

    actions$ = of(
      PlPharmacyContentSpotActions.getPlPharmacyContentSpots({
        cmsSpots: cmsContentSpots
      })
    );

    jest
      .spyOn(plPharmacySpotsService, 'fetchMultiplePlPageContents')
      .mockReturnValue(
        throwError(() => {
          return errorMessage(effects.constructor.name, error);
        })
      );
    const firstValue = await firstValueFrom(effects.getPlPharmacyContentSpots$);

    expect(firstValue).toEqual(expectedAction);
  });
});


facade.ts

import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { PageData } from '../pl-pharmacy-content-spot-interface';

import { mockPageContent } from './mocks/pl-pharmacy-content-spot.constants.spec';
import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import { PlPharmacyContentSpotFacade } from './pl-pharmacy-content-spot.facade';
import {
  PlPharmacyContentSpotState,
  PlPharmacyContentSpotFeature
} from './pl-pharmacy-content-spot.reducer';

describe('plPharmacyContentSPots', () => {
  let facade: PlPharmacyContentSpotFacade;
  let store: MockStore<PlPharmacyContentSpotState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlPharmacyContentSpotFacade,
        provideMockStore({
          initialState: {
            PlPharmacyContentSpotState: {} as PageData,
            loading: false,
            error: undefined
          },
          selectors: [
            {
              selector:
                PlPharmacyContentSpotFeature.selectPlPharmacyContentSpots,
              value: mockPageContent
            }
          ]
        })
      ]
    });
    facade = TestBed.inject(PlPharmacyContentSpotFacade);
    store = TestBed.inject(MockStore);
  });

  describe('getMemberRights', () => {
    it('should dispatch an action to getMemberRights', () => {
      const action = PlPharmacyContentSpotActions.getPlPharmacyContentSpots({
        cmsSpots: [
          {
            spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot'
          },
          {
            spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot'
          }
        ]
      });
      const spy = jest.spyOn(store, 'dispatch');

      facade.getPlPharmacyContentSpots([
        {
          spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot'
        },
        {
          spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot'
        }
      ]);

      expect(spy).toHaveBeenCalledWith(action);
    });
  });
});


reducer.spec

import { mockPageContent } from './mocks/pl-pharmacy-content-spot.constants.spec';
import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import {
  initialPlPharmacyContentSpotState,
  reducer
} from './pl-pharmacy-content-spot.reducer';

it('get Pl spots', () => {
  const action = PlPharmacyContentSpotActions.getPlPharmacyContentSpots({
    cmsSpots: [
      {
        spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot'
      },
      {
        spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot'
      }
    ]
  });

  const expectedState = {
    ...initialPlPharmacyContentSpotState,
    plPharmacyContentSpots: null,
    loading: true
  };

  const result = reducer(initialPlPharmacyContentSpotState, action);

  expect(result).toEqual(expectedState);
});

it('pl search page on CMS Api success"', () => {
  const action = PlPharmacyContentSpotActions.getPlPharmacyContentSpots({
    cmsSpots: [
      {
        spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot'
      },
      {
        spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot'
      }
    ]
  });

  const expectedState = {
    ...initialPlPharmacyContentSpotState,
    plPharmacyContentSpots: mockPageContent
  };

  const result = reducer(initialPlPharmacyContentSpotState, action);

  expect(result).toEqual(expectedState);
});


actions.spec

import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';

describe('StaticPageSpotsActions', () => {
  it('actions', () => {
    const actions = PlPharmacyContentSpotActions;

    expect(actions).toBeTruthy();
  });
});


ERRORS>>>>>>>>>>>>>


  Use `node --trace-deprecation ...` to show where the warning was created)
 FAIL   angular-pharmacy-pharmacy-locator-store-pl-pharmacy-content-spot  libs/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-content-spot/src/lib/+state/pl-pharmacy-content-spot.reducer.spec.ts
  ● get Pl spots

    expect(received).toEqual(expected) // deep equality

    - Expected  - 0
    + Received  + 8

      Object {
    +   "cmsSpots": Array [
    +     Object {
    +       "spotName": "PortletIntegratedPharmacyLocatorSearchAnnouncementSpot",
    +     },
    +     Object {
    +       "spotName": "PortletIntegratedPharmacyLocatorResultsAnnouncementSpot",
    +     },
    +   ],
        "error": undefined,
        "loading": true,
        "plPharmacyContentSpots": null,
      }

      26 |   const result = reducer(initialPlPharmacyContentSpotState, action);
      27 |
    > 28 |   expect(result).toEqual(expectedState);
         |                  ^
      29 | });
      30 |
      31 | it('pl search page on CMS Api success"', () => {

      at src/lib/+state/pl-pharmacy-content-spot.reducer.spec.ts:28:18
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone-testing.umd.js:2177:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● pl search page on CMS Api success"

    expect(received).toEqual(expected) // deep equality

    - Expected  - 8
    + Received  + 6

      Object {
    -   "error": undefined,
    -   "loading": false,
    -   "plPharmacyContentSpots": Array [
    +   "cmsSpots": Array [
          Object {
    -       "elementType": "headerHtml",
    -       "elementValue": "<h1>Member Rights &amp; Responsibilities</h1>
    - ",
    +       "spotName": "PortletIntegratedPharmacyLocatorSearchAnnouncementSpot",
          },
          Object {
    -       "elementType": "bodyHtml",
    -       "elementValue": "<h2><b>Plan Member rights include:</b></h2><ul><li>Have your personal data and medical information kept private and confidential according to state and federal law.</li><li>Know who you are speaking with, his/her job title and to speak with a supervisor if needed.</li><li>Be treated with courtesy, dignity and respect.</li><li>Decide not to participate or stop your involvement at any time.</li><li>Receive current information about your medicines.</li><li>Request further information concerning anything you do not understand.</li><li>Communicate complaints to CVS Caremark and receive instructions on how to use the complaint process.</li><li>Know that utilization management (UM) decisions are based only on the appropriateness of care and your current coverage.&nbsp; CVS Caremark does not reward practitioners or others for denying coverage.&nbsp; Financial incentives for UM decision makers do not encourage decisions that result in underutilization.</li></ul><h2><b>Plan Member responsibilities:</b></h2><ul><li>Give accurate and complete health information concerning medications, allergies, and other pertinent information necessary for CVS Caremark to render appropriate services.</li><li>Advise CVS Caremark of any changes in your insurance benefits, employment status or employer.</li><li>Fulfill financial obligations for services.</li></ul>",
    +       "spotName": "PortletIntegratedPharmacyLocatorResultsAnnouncementSpot",
          },
        ],
    +   "error": undefined,
    +   "loading": true,
    +   "plPharmacyContentSpots": null,
      }

      48 |   const result = reducer(initialPlPharmacyContentSpotState, action);
      49 |
    > 50 |   expect(result).toEqual(expectedState);
         |                  ^
      51 | });
      52 |

      at src/lib/+state/pl-pharmacy-content-spot.reducer.spec.ts:50:18
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone-testing.umd.js:2177:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

(node:95126) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 PASS   angular-pharmacy-pharmacy-locator-store-pl-pharmacy-content-spot  libs/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-content-spot/src/lib/+state/pl-pharmacy-content-spot.facade.spec.ts
(node:95124) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 FAIL   angular-pharmacy-pharmacy-locator-store-pl-pharmacy-content-spot  libs/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-content-spot/src/lib/+state/pl-pharmacy-content-spot.effects.spec.ts (5.246 s)
  ● PlPharmacyEffects › getCmsContent$ › returns "Get MemberRights" with member profile if it is on a "Get MemberRights Success"

    Property `fetchMultiplePlPageContents` does not exist in the provided object

      69 |
      70 |       jest
    > 71 |         .spyOn(plPharmacySpotsService, 'fetchMultiplePlPageContents')
         |          ^
      72 |         .mockReturnValue(of(plPharmacySpotsMockResponse));
      73 |
      74 |       expect(await firstValueFrom(effects.getPlPharmacyContentSpots$)).toEqual(

      at ModuleMocker.spyOn (../../../../../../node_modules/.pnpm/jest-mock@29.7.0/node_modules/jest-mock/build/index.js:731:13)
      at src/lib/+state/pl-pharmacy-content-spot.effects.spec.ts:71:10
      at ../../../../../../node_modules/.pnpm/tslib@2.8.1/node_modules/tslib/tslib.js:170:75
      at new ZoneAwarePromise (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:2623:29)
      at Object.__awaiter (../../../../../../node_modules/.pnpm/tslib@2.8.1/node_modules/tslib/tslib.js:166:16)
      at src/lib/+state/pl-pharmacy-content-spot.effects.spec.ts:58:110
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone-testing.umd.js:2177:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● PlPharmacyEffects › returns "Get CMS Api Errors" when it errors

    Property `fetchMultiplePlPageContents` does not exist in the provided object

      91 |
      92 |     jest
    > 93 |       .spyOn(plPharmacySpotsService, 'fetchMultiplePlPageContents')
         |        ^
      94 |       .mockReturnValue(
      95 |         throwError(() => {
      96 |           return errorMessage(effects.constructor.name, error);

      at ModuleMocker.spyOn (../../../../../../node_modules/.pnpm/jest-mock@29.7.0/node_modules/jest-mock/build/index.js:731:13)
      at src/lib/+state/pl-pharmacy-content-spot.effects.spec.ts:93:8
      at ../../../../../../node_modules/.pnpm/tslib@2.8.1/node_modules/tslib/tslib.js:170:75
      at new ZoneAwarePromise (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:2623:29)
      at Object.__awaiter (../../../../../../node_modules/.pnpm/tslib@2.8.1/node_modules/tslib/tslib.js:166:16)
      at src/lib/+state/pl-pharmacy-content-spot.effects.spec.ts:80:64
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone-testing.umd.js:2177:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

Jest: "global" coverage threshold for statements (80%) not met: 76.19%
Jest: "global" coverage threshold for branches (80%) not met: 0%
Jest: "global" coverage threshold for lines (80%) not met: 73.68%
Jest: "global" coverage threshold for functions (80%) not met: 27.77%
