import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input
} from '@angular/core';
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
  Provider,
  IDrugDetails,
  IPatientDrugDetails
} from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';
import { IPrescriber, IPrescriptionDetails, IPrescriptionforPatient } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/current-prescriptions';
import { of, switchMap } from 'rxjs';
import { NavigationService } from '@digital-blocks/angular/core/util/services';

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
  protected readonly navigationService = inject(NavigationService);
  public currentPrescriptions: IPrescriptionDetails[] | undefined;
  public errorMessage: string | null = null;
  private selectedPharmacy = {
    pharmacyName: 'ALLIANCERX WALGREENS PRIME 16280',
    storeId: '99999',
    address: {
      line: ['GREY 1 CVS DRIVE'],
      city: 'WOONSOCKET',
      state: 'RI',
      postalCode: '02895',
      phoneNumber: '8005414959'
    }
  };
  protected readonly store = inject(SubmitTransferStore);

  public submitTransfer(): void {
    this.store.currentPrescriptions$
      .pipe(
        switchMap((data: IPrescriptionDetails[] | undefined) => {
          this.currentPrescriptions = data || [];

          if (this.currentPrescriptions.length > 0) {
            const transferOrderRequest = this.buildTransferOrderRequest(
              this.currentPrescriptions
            );
            this.store.submitTransfer(transferOrderRequest);

            this.store.submitTransferResponse$.subscribe((response) => {
              if (response) {
                if (response.statusCode === '0000') {
                  this.navigationService.navigate(
                  '/pharmacy/-/transfer/order-confirmation',
                  { queryParamsHandling: 'preserve' },
                  {
                    navigateByPath: true
                  }
                );
                } else {
                  this.handleError(response);
                }
              }
            });

            return of(null);
          } else {
            this.errorMessage = 'No prescriptions selected for transfer.';
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public buildTransferOrderRequest(
    currentPrescriptions: IPrescriptionDetails[]
  ): TransferOrderRequest {
    const externalTransfer: ExternalTransfer[] = currentPrescriptions?.length
      ? currentPrescriptions
          .map((prescription) => {
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
            return null;
          })
          .filter((transfer): transfer is ExternalTransfer => transfer !== null)
      : [];

    return {
      data: {
        idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
        profile: null,
        externalTransfer
      }
    };
  }

  public handleError(error: any): void {
    this.errorMessage = error.statusDescription;
  }

  public mapRxDetails(member: IPrescriptionDetails): RxDetails | null {
    const seenRxNumbers = new Set<string>();
    let fromPharmacy: Pharmacy | null = null;

    const uniqueDrugDetails: DrugDetails[] = member.prescriptionforPatient
      .filter((drug: IPrescriptionforPatient) => drug.isSelected)
      .map((drug: IPatientDrugDetails) => {
        if (!seenRxNumbers.has(drug.id)) {
          seenRxNumbers.add(drug.id);
          if (!fromPharmacy && drug.storeDetails) {
            fromPharmacy = this.mapPharmacyDetails(drug.storeDetails);
          }
          return {
            drugName: drug.drugInfo?.drug.name || '',
            encPrescriptionLookupKey: drug.prescriptionLookupKey || '',
            prescriptionLookupKey: this.mapPrescriptionLookupKey(member, drug),
            provider: drug.prescriber
              ? this.mapProviderDetails(drug.prescriber)
              : null,
            recentFillDate: drug.lastRefillDate || '',
            daySupply: drug.daysSupply || 0
          };
        }
        return null;
      })
      .filter(
        (drugDetail: any): drugDetail is DrugDetails => drugDetail !== null
      );
      if(!fromPharmacy) {
        fromPharmacy = {
          pharmacyName: 'ALLIANCERX WALGREENS PRIME 16280',
          address: {
            line: ['GREY 1 CVS DRIVE'],
            city: 'WOONSOCKET',
            state: 'RI',
            postalCode: '02895',
            phoneNumber: '8005414959'
          }
        };
      }
      
    if (uniqueDrugDetails.length === 0 || !fromPharmacy) {
      return null;
    }

    const toPharmacy: Pharmacy = this.mapPharmacyDetails(this.selectedPharmacy);

    return {
      drugDetails: uniqueDrugDetails,
      fromPharmacy,
      toPharmacy
    };
  }

  public mapPatientDetails(member: any): Patient {
    return {
      firstName: member.firstName,
      lastName: member.lastName,
      gender: member.gender,
      dateOfBirth: member.dateOfBirth,
        /* eslint-disable @typescript-eslint/no-explicit-any -- need to */
      memberId: member.id?.toString(),
      patientId: member.id?.toString(),
      patientIdType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      profileId: "",
      email: member.emailAddresses?.[0]?.value || '',
      address: this.mapAddressDetails(member.address)
    };
  }

  public mapPrescriptionLookupKey(
    member: IPrescriptionDetails,
    drug: PrescriptionLookupKey
  ): PrescriptionLookupKey {
    return {
      id: member.id,
      idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      rxNumber: drug.id || ''
    };
  }

  public mapProviderDetails(prescriber: IPrescriber): Provider {
    return {
      npi: prescriber.npi || '',
      firstName: prescriber.firstName || '',
      lastName: prescriber.lastName || '',
      phoneNumber: prescriber.phoneNumber || '',
      faxNumber: prescriber.faxNumber || '',
      address: this.mapAddressDetails(prescriber.address || {})
    };
  }

  public mapPharmacyDetails(pharmacy: Pharmacy): Pharmacy {
    return {
      pharmacyName: pharmacy.pharmacyName || '',
      address: this.mapAddressDetails(pharmacy.address || {}),
      storeId: pharmacy.storeId || ''
    };
  }

  public mapAddressDetails(address: Address): Address {
    return {
      line: address.line || [''],
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      phoneNumber: address.phoneNumber || ''
    };
  }
}


interface.ts

import { IDrugDetails, IPrescriber } from "../../../current-prescriptions/src/lib/current-prescriptions.types";

export interface TransferOrderRequest {
  data: TransferData;
}

export interface TransferData {
  id?: string;
  idType: string;
  profile: string | null;
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
  profileId: string | null;
  email: string;
  address: Address;
}

export interface Address {
  line: string[];
  city: string;
  state: string;
  postalCode: string;
  phoneNumber?: string;
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
  provider: Provider | null;
  recentFillDate: string;
  quantity: number;
  daySupply: number;
}

export interface PrescriptionLookupKey {
  id: string;
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
  data: SubmitExternalTransferPartial;
}

export interface SubmitExternalTransferPartial {
  submitExternalTransfer: SubmitExternalTransferResource[];
}

export interface SubmitExternalTransferResource {
  statusCode: string;
  statusDescription: string;
  confirmationNumber: string;
}

export interface IPatientDrugDetails {
  isSelected?: boolean;
  id: string;
  drugInfo?: IDrugDetails;
  prescriber?: IPrescriber;
  prescriptionLookupKey: string;
  lastRefillDate: string;
  daysSupply: number;
  storeDetails: Pharmacy;
}
