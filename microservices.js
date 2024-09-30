prescriptions actions:

import { PharmacyInfo } from '../prescriptions-list.types';
import { PrescriptionsListActions } from './prescriptions-list.actions';
import { TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

describe('PrescriptionsListActions', () => {
  
  // Existing test cases unchanged

  it('should create Submit Transfer action', () => {
    const request: TransferOrderRequest = {
      data: {
        idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
        externalTransfer: [],
        profile: null,
      },
    };
    const action = PrescriptionsListActions.submitTransfer({ request });

    expect(action.type).toBe('[PrescriptionsList] Submit Transfer');
    expect(action.request).toEqual(request);
  });

  it('should create Submit Transfer Success action', () => {
    const response = {
      statusCode: "0000",
      statusDescription: "Success",
      data: {
        submitExternalTransfer: [
          {
            statusCode: "0000",
            statusDescription: "Success",
            confirmationNumber: "WE202409251821481QRP"
          }
        ]
      }
    };
    const action = PrescriptionsListActions.submitTransferSuccess({ submitTransferResponse: response });

    expect(action.type).toBe('[PrescriptionsList] Submit Transfer Success');
    expect(action.submitTransferResponse).toEqual(response);
  });

  it('should create Submit Transfer Failure action', () => {
    const error = { message: 'Error', tag: 'PrescriptionsList' };
    const action = PrescriptionsListActions.submitTransferFailure({ error });

    expect(action.type).toBe('[PrescriptionsList] Submit Transfer Failure');
    expect(action.error).toEqual(error);
  });
});


effects.specs

import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { of } from 'rxjs';
import { PrescriptionsListService } from '../services';
import { PrescriptionsListActions } from './prescriptions-list.actions';
import { PrescriptionsListEffects } from './prescriptions-list.effects';
import { TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

describe('PrescriptionsListEffects', () => {
  let actions$: Actions;
  let effects: PrescriptionsListEffects;
  let prescriptionsListService: PrescriptionsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PrescriptionsListEffects,
        provideMockActions(() => actions$),
        {
          provide: PrescriptionsListService,
          useValue: {
            submitTransfer: jest.fn(),
          }
        }
      ]
    });

    effects = TestBed.inject(PrescriptionsListEffects);
    prescriptionsListService = TestBed.inject(PrescriptionsListService);
  });

  describe('submitTransfer$', () => {
    it('should return submitTransferSuccess action on successful transfer', (done) => {
      const request: TransferOrderRequest = {
        data: {
          idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
          externalTransfer: [],
          profile: null
        },
      };

      const mockResponse = {
        statusCode: "0000",
        statusDescription: "Success",
        data: {}
      };

      actions$ = of(PrescriptionsListActions.submitTransfer({ request }));
      (prescriptionsListService.submitTransfer as jest.Mock).mockReturnValue(of(mockResponse));

      effects.submitTransfer$.subscribe((action) => {
        expect(action).toEqual(PrescriptionsListActions.submitTransferSuccess({ submitTransferResponse: mockResponse }));
        done();
      });
    });

    it('should return submitTransferFailure action on failed transfer', (done) => {
      const request: TransferOrderRequest = {
        data: {
          idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
          externalTransfer: [],
          profile: null
        },
      };
      const mockError = { message: 'Transfer failed', tag: 'PrescriptionsList' };

      actions$ = of(PrescriptionsListActions.submitTransfer({ request }));
      (prescriptionsListService.submitTransfer as jest.Mock).mockReturnValue(of(mockError));

      effects.submitTransfer$.subscribe((action) => {
        expect(action).toEqual(PrescriptionsListActions.submitTransferFailure({ error: mockError }));
        done();
      });
    });
  });
});


facade.specs

import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { PrescriptionsListFacade } from './prescriptions-list.facade';
import { PrescriptionsListActions } from './prescriptions-list.actions';
import { TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

describe('PrescriptionsListFacade', () => {
  let facade: PrescriptionsListFacade;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [PrescriptionsListFacade],
    });

    store = TestBed.inject(Store);
    facade = TestBed.inject(PrescriptionsListFacade);
  });

  it('should dispatch submitTransfer action on submitTransfer', () => {
    const storeDispatchSpy = jest.spyOn(store, 'dispatch');

    const request: TransferOrderRequest = {
      data: {
        idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
        externalTransfer: [],
        profile: null
      },
    };

    facade.submitTransfer(request);

    expect(storeDispatchSpy).toHaveBeenCalledWith(PrescriptionsListActions.submitTransfer({ request }));
  });
});

reducer.specs

import { ReportableError } from '@digital-blocks/core/util/error-handler';
import { PrescriptionsListActions } from './prescriptions-list.actions';
import {
  PrescriptionsListState,
  initialPrescriptionsListState,
  PrescriptionsListFeature,
} from './prescriptions-list.reducer';
import { SubmitTransferResponse } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

describe('PrescriptionsListReducer', () => {
  let state: PrescriptionsListState;

  beforeEach(() => {
    state = { ...initialPrescriptionsListState };
  });

  it('should return the initial state', () => {
    const { reducer } = PrescriptionsListFeature;
    const result = reducer(state, { type: '@@INIT' });
    expect(result).toEqual(initialPrescriptionsListState);
  });

  it('should handle submitTransfer action', () => {
    const { reducer } = PrescriptionsListFeature;
    const result = reducer(state, PrescriptionsListActions.submitTransfer({ request: { data: { idType: 'PBM_QL_PARTICIPANT_ID_TYPE', externalTransfer: [], profile: null } } }));

    expect(result).toEqual({
      ...state,
      loading: true,
    });
  });

  it('should handle submitTransferSuccess action', () => {
    const submitTransferResponse: SubmitTransferResponse = {
      statusCode: '0000',
      statusDescription: 'Success',
      data: [],
    };

    const action = PrescriptionsListActions.submitTransferSuccess({ submitTransferResponse });
    const result = PrescriptionsListFeature.reducer(state, action);

    expect(result).toEqual({
      ...initialPrescriptionsListState,
      submitTransferResponse,
      loading: false,
    });
  });

  it('should handle submitTransferFailure action', () => {
    const mockError: ReportableError = {
      message: 'Transfer failed',
      tag: 'PrescriptionsList',
    };

    const action = PrescriptionsListActions.submitTransferFailure({
      error: mockError,
    });
    const result = PrescriptionsListFeature.reducer(state, action);

    expect(result).toEqual({
      ...initialPrescriptionsListState,
      loading: false,
      error: mockError,
    });
  });

  // Existing tests for other actions unchanged
});
