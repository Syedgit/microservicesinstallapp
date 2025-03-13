reducer test failure 


 FAIL   angular-pharmacy-pharmacy-locator-store-pl-pharmacy-content-spot  libs/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-content-spot/src/lib/+state/pl-pharmacy-content-spot.reducer.spec.ts
  ● PlPharmacyContentSpotReducer › should set loading to true on getPlPharmacyContentSpots

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

      20 |     };
      21 |
    > 22 |     expect(reducer(initialPlPharmacyContentSpotState, action)).toEqual(
         |                                                                ^
      23 |       expectedState
      24 |     );
      25 |   });

      at src/lib/+state/pl-pharmacy-content-spot.reducer.spec.ts:22:64
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone-testing.umd.js:2177:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.15.0/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)


reducer

import { plPharmacySpotsMockResponse } from './mocks/pl-pharmacy-content-spot.constants.spec';
import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import {
  initialPlPharmacyContentSpotState,
  reducer
} from './pl-pharmacy-content-spot.reducer';

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

    expect(reducer(initialPlPharmacyContentSpotState, action)).toEqual(
      expectedState
    );
  });

  it('should update fullApiResponse on getPlPharmacyContentSpotsSuccess', () => {
    const action =
      PlPharmacyContentSpotActions.getPlPharmacyContentSpotsSuccess({
        plPharmacyContentSpots: plPharmacySpotsMockResponse
      });

    const expectedState = {
      ...initialPlPharmacyContentSpotState,
      plPharmacyContentSpots: plPharmacySpotsMockResponse,
      loading: false
    };

    expect(reducer(initialPlPharmacyContentSpotState, action)).toEqual(
      expectedState
    );
  });
});
