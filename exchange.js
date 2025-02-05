import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { PharmacyDetail } from '../pl-pharmacy-detail.types';

import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';

export const PL_PHARMACY_DETAIL_FEATURE_KEY = 'pl-pharmacy-detail';

export interface PlPharmacyDetailState {
  selectedPharmacy: PharmacyDetail | null;
  loading: boolean;
  error: ReportableError | undefined;
}

export const initialPlPharmacyDetailState: PlPharmacyDetailState = {
  selectedPharmacy: null,
  loading: false,
  error: undefined
};

const reducer: ActionReducer<PlPharmacyDetailState> = createReducer(
  initialPlPharmacyDetailState,
  on(PlPharmacyDetailActions.setSelectedPharmacy, (state, { pharmacy }) => ({
    ...state,
    selectedPharmacy: pharmacy,
    loading: true
  })),
  on(PlPharmacyDetailActions.clearSelectedPharmacy, (state) => ({
    ...state,
    selectedPharmacy: null,
    loading: false
  }))
);

export const PlPharmacyDetailFeature = createFeature({
  name: PL_PHARMACY_DETAIL_FEATURE_KEY,
  reducer
});
