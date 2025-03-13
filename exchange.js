import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';
import { PlPharmacyContentSpotActions } from './pl-pharmacy-content-spot.actions';
import { PageData } from '../pl-pharmacy-content-spot-interface';

export const PL_PHARMACY_CONTENT_SPOT_FEATURE_KEY = 'pl-pharmacy-content-spot';

export interface PlPharmacyContentSpotState {
  plPharmacyContentSpots: PageData[] | null; // ✅ Storing API response directly
  cmsSpots: { spotName: string }[]; // ✅ Keep track of requested spots
  loading: boolean;
  error: ReportableError | undefined;
}

export const initialPlPharmacyContentSpotState: PlPharmacyContentSpotState = {
  plPharmacyContentSpots: null, // ✅ Default empty state
  cmsSpots: [], // ✅ Track which spots are being requested
  loading: false,
  error: undefined
};

export const reducer: ActionReducer<PlPharmacyContentSpotState> = createReducer(
  initialPlPharmacyContentSpotState,

  // ✅ Handle API request - set loading and store requested spots
  on(PlPharmacyContentSpotActions.getPlPharmacyContentSpots, (state, { cmsSpots }) => ({
    ...state,
    cmsSpots, // ✅ Store requested CMS spots
    loading: true,
    error: undefined
  })),

  // ✅ Handle API success - store fetched content and reset loading state
  on(PlPharmacyContentSpotActions.getPlPharmacyContentSpotsSuccess, (state, { plPharmacyContentSpots }) => ({
    ...state,
    plPharmacyContentSpots, // ✅ Store fetched spots data
    loading: false,
    error: undefined
  })),

  // ✅ Handle API failure - keep previous state but store error
  on(PlPharmacyContentSpotActions.getPlPharmacyContentSpotsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error // ✅ Store error message
  }))
);

export const PlPharmacyContentSpotFeature = createFeature({
  name: PL_PHARMACY_CONTENT_SPOT_FEATURE_KEY,
  reducer
});
