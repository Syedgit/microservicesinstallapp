import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input
} from '@angular/core';
import { TransferPrescriptionsSubHeaderComponent } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/components';
import { PrescriptionsListFacade } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';
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
} from './submit-transfer.interfaces';

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
  protected readonly prescriptionsListFacade = inject(PrescriptionsListFacade);

  private currentPrescriptions: any[] = []; // Assuming currentPrescriptions is an array of prescription objects
  private selectedPharmacy: any; // Assuming selectedPharmacy is an object with necessary pharmacy details

  public submitTransfer(): void {
    const transferOrderRequest = this.buildTransferOrderRequest();
    this.prescriptionsListFacade.submitTransfer(transferOrderRequest);
  }

  private buildTransferOrderRequest(): TransferOrderRequest {
    const externalTransfer: ExternalTransfer[] = this.currentPrescriptions.map(prescription => {
      const rxDetails: RxDetails = this.mapRxDetails(prescription);
      const patient: Patient = this.mapPatientDetails(prescription);
      return {
        requestedChannel: '',
        carrierId: '',
        clinicalRuleDate: this.getClinicalRuleDate(), // Assuming this is coming from some method or constant
        patient,
        rxDetails: [rxDetails]
      };
    });

    return {
      data: {
        id: this.getPatientId(), // Assuming patient ID is fetched from somewhere
        idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
        profile: null,
        externalTransfer
      }
    };
  }

  private mapRxDetails(prescription: any): RxDetails {
    const uniqueDrugDetails: DrugDetails[] = [];
    const seenRxNumbers = new Set<string>();

    prescription.drugDetails.forEach((drug: any) => {
      if (!seenRxNumbers.has(drug.prescriptionLookupKey.rxNumber)) {
        seenRxNumbers.add(drug.prescriptionLookupKey.rxNumber);

        uniqueDrugDetails.push({
          drugName: drug.drugName,
          encPrescriptionLookupKey: drug.encPrescriptionLookupKey,
          prescriptionLookupKey: this.mapPrescriptionLookupKey(drug.prescriptionLookupKey),
          provider: this.mapProviderDetails(drug.provider),
          recentFillDate: drug.recentFillDate,
          quantity: drug.quantity,
          daySupply: drug.daySupply
        });
      }
    });

    const fromPharmacy: Pharmacy = this.mapPharmacyDetails(prescription.fromPharmacy);
    const toPharmacy: Pharmacy = this.mapPharmacyDetails(this.selectedPharmacy);

    return {
      drugDetails: uniqueDrugDetails,
      fromPharmacy,
      toPharmacy
    };
  }

  private mapPatientDetails(prescription: any): Patient {
    return {
      firstName: prescription.patient.firstName,
      lastName: prescription.patient.lastName,
      gender: prescription.patient.gender,
      dateOfBirth: prescription.patient.dateOfBirth,
      memberId: prescription.patient.memberId,
      patientId: prescription.patient.patientId,
      patientIdType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      profileId: null,
      email: prescription.patient.email,
      address: this.mapAddressDetails(prescription.patient.address)
    };
  }

  private mapPrescriptionLookupKey(prescriptionLookupKey: any): PrescriptionLookupKey {
    return {
      id: prescriptionLookupKey.id,
      idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      rxNumber: prescriptionLookupKey.rxNumber
    };
  }

  private mapProviderDetails(provider: any): Provider {
    return {
      npi: provider.npi,
      firstName: provider.firstName,
      lastName: provider.lastName,
      phoneNumber: provider.phoneNumber,
      faxNumber: provider.faxNumber,
      address: this.mapAddressDetails(provider.address)
    };
  }

  private mapPharmacyDetails(pharmacy: any): Pharmacy {
    return {
      pharmacyName: pharmacy.pharmacyName,
      address: this.mapAddressDetails(pharmacy.address),
      storeId: pharmacy.storeId || '' // Optional, only for toPharmacy
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

  private getPatientId(): string {
    // Logic to fetch the patient ID
    return '737961639';
  }

  private getClinicalRuleDate(): string {
    // Logic to fetch or calculate clinical rule date
    return '09/16/2024';
  }
}


interface


export interface TransferOrderRequest {
  data: TransferData;
}

export interface TransferData {
  id: string;
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
  storeId?: string; // Optional, only present in toPharmacy
}
