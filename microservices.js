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
import { catchError, of, switchMap } from 'rxjs';

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

  public currentPrescriptions: IPrescriptionDetails[] | undefined;
  public errorMessage: string | null = null;

  protected readonly store = inject(SubmitTransferStore);

  constructor() {}

  public submitTransfer(): void {
    this.store.currentPrescriptions$.pipe(
      switchMap((data: IPrescriptionDetails[] | undefined) => {
        this.currentPrescriptions = data || [];

        if (this.currentPrescriptions.length > 0) {
          const transferOrderRequest = this.buildTransferOrderRequest(this.currentPrescriptions);
          this.store.submitTransfer(transferOrderRequest);

          this.store.submitTransferResponse$.subscribe((response) => {
            if (response) {
              if (response.statusCode === '200') {
                this.handleSuccess();
              } else {
                this.handleError(response.statusDescription);
              }
            }
          });

          return of(null);
        } else {
          this.errorMessage = 'No prescriptions selected for transfer.';
          return of(null);
        }
      })
    ).subscribe();
  }

  private buildTransferOrderRequest(currentPrescriptions: IPrescriptionDetails[]): TransferOrderRequest {
    const externalTransfer: ExternalTransfer[] = currentPrescriptions?.length
      ? currentPrescriptions.map(prescription => {
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
        id: '737961639',
        idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
        profile: null,
        externalTransfer
      }
    };
  }

  private handleError(error: any): void {
    this.errorMessage = 'An error occurred while submitting the transfer request. Please try again later.';
  }

  private handleSuccess(): void {
    console.log('Transfer submitted successfully');
  }

  private mapRxDetails(prescription: any): RxDetails | null {
    const seenRxNumbers = new Set<string>();
    let fromPharmacy: Pharmacy | null = null;

    const uniqueDrugDetails: DrugDetails[] = prescription.prescriptionforPatient
      .filter((drug: any) => drug.isselected)
      .map((drug: any) => {
        if (!seenRxNumbers.has(drug.id)) {
          seenRxNumbers.add(drug.id);

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
        return null;
      })
      .filter((drugDetail): drugDetail is DrugDetails => drugDetail !== null);

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

  private mapPatientDetails(prescription: any): Patient {
    return {
      firstName: prescription.firstName,
      lastName: prescription.lastName,
      gender: prescription.gender,
      dateOfBirth: prescription.dateOfBirth,
      memberId: prescription.id?.toString() || '',
      patientId: prescription.id?.toString() || '',
      patientIdType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      profileId: null,
      email: prescription.emailAddresses?.[0]?.value || '',
      address: this.mapAddressDetails(prescription.address || {})
    };
  }

  private mapPrescriptionLookupKey(drug: any): PrescriptionLookupKey {
    return {
      id: drug.id || '',
      idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      rxNumber: drug.prescriptionLookupKey || ''
    };
  }

  private mapProviderDetails(prescriber: any): Provider {
    return {
      npi: prescriber.npi || '',
      firstName: prescriber.firstName || '',
      lastName: prescriber.lastName || '',
      phoneNumber: prescriber.phone || '',
      faxNumber: prescriber.fax || '',
      address: this.mapAddressDetails(prescriber.address || {})
    };
  }

  private mapPharmacyDetails(pharmacy: any): Pharmacy {
    return {
      pharmacyName: pharmacy.pharmacyName || '',
      address: this.mapAddressDetails(pharmacy.address || {}),
      storeId: pharmacy.storeId || ''
    };
  }

  private mapAddressDetails(address: any): Address {
    return {
      line: address.line || [''],
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      phoneNumber: address.phoneNumber || ''
    };
  }
}
