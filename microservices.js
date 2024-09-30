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

  protected readonly store = inject(SubmitTransferStore);
  currentPrescriptions: IPrescriptionDetails[] | undefined;
  private selectedPharmacy: any;
  public errorMessage: string | null = null;

  public submitTransfer(): void {
    this.store.currentPrescriptions$.subscribe(
      (data) => {
        this.currentPrescriptions = data;
        const transferOrderRequest = this.buildTransferOrderRequest();

        if (transferOrderRequest.data.externalTransfer.length > 0) {
          try {
            this.store.submitTransfer(transferOrderRequest);
            this.handleSuccess(); // Handle success logic
          } catch (error) {
            this.handleError(error); // Handle error logic
          }
        } else {
          console.warn('No prescriptions selected for transfer.');
          this.errorMessage = 'No prescriptions selected for transfer.';
        }
      },
      (error) => {
        this.handleError(error);
      }
    );
  }

  private buildTransferOrderRequest(): TransferOrderRequest {
    const externalTransfer: ExternalTransfer[] = this.currentPrescriptions?.length
      ? this.currentPrescriptions
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

  private handleError(error: any): void {
    console.error('An error occurred:', error);
    this.errorMessage = 'An error occurred while submitting the transfer request. Please try again later.';
  }

  private handleSuccess(): void {
    console.log('Transfer submitted successfully');
    // Implement any success handling logic, like navigation or showing a success message
  }

  private mapRxDetails(prescription: any): RxDetails | null {
    const uniqueDrugDetails: DrugDetails[] = [];
    const seenRxNumbers = new Set<string>();
    let fromPharmacy: Pharmacy | null = null;

    prescription.prescriptionforPatient
      .filter((drug: any) => drug.isselected) // Only include selected prescriptions
      .forEach((drug: any) => {
        if (!seenRxNumbers.has(drug.id)) {
          seenRxNumbers.add(drug.id);

          uniqueDrugDetails.push({
            drugName: drug.drugInfo.drug.name,
            encPrescriptionLookupKey: drug.prescriptionLookupKey,
            prescriptionLookupKey: this.mapPrescriptionLookupKey(drug),
            provider: this.mapProviderDetails(drug.prescriber),
            recentFillDate: drug.lastRefillDate,
            quantity: drug.quantity,
            daySupply: drug.daysSupply
          });

          if (drug.storeDetails && !fromPharmacy) {
            fromPharmacy = this.mapPharmacyDetails(drug.storeDetails);
          }
        }
      });

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

  private mapPatientDetails(prescription: any): Patient {
    return {
      firstName: prescription.firstName,
      lastName: prescription.lastName,
      gender: prescription.gender,
      dateOfBirth: prescription.dateOfBirth,
      memberId: prescription.id.toString(),
      patientId: prescription.id.toString(),
      patientIdType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      profileId: null,
      email: prescription.emailAddresses?.[0]?.value || '',
      address: {
        line: [''],
        city: '',
        state: '',
        postalCode: '',
        phoneNumber: ''
      } // Assuming no detailed address info available in currentPrescriptions
    };
  }

  private mapPrescriptionLookupKey(drug: any): PrescriptionLookupKey {
    return {
      id: drug.id,
      idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      rxNumber: drug.prescriptionLookupKey
    };
  }

  private mapProviderDetails(prescriber: any): Provider {
    return {
      npi: prescriber.npi || '',
      firstName: prescriber.firstName,
      lastName: prescriber.lastName,
      phoneNumber: prescriber.phone,
      faxNumber: prescriber.fax,
      address: this.mapAddressDetails(prescriber.address)
    };
  }

  private mapPharmacyDetails(pharmacy: any): Pharmacy {
    return {
      pharmacyName: pharmacy.pharmacyName,
      address: this.mapAddressDetails(pharmacy.address),
      storeId: pharmacy.storeId || ''
    };
  }

  private mapAddressDetails(address: any): Address {
    return {
      line: address.line,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      phoneNumber: address.phoneNumber
    };
  }
}
