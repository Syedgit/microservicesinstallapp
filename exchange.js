import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import { initialPlPharmacyContentSpotState, reducer } from './pl-pharmacy-content-spot.reducer';
import { plPharmacySpotsMockResponse, error } from './mocks/pl-pharmacy-content-spot.constants.spec';

describe('PlPharmacyContentSpotReducer', () => {
  
  it('should set loading to true and store cmsSpots on getPlPharmacyContentSpots', () => {
    const action = PlPharmacyContentSpotActions.getPlPharmacyContentSpots({
      cmsSpots: [
        { spotName: 'PortletIntegratedPharmacyLocatorSearchAnnouncementSpot' },
        { spotName: 'PortletIntegratedPharmacyLocatorResultsAnnouncementSpot' }
      ]
    });

    const expectedState = {
      ...initialPlPharmacyContentSpotState,
      cmsSpots: action.cmsSpots, // ✅ Store requested CMS spots
      loading: true,
      error: undefined
    };

    expect(reducer(initialPlPharmacyContentSpotState, action)).toEqual(expectedState);
  });

  it('should update plPharmacyContentSpots and set loading to false on getPlPharmacyContentSpotsSuccess', () => {
    const action = PlPharmacyContentSpotActions.getPlPharmacyContentSpotsSuccess({
      plPharmacyContentSpots: plPharmacySpotsMockResponse // ✅ Use mock response
    });

    const expectedState = {
      ...initialPlPharmacyContentSpotState,
      plPharmacyContentSpots: plPharmacySpotsMockResponse, // ✅ Store response data
      loading: false,
      error: undefined
    };

    expect(reducer(initialPlPharmacyContentSpotState, action)).toEqual(expectedState);
  });

  it('should set error and set loading to false on getPlPharmacyContentSpotsFailure', () => {
    const action = PlPharmacyContentSpotActions.getPlPharmacyContentSpotsFailure({
      error
    });

    const expectedState = {
      ...initialPlPharmacyContentSpotState,
      loading: false,
      error // ✅ Store error message
    };

    expect(reducer(initialPlPharmacyContentSpotState, action)).toEqual(expectedState);
  });

  it('should return the default state when an unknown action is dispatched', () => {
    const action = { type: 'UNKNOWN_ACTION' } as any;

    expect(reducer(initialPlPharmacyContentSpotState, action)).toEqual(initialPlPharmacyContentSpotState);
  });
});
