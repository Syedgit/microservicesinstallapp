prescriptionList actions.ts

import { ReportableError } from '@digital-blocks/core/util/error-handler';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { PharmacyInfo, PrescriptionsInfo } from '../prescriptions-list.types';
import { TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

export const PrescriptionsListActions = createActionGroup({
  source: 'PrescriptionsList',
  events: {
    'Load Selected Pharmacy': emptyProps(),
    'Submit Transfer': props<{request: TransferOrderRequest }>(),
    'Submit Transfer Success': props<{ submitTransferResponse: any}>(),
    'Submit Transfer Failure': props<{ error: ReportableError }>(),
    'Load Selected Pharmacy Success': props<{ response: PharmacyInfo }>(),
    'Load Selected Pharmacy Failure': props<{ error: ReportableError }>(),
    'Set Selected Pharmacy': props<{ selectedPharmacy: PharmacyInfo }>(),
    'Get PrescriptionsList': emptyProps(),
    'Get PrescriptionsList Success': props<{ response: PrescriptionsInfo }>(),
    'Get PrescriptionsList Failure': props<{ error: ReportableError }>(),
    'Set Selected PrescriptionsList': props<{
      selectedPrescriptions: PrescriptionsInfo;
    }>(),
    'Delete Prescriptions': props<{ deletedPrescriptions: string[] }>()
  }
});

Prescriptions-list-actions.specs.ts

import { PharmacyInfo } from '../prescriptions-list.types';

import { PrescriptionsListActions } from './prescriptions-list.actions';

describe('PrescriptionsListActions', () => {
  it('should create Load Selected Pharmacy action', () => {
    const action = PrescriptionsListActions.loadSelectedPharmacy();

    expect(action.type).toBe('[PrescriptionsList] Load Selected Pharmacy');
  });

  it('should create Load Selected Pharmacy Success action', () => {
    const pharmacy: PharmacyInfo = {
      id: 'pharmacy 1',
      name: 'Local Pharmacy',
      address: 'One Main Street',
      cityState: 'New York, NY',
      distance: '10 miles'
    };
    const action = PrescriptionsListActions.loadSelectedPharmacySuccess({
      response: pharmacy
    });

    expect(action.type).toBe(
      '[PrescriptionsList] Load Selected Pharmacy Success'
    );
    expect(action.response).toEqual(pharmacy);
  });

  it('should create Set Selected Pharmacy action', () => {
    const pharmacy: PharmacyInfo = {
      id: 'pharmacy 1',
      name: 'Local Pharmacy',
      address: 'One Main Street',
      cityState: 'New York, NY',
      distance: '10 miles'
    };
    const action = PrescriptionsListActions.setSelectedPharmacy({
      selectedPharmacy: pharmacy
    });

    expect(action.type).toBe('[PrescriptionsList] Set Selected Pharmacy');
    expect(action.selectedPharmacy).toEqual(pharmacy);
  });

  it('should create Submit Transfer action', () => {
    const action = PrescriptionsListActions.submitTransfer();

    expect(action.type).toBe('[PrescriptionsList] Submit Transfer');
  });

  it('should create Submit Transfer Success action', () => {
    const response = {
      "statusCode": "0000",
      "statusDescription": "Success",
      "data": {
          "submitExternalTransfer": [
              {
                  "statusCode": "0000",
                  "statusDescription": "Success",
                  "confirmationNumber": "WE202409251821481QRP"
              }
          ]
      }
  };
    const action = PrescriptionsListActions.submitTransferSuccess({ submitTransferResponse });

    expect(action.type).toBe('[PrescriptionsList] Submit Transfer Success');
    expect(action.submitTransferResponse).toBe(response);
  });

  it('should create Get PrescriptionsList action', () => {
    const action = PrescriptionsListActions.getPrescriptionsList();

    expect(action.type).toBe('[PrescriptionsList] Get PrescriptionsList');
  });

  it('should create Delete Prescriptions action', () => {
    const deletedPrescriptions: any = {};
    const action = PrescriptionsListActions.deletePrescriptions({
      deletedPrescriptions
    });

    expect(action.type).toBe('[PrescriptionsList] Delete Prescriptions');
    expect(action.deletedPrescriptions).toEqual(deletedPrescriptions);
  });
});

effects.ts
import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { PrescriptionsListService } from '../services';

import { PrescriptionsListActions } from './prescriptions-list.actions';

@Injectable()
export class PrescriptionsListEffects {
  private readonly actions$ = inject(Actions);

  private readonly prescriptionService = inject(PrescriptionsListService);
  private readonly errorTag = 'PrescriptionsListEffects';

  public submitTransfer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrescriptionsListActions.submitTransfer),
      switchMap(({request}) => {
        //calling backend
        return this.prescriptionService.submitTransfer(request).pipe(
          map((submitTransferResponse) => {
            return PrescriptionsListActions.submitTransferSuccess({ submitTransferResponse });
          }),
          catchError((error: unknown) => {
            return of(
              PrescriptionsListActions.submitTransferFailure({
                error: errorMessage(this.errorTag, error)
              })
            );
          })
        );
      })
    );
  });
}

effects.specs.ts 

import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { of } from 'rxjs';

import { PrescriptionsListService } from '../services';

import { PrescriptionsListActions } from './prescriptions-list.actions';
import { PrescriptionsListEffects } from './prescriptions-list.effects';

// Define mock data
const mockResponse = 
// const mockError: ReportableError = {
//   message: 'Transfer failed',
//   code: 500,
//   details: { errorType: 'ServerError' }
// };

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
            submitTransfer: jest.fn()
          }
        }
      ]
    });

    effects = TestBed.inject(PrescriptionsListEffects);
    prescriptionsListService = TestBed.inject(PrescriptionsListService);
  });

  describe('submitTransfer$', () => {
    it('should return submitTransferSuccess action on successful transfer', () => {
      // Arrange
      actions$ = of(PrescriptionsListActions.submitTransfer());
      (prescriptionsListService.submitTransfer as jest.Mock).mockReturnValue(
        of(mockResponse)
      );

      // Act
      effects.submitTransfer$.subscribe((action) => {
        // Assert
        expect(action).toEqual(
          PrescriptionsListActions.submitTransferSuccess({
            response: mockResponse
          })
        );
      });
    });

    // it('should return submitTransferFailure action on failed transfer', () => {
    //   // Arrange
    //   actions$ = of(PrescriptionsListActions.submitTransfer());
    //   (prescriptionsListService.submitTransfer as jest.Mock).mockReturnValue(throwError(() => mockError));

    //   // Act
    //   effects.submitTransfer$.subscribe(action => {
    //     // Assert
    //     expect(action).toEqual(PrescriptionsListActions.submitTransferFailure({
    //       error: expect.objectContaining({
    //         message: 'Transfer failed',
    //         code: 500
    //       })
    //     }));
    //   });
    // });
  });
});

facade.ts 

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PharmacyInfo, PrescriptionsInfo } from '../prescriptions-list.types';

import { PrescriptionsListActions } from './prescriptions-list.actions';
import {
  PrescriptionsListFeature,
  PrescriptionsListState
} from './prescriptions-list.reducer';
import { TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

@Injectable({ providedIn: 'root' })
export class PrescriptionsListFacade {
  protected readonly store = inject(Store<PrescriptionsListState>);

  public readonly selectedPrescriptionsList$: Observable<PrescriptionsInfo | null> =
    this.store.select(PrescriptionsListFeature.selectSelectedPrescriptions);

  public readonly selectedPharmacy$: Observable<PharmacyInfo | null> =
    this.store.select(PrescriptionsListFeature.selectSelectedPharmacy);

  public readonly loading$ = this.store.select(
    PrescriptionsListFeature.selectLoading
  );

  public readonly submitTransferResponse$ = this.store.select(
    PrescriptionsListFeature.selectSubmitTransferResponse
  );

  public readonly error$ = this.store.select(
    PrescriptionsListFeature.selectError
  );

  //prescriptions-list
  public initializeSelectedPrescriptions(): void {
    const selectedPrescriptions: PrescriptionsInfo = {
      id: 'subscriber1',
      patientName: 'John',
      medication: [
        {
          med: 'Atorvastatin 10mg'
        },
        {
          med: 'Buproprion 75mg'
        },
        {
          med: 'Isinopril 10mg'
        }
      ]
    };

    this.store.dispatch(
      PrescriptionsListActions.setSelectedPrescriptionsList({
        selectedPrescriptions
      })
    );
  }

  // selected-pharmacy
  public initializeSelectedPharmacy(): void {
    const selectedPharmacy: PharmacyInfo = {
      id: 'pharmacy1',
      name: 'CVS Pharmacy',
      address: '12315 Venice Boulevard',
      cityState: 'Mar Vista, CA 90066',
      distance: '25 miles'
    };

    this.store.dispatch(
      PrescriptionsListActions.setSelectedPharmacy({ selectedPharmacy })
    );
  }


  public submitTransfer(request : TransferOrderRequest): void {
    this.store.dispatch(PrescriptionsListActions.submitTransfer({request}));
  }

  //delete selected prescriptions
  public deleteSelectedPrescriptions(deletedPrescriptions: string[]): void {
    this.store.dispatch(
      PrescriptionsListActions.deletePrescriptions({ deletedPrescriptions })
    );
  }
}


facade.specs.ts 

import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';

import { PharmacyInfo, PrescriptionsInfo } from '../prescriptions-list.types';

import { PrescriptionsListActions } from './prescriptions-list.actions';
import { PrescriptionsListFacade } from './prescriptions-list.facade';
import { PrescriptionsListState } from './prescriptions-list.reducer';

// Define mock data
const mockPharmacy: PharmacyInfo = {
  id: 'pharmacy1',
  name: 'CVS Pharmacy',
  address: '12315 Venice Boulevard',
  cityState: 'Mar Vista, CA 90066',
  distance: '25 miles'
};

const mockPrescriptionsInfo: PrescriptionsInfo = {
  id: 'subscriber1',
  patientName: 'John',
  medication: [
    { med: 'Atorvastatin 10mg' },
    { med: 'Buproprion 75mg' },
    { med: 'Isinopril 10mg' }
  ]
};

const request = {
  "data": {
      "externalTransfer": [
          {
              "carrierId": "",
              "clinicalRuleDate": "09/16/2024",
              "patient": {
                  "address": {
                      "city": "LOS ANGELES",
                      "line": [
                          "10800 ROSE AVENUE"
                      ],
                      "phoneNumber": "7322083469",
                      "postalCode": "90034",
                      "state": "CA"
                  },
                  "dateOfBirth": "",
                  "email": "",
                  "firstName": "John",
                  "gender": "M",
                  "lastName": "Miller",
                  "memberId": "",
                  "patientId": "737961639",
                  "patientIdType": "PBM_QL_PARTICIPANT_ID_TYPE",
                  "profileId": null
              },
              "requestedChannel": "",
              "rxDetails": [
                  {
                      "drugDetails": [
                          {
                              "daySupply": 30,
                              "drugName": "LYRICA 100MG CAP",
                              "encPrescriptionLookupKey": "U2FsdGVkX",
                              "prescriptionLookupKey": {
                                  "id": 73796,
                                  "idType": "PBM_QL_PARTICIPANT_ID_TYPE",
                                  "rxNumber": "129740006"
                              },
                              "provider": {
                                  "address": {
                                      "city": "HILLIARD",
                                      "line": [
                                          "5 LOVERS LANE"
                                      ],
                                      "postalCode": "43026",
                                      "state": "OH"
                                  },
                                  "faxNumber": "4920136825",
                                  "firstName": "CPMSEBQ",
                                  "lastName": "BRADENIII",
                                  "npi": "",
                                  "phoneNumber": "4920130462"
                              },
                              "quantity": 30,
                              "recentFillDate": "08/21/2024"
                          }
                      ],
                      "fromPharmacy": {
                          "address": {
                              "city": "ASHWAUBENON",
                              "line": [
                                  "2395 S ONEIDA ST STE 100"
                              ],
                              "phoneNumber": "9203057011",
                              "postalCode": "54304",
                              "state": "WI"
                          },
                          "pharmacyName": "HYVEE PHARMACY 1025"
                      },
                      "toPharmacy": {
                          "address": {
                              "city": "WOONSOCKET",
                              "line": [
                                  "GREY 1 CVS DRIVE"
                              ],
                              "phoneNumber": "8005414959",
                              "postalCode": "02895",
                              "state": "RI"
                          },
                          "pharmacyName": "ALLIANCERX WALGREENS PRIME 16280",
                          "storeId": "99999"
                      }
                  }
              ]
          }
      ],
      "idType": "PBM_QL_PARTICIPANT_ID_TYPE",
      "profile": null
  }
}

describe('PrescriptionsListFacade', () => {
  let facade: PrescriptionsListFacade;
  let store: Store<PrescriptionsListState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}, { metaReducers: [] }) // Dummy root store
      ],
      providers: [
        PrescriptionsListFacade,
        {
          provide: Store,
          useValue: {
            dispatch: jest.fn(),
            select: jest.fn()
          }
        }
      ]
    });

    store = TestBed.inject(Store);
    facade = TestBed.inject(PrescriptionsListFacade);
  });

  it('should dispatch setSelectedPrescriptionsList action on initializeSelectedPrescriptions', () => {
    const storeDispatchSpy = jest.spyOn(store, 'dispatch');

    facade.initializeSelectedPrescriptions();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      PrescriptionsListActions.setSelectedPrescriptionsList({
        selectedPrescriptions: mockPrescriptionsInfo
      })
    );
  });

  it('should dispatch setSelectedPharmacy action on initializeSelectedPharmacy', () => {
    const storeDispatchSpy = jest.spyOn(store, 'dispatch');

    facade.initializeSelectedPharmacy();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      PrescriptionsListActions.setSelectedPharmacy({
        selectedPharmacy: mockPharmacy
      })
    );
  });

  it('should dispatch submitTransfer action on submitTransfer', () => {
    const storeDispatchSpy = jest.spyOn(store, 'dispatch');

    facade.submitTransfer(request);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      PrescriptionsListActions.submitTransfer(request)
    );
  });

  it('should dispatch deletePrescriptions action on deleteSelectedPrescriptions', () => {
    const deletedPrescriptions = ['Atorvastatin 10mg'];
    const storeDispatchSpy = jest.spyOn(store, 'dispatch');

    facade.deleteSelectedPrescriptions(deletedPrescriptions);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      PrescriptionsListActions.deletePrescriptions({ deletedPrescriptions })
    );
  });
});


reducer.ts

import { ReportableError } from '@digital-blocks/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { PharmacyInfo, PrescriptionsInfo } from '../prescriptions-list.types';

import { PrescriptionsListActions } from './prescriptions-list.actions';
import { SubmitTransferResponse } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';;

export const PRESCRIPTIONS_LIST_FEATURE_KEY = 'prescriptions-list';

export interface PrescriptionsListState {
  selectedPrescriptions: PrescriptionsInfo | null;
  loading: boolean;
  error: ReportableError | undefined;
  selectedPharmacy: PharmacyInfo | null;
  submitTransferResponse: SubmitTransferResponse | null;
}

export const initialPrescriptionsListState: PrescriptionsListState = {
  selectedPrescriptions: null,
  loading: false,
  error: undefined,
  selectedPharmacy: null,
  submitTransferResponse: null
};

const reducer: ActionReducer<PrescriptionsListState> = createReducer(
  initialPrescriptionsListState,
  on(
    PrescriptionsListActions.loadSelectedPharmacySuccess,
    (state, { response }) => ({
      ...state,
      selectedPharmacy: response,
      loading: false
    })
  ),
  on(PrescriptionsListActions.submitTransfer, (state) => ({
    ...state,
    loading: true
  })),
  on(
    PrescriptionsListActions.submitTransferSuccess,
    (state, { submitTransferResponse }) => ({
      ...state,
      submitTransferResponse,
      loading: false
    })
  ),
  on(
    PrescriptionsListActions.submitTransferFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),
  on(
    PrescriptionsListActions.loadSelectedPharmacyFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),
  on(
    PrescriptionsListActions.setSelectedPharmacy,
    (state, { selectedPharmacy }) => ({
      ...state,
      selectedPharmacy
    })
  ),

  on(
    PrescriptionsListActions.getPrescriptionsListSuccess,
    (state, { response }) => ({
      ...state,
      selectedPrescriptions: response,
      loading: false
    })
  ),
  on(
    PrescriptionsListActions.getPrescriptionsListFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),
  on(
    PrescriptionsListActions.setSelectedPrescriptionsList,
    (state, { selectedPrescriptions }) => ({
      ...state,
      selectedPrescriptions
    })
  ),
  on(
    PrescriptionsListActions.deletePrescriptions,
    (state, { deletedPrescriptions }) => ({
      ...state,
      selectedPrescriptions: {
        ...state.selectedPrescriptions,
        medication: state.selectedPrescriptions?.medication.filter(
          (med) => !deletedPrescriptions.includes(med.med)
        )
      } as PrescriptionsInfo | null
    })
  )
);

export const PrescriptionsListFeature = createFeature({
  name: PRESCRIPTIONS_LIST_FEATURE_KEY,
  reducer
});

//Define selectors - these may not be needed
// export const selectPrescriptionsListState = (state: PrescriptionsListState) =>
//   state;
// export const selectLoading = (state: PrescriptionsListState) => state.loading;
// export const selectError = (state: PrescriptionsListState) => state.error;


reducer.specs.ts 

import { ReportableError } from '@digital-blocks/core/util/error-handler';

import { PharmacyInfo, PrescriptionsInfo } from '../prescriptions-list.types';

import { PrescriptionsListActions } from './prescriptions-list.actions';
import {
  PrescriptionsListState,
  initialPrescriptionsListState,
  PrescriptionsListFeature
} from './prescriptions-list.reducer';

const atorvastatin = 'Atorvastatin 10mg';
const buproprion = 'Buproprion 75mg';
const isinopril = 'Isinopril 10mg';

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

  it('should handle loadSelectedPharmacySuccess action', () => {
    // const pharmacy: Pharmacy = {
    //   id: 'pharmacy 1',
    //   name: 'Local Pharmacy',
    //   address: 'One Main Street',
    //   cityState: 'New York, NY',
    //   distance: '10 miles'
    // };
    const mockPharmacy: Pharmacy = {
      id: 'pharmacy1',
      name: 'CVS Pharmacy',
      address: '12315 Venice Boulevard',
      cityState: 'Mar Vista, CA 90066',
      distance: '25 miles'
    };

    const action = PrescriptionsListActions.loadSelectedPharmacySuccess({
      response: mockPharmacy
    });
    const result = PrescriptionsListFeature.reducer(state, action);

    expect(result).toEqual({
      ...initialPrescriptionsListState,
      selectedPharmacy: mockPharmacy,
      loading: false
    });
  });

  it('should handle loadSelectedPharmacyFailure action', () => {
    const mockError: ReportableError = {
      message: 'Not Found',
      tag: 'PrescriptionsListEffects'
    };

    const action = PrescriptionsListActions.loadSelectedPharmacyFailure({
      error: mockError
    });
    const result = PrescriptionsListFeature.reducer(state, action);

    expect(result).toEqual({
      ...initialPrescriptionsListState,
      loading: false,
      error: mockError
    });
  });

  it('should handle setSelectedPharmacy action', () => {
    const mockPharmacy: PharmacyInfo = {
      id: 'pharmacy1',
      name: 'CVS Pharmacy',
      address: '12315 Venice Boulevard',
      cityState: 'Mar Vista, CA 90066',
      distance: '25 miles'
    };

    const action = PrescriptionsListActions.setSelectedPharmacy({
      selectedPharmacy: mockPharmacy
    });
    const result = PrescriptionsListFeature.reducer(state, action);

    expect(result).toEqual({
      ...initialPrescriptionsListState,
      selectedPharmacy: mockPharmacy
    });
  });

  it('should handle getPrescriptionsListSuccess action', () => {
    const mockPrescriptionsInfo: PrescriptionsInfo = {
      id: 'subscriber1',
      patientName: 'John',
      medication: [
        {
          med: atorvastatin
        },
        {
          med: buproprion
        },
        {
          med: isinopril
        }
      ]
    };

    const action = PrescriptionsListActions.getPrescriptionsListSuccess({
      response: mockPrescriptionsInfo
    });
    const result = PrescriptionsListFeature.reducer(state, action);

    expect(result).toEqual({
      ...initialPrescriptionsListState,
      selectedPrescriptions: mockPrescriptionsInfo,
      loading: false
    });
  });

  it('should handle getPrescriptionsListFailure action', () => {
    const mockError: ReportableError = {
      message: 'Not Found',
      tag: 'PrescriptionsListEffects'
    };

    const action = PrescriptionsListActions.getPrescriptionsListFailure({
      error: mockError
    });
    const result = PrescriptionsListFeature.reducer(state, action);

    expect(result).toEqual({
      ...initialPrescriptionsListState,
      loading: false,
      error: mockError
    });
  });

  it('should handle setSelectedPrescriptionsList action', () => {
    const mockPrescriptionsInfo: PrescriptionsInfo = {
      id: 'subscriber1',
      patientName: 'John',
      medication: [
        {
          med: atorvastatin
        },
        {
          med: buproprion
        },
        {
          med: isinopril
        }
      ]
    };

    const action = PrescriptionsListActions.setSelectedPrescriptionsList({
      selectedPrescriptions: mockPrescriptionsInfo
    });
    const result = PrescriptionsListFeature.reducer(state, action);

    expect(result).toEqual({
      ...initialPrescriptionsListState,
      selectedPrescriptions: mockPrescriptionsInfo
    });
  });
});

describe('PrescriptionsListFacade', () => {
  let initialState: PrescriptionsListState;

  beforeEach(() => {
    initialState = {
      selectedPrescriptions: {
        id: 'subscriber1',
        patientName: 'John',
        medication: [
          { med: atorvastatin },
          { med: buproprion },
          { med: isinopril }
        ]
      },
      loading: false,
      error: undefined,
      selectedPharmacy: null,
      submitTransferResponse: null
    };
  });

  it('should handle deletePrescriptions action when selectedPrescriptions is not null', () => {
    const deletedPrescriptions = [buproprion];
    const action = PrescriptionsListActions.deletePrescriptions({
      deletedPrescriptions
    });

    const newState = PrescriptionsListFeature.reducer(initialState, action);

    expect(newState.selectedPrescriptions).toEqual({
      id: 'subscriber1',
      patientName: 'John',
      medication: [{ med: atorvastatin }, { med: isinopril }]
    });
  });

  it('should handle deletePrescriptions action when selectedPrescriptions is null', () => {
    initialState.selectedPrescriptions = null;
    const deletedPrescriptions = [buproprion];
    const action = PrescriptionsListActions.deletePrescriptions({
      deletedPrescriptions
    });

    const newState = PrescriptionsListFeature.reducer(initialState, action);

    //expect(newState.selectedPrescriptions).toBeNull();
  });
});





