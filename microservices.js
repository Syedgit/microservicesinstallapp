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
import { Store } from '@ngrx/store';
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

  constructor(private ngrxStore: Store) {}

  // Method to handle the submission of the transfer order
  public submitTransfer(): void {
    // Selecting 'currentPrescriptions' from the store
    this.ngrxStore.select('currentPrescriptions').pipe(
      // Using switchMap to handle the currentPrescriptions and continue the observable chain
      switchMap((data: IPrescriptionDetails[]) => {
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
