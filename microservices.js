Component.ts

import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input } from '@angular/core';
import { TransferPrescriptionsSubHeaderComponent } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/components';
import { SubmitTransferStore } from './submit-transfer.store';
import {
  TransferOrderRequest,
  ExternalTransfer,
  Patient,
  RxDetails,
  Pharmacy,
  Address,
  DrugDetails,
  PrescriptionLookupKey,
  Provider
} from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/submit-transfer';
import { IPrescriptionDetails } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/current-prescriptions';
import { catchError, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'lib-submit-transfer',
  standalone: true,
  imports: [TransferPrescriptionsSubHeaderComponent],
  templateUrl: 'submit-transfer.component.html',
  styleUrls: ['submit-transfer.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [SubmitTransferStore],
  host: { ngSkipHydration: 'true' }
})
export class SubmitTransferComponent {
  @Input() public staticContent = {
    continueBtnText: 'Continue'
  };

  // Public variable to store current prescriptions
  public currentPrescriptions: IPrescriptionDetails[] | undefined;
  public errorMessage: string | null = null;

  protected readonly store = inject(SubmitTransferStore);

  constructor() {}

  public submitTransfer(): void {
    this.store.currentPrescriptions$.pipe(
      // Using switchMap to handle the currentPrescriptions and continue the observable chain
      switchMap((data: IPrescriptionDetails[] | undefined) => {
        // Assigning the fetched data to the public variable `this.currentPrescriptions`
        this.currentPrescriptions = data;

        // Check if `currentPrescriptions` has a valid length
        if (this.currentPrescriptions && this.currentPrescriptions.length > 0) {
          const transferOrderRequest = this.buildTransferOrderRequest(this.currentPrescriptions);
          
          // Return the transfer request observable if there are prescriptions
          return this.store.submitTransfer(transferOrderRequest).pipe(
            tap(() => this.handleSuccess()), // Handle success
            catchError((error) => {
              this.handleError(error); // Handle error
              return of(null); // Return null in case of error
            })
          );
        } else {
          // No prescriptions selected for transfer
          this.errorMessage = 'No prescriptions selected for transfer.';
          return of(null); // Return null if no prescriptions
        }
      })
    ).subscribe();
  }

  // Method to build the transfer order request
  private buildTransferOrderRequest(currentPrescriptions: IPrescriptionDetails[]): TransferOrderRequest {
    const externalTransfer: ExternalTransfer[] = currentPrescriptions?.length
      ? currentPrescriptions
          .map(prescription => {
            const rxDetails: RxDetails | null = this.mapRxDetails(prescription);
            if (rxDetails && rxDetails.drugDetails.length > 0) {
              const patient: Patient = this.mapPatientDetails(prescription);
              return {
                requestedChannel: '',
                carrierId: '',
                clinicalRuleDate: '09/16/2024',
                patient,
                rxDetails: [rxDetails]
              };
            }
            return null; // Return null if no selected prescriptions
          })
          .filter((transfer): transfer is ExternalTransfer => transfer !== null) // Filter out null entries
      : [];

    return {
      data: {
        id: '737961639', // Assuming this is the patient ID
        idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
        profile: null,
        externalTransfer
      }
    };
  }

  // Method to handle errors
  private handleError(error: any): void {
    console.error('An error occurred:', error);
    this.errorMessage = 'An error occurred while submitting the transfer request. Please try again later.';
  }

  // Method to handle successful submissions
  private handleSuccess(): void {
    console.log('Transfer submitted successfully');
    // Implement any success handling logic, like navigation or showing a success message
  }

  // Method to map prescription details to RxDetails
  private mapRxDetails(prescription: any): RxDetails | null {
    const seenRxNumbers = new Set<string>();
    let fromPharmacy: Pharmacy | null = null;

    // Using `map` to transform prescription data to drugDetails array
    const uniqueDrugDetails: DrugDetails[] = prescription.prescriptionforPatient
      .filter((drug: any) => drug.isselected) // Only include selected prescriptions
      .map((drug: any) => {
        if (!seenRxNumbers.has(drug.id)) {
          seenRxNumbers.add(drug.id);

          // If this is the first `fromPharmacy`, we map it
          if (!fromPharmacy && drug.storeDetails) {
            fromPharmacy = this.mapPharmacyDetails(drug.storeDetails);
          }

          return {
            drugName: drug.drugInfo.drug.name,
            encPrescriptionLookupKey: drug.prescriptionLookupKey,
            prescriptionLookupKey: this.mapPrescriptionLookupKey(drug),
            provider: this.mapProviderDetails(drug.prescriber),
            recentFillDate: drug.lastRefillDate,
            quantity: drug.quantity,
            daySupply: drug.daysSupply
          };
        }
        return null; // Filter out duplicates or non-selected
      })
      .filter((drugDetail): drugDetail is DrugDetails => drugDetail !== null); // Remove nulls

    if (uniqueDrugDetails.length === 0 || !fromPharmacy) {
      return null; // Return null if no selected drug details or no fromPharmacy
    }

    const toPharmacy: Pharmacy = this.mapPharmacyDetails(this.selectedPharmacy);

    return {
      drugDetails: uniqueDrugDetails,
      fromPharmacy,
      toPharmacy
    };
  }

  // Method to map patient details
  private mapPatientDetails(prescription: any): Patient {
    return {
      firstName: prescription.firstName,
      lastName: prescription.lastName,
      gender: prescription.gender,
      dateOfBirth: prescription.dateOfBirth,
      memberId: prescription.id?.toString() || '', // Always return a value
      patientId: prescription.id?.toString() || '', // Always return a value
      patientIdType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      profileId: null,
      email: prescription.emailAddresses?.[0]?.value || '', // Default to an empty string
      address: this.mapAddressDetails(prescription.address || {}) // Pass an empty object if no address is present
    };
  }

  // Method to map prescription lookup key
  private mapPrescriptionLookupKey(drug: any): PrescriptionLookupKey {
    return {
      id: drug.id || '', // Ensure we always return a string, even if undefined
      idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      rxNumber: drug.prescriptionLookupKey || '' // Default to an empty string
    };
  }

  // Method to map provider details
  private mapProviderDetails(prescriber: any): Provider {
    return {
      npi: prescriber.npi || '', // Default to an empty string if undefined
      firstName: prescriber.firstName || '', // Always return a string
      lastName: prescriber.lastName || '', // Always return a string
      phoneNumber: prescriber.phone || '', // Default to an empty string
      faxNumber: prescriber.fax || '', // Default to an empty string
      address: this.mapAddressDetails(prescriber.address || {}) // Pass an empty object if no address is present
    };
  }

  // Method to map pharmacy details
  private mapPharmacyDetails(pharmacy: any): Pharmacy {
    return {
      pharmacyName: pharmacy.pharmacyName || '', // Always return a string
      address: this.mapAddressDetails(pharmacy.address || {}), // Pass an empty object if no address is present
      storeId: pharmacy.storeId || '' // Default to an empty string
    };
  }

  // Method to map address details
  private mapAddressDetails(address: any): Address {
    return {
      line: address.line || [''], // Default to an empty array
      city: address.city || '', // Always return a string
      state: address.state || '', // Always return a string
      postalCode: address.postalCode || '', // Always return a string
      phoneNumber: address.phoneNumber || '' // Default to an empty string
    };
  }
}

store.ts 

import { Injectable, inject } from '@angular/core';
import { CurrentPrescriptionsFacade, IPrescriptionDetails } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/current-prescriptions';
import { PrescriptionsListFacade, SubmitTransferResponse } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

import { Observable } from 'rxjs';
@Injectable()
export class SubmitTransferStore {
  protected readonly submitTransferFacade = inject(PrescriptionsListFacade);
  protected readonly currentPrescriptionsFacade = inject(
    CurrentPrescriptionsFacade
  );
  public readonly currentPrescriptions$: Observable<
    IPrescriptionDetails[] | undefined
  > = this.currentPrescriptionsFacade.currentPrescriptions$;
  public readonly loading$: Observable<boolean> =
    this.submitTransferFacade.loading$;
    public readonly error$: Observable<unknown> =
    this.submitTransferFacade.error$;
    
    public submitTransfer(req: any): SubmitTransferResponse {
      this.submitTransferFacade.submitTransfer(req);
    }
}


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


  public submitTransfer(request : TransferOrderRequest): SubmitTransferResponse {
    this.store.dispatch(PrescriptionsListActions.submitTransfer({request}));
  }

  //delete selected prescriptions
  public deleteSelectedPrescriptions(deletedPrescriptions: string[]): void {
    this.store.dispatch(
      PrescriptionsListActions.deletePrescriptions({ deletedPrescriptions })
    );
  }
}

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

service.ts

import { inject, Injectable } from '@angular/core';
import {
  ExperienceService,
  mapResponseBody
} from '@digital-blocks/angular/core/util/services';

import { Config } from './prescriptions-list.service.config';
import { SubmitTransferResponse, TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionsListService {
  private readonly experienceService = inject(ExperienceService);
  submitTransfer(request: TransferOrderRequest): Observable<SubmitTransferResponse>  {
    return this.experienceService
      .post<SubmitTransferResponse>(
        Config.clientId,
        Config.experiences,
        Config.mock,
        {
          data: request.data
        },
        {
          maxRequestTime: 10_000
        }
      ).pipe(
        mapResponseBody(),
        map((response: any) => {
          return response;
        })
      );
  }
}

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


interface.ts 


export interface TransferOrderRequest {
    data: TransferData;
  }
  
  export interface TransferData {
    id?: string;
    idType: string;
    profile: any | null;
    externalTransfer: ExternalTransfer[];
  }
  
  export interface ExternalTransfer {
    requestedChannel: string;
    carrierId: string;
    clinicalRuleDate: string;
    patient: Patient;
    rxDetails: RxDetails[];
  }
  
  export interface Patient {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    memberId: string;
    patientId: string;
    patientIdType: string;
    profileId: any | null;
    email: string;
    address: Address;
  }
  
  export interface Address {
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    phoneNumber: string;
  }
  
  export interface RxDetails {
    drugDetails: DrugDetails[];
    fromPharmacy: Pharmacy;
    toPharmacy: Pharmacy;
  }
  
  export interface DrugDetails {
    drugName: string;
    encPrescriptionLookupKey: string;
    prescriptionLookupKey: PrescriptionLookupKey;
    provider: Provider;
    recentFillDate: string;
    quantity: number;
    daySupply: number;
  }
  
  export interface PrescriptionLookupKey {
    id: number;
    idType: string;
    rxNumber: string;
  }
  
  export interface Provider {
    npi: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    faxNumber: string;
    address: Address;
  }
  
  export interface Pharmacy {
    pharmacyName: string;
    address: Address;
    storeId?: string;
  }
  
  
  
  export interface SubmitTransferResponse {
    statusCode: string;
    statusDescription: string;
    data: SubmitExternalTransferRes[];
  }
  
  export interface SubmitExternalTransferRes {
    statusCode: string;
    statusDescription: string;
    confirmationNumber: string;
  }
