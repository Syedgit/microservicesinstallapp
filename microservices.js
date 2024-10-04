formatDate

  private formatDate(dateStr?: string): string {
    const date = dateStr ? new Date(dateStr) : new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }


componennt.ts


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
                    { navigateByPath: true }
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
      .subscribe({
        error: (err) => this.handleError(err)
      });
  }

  public buildTransferOrderRequest(
    currentPrescriptions: IPrescriptionDetails[]
  ): TransferOrderRequest {
    try {
      const externalTransfer: ExternalTransfer[] = currentPrescriptions?.length
        ? currentPrescriptions
            .map((prescription) => {
              const rxDetails: RxDetails | null = this.mapRxDetails(prescription);
              if (rxDetails && rxDetails.drugDetails.length > 0) {
                const patient: Patient = this.mapPatientDetails(prescription);
                return {
                  requestedChannel: '',
                  carrierId: '',
                  clinicalRuleDate: this.formatDate(),
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
    } catch (error: any) {
      this.errorMessage = error.message;
      return {
        data: {
          idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
          profile: null,
          externalTransfer: []
        }
      };
    }
  }

  public handleError(error: any): void {
    this.errorMessage = error.statusDescription || error.message || 'An unexpected error occurred';
  }

  public mapRxDetails(member: IPrescriptionDetails): RxDetails | null {
    try {
      const seenRxNumbers = new Set<string>();
      let fromPharmacy: Pharmacy | null = null;

      const uniqueDrugDetails: DrugDetails[] = member.prescriptionforPatient
        ?.filter((drug: IPrescriptionforPatient) => drug.isSelected)
        .map((drug: IPatientDrugDetails) => {
          if (!seenRxNumbers.has(drug.id)) {
            seenRxNumbers.add(drug.id);

            if (drug.storeDetails && !fromPharmacy) {
              fromPharmacy = this.mapPharmacyDetails(drug.storeDetails);
            }

            return {
              drugName: drug.drugInfo?.drug?.name || '',
              encPrescriptionLookupKey: drug.prescriptionLookupKey || '',
              prescriptionLookupKey: this.mapPrescriptionLookupKey(member, drug),
              provider: drug.prescriber
                ? this.mapProviderDetails(drug.prescriber)
                : null,
              recentFillDate: this.formatDate(drug.lastRefillDate),
              daySupply: drug.daysSupply || 0
            };
          }
          return null;
        })
        .filter(
          (drugDetail: DrugDetails | null): drugDetail is DrugDetails => drugDetail !== null
        );

      if (!fromPharmacy) {
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
    } catch (error: any) {
      this.errorMessage = error.message;
      return null;
    }
  }

  public mapPatientDetails(member: any): Patient {
    try {
      if (!member) {
        throw new Error('Invalid member data');
      }

      const patient: Patient = {};

      if (member.firstName) patient.firstName = member.firstName;
      if (member.lastName) patient.lastName = member.lastName;
      if (member.gender) patient.gender = member.gender;
      if (member.dateOfBirth) patient.dateOfBirth = member.dateOfBirth;
      if (member.id) {
        patient.memberId = member.id.toString();
        patient.patientId = member.id.toString();
      }
      patient.patientIdType = 'PBM_QL_PARTICIPANT_ID_TYPE';
      patient.profileId = '';
      patient.email = member.emailAddresses?.[0]?.value || '';
      patient.address = member.address
        ? this.mapAddressDetails(member.address)
        : { line: [''] };

      return patient;
    } catch (error: any) {
      this.errorMessage = error.message;
      return {} as Patient; // Return an empty patient object on error
    }
  }

  public mapPrescriptionLookupKey(
    member: IPrescriptionDetails,
    drug: PrescriptionLookupKey
  ): PrescriptionLookupKey {
    try {
      const prescriptionLookupKey: PrescriptionLookupKey = {};

      prescriptionLookupKey.id = member?.id || '';
      prescriptionLookupKey.idType = 'PBM_QL_PARTICIPANT_ID_TYPE';
      prescriptionLookupKey.rxNumber = drug?.id || '';

      return prescriptionLookupKey;
    } catch (error: any) {
      this.errorMessage = error.message;
      return {} as PrescriptionLookupKey;
    }
  }

  public mapProviderDetails(prescriber: IPrescriber): Provider {
    try {
      if (!prescriber) {
        throw new Error('Invalid prescriber data');
      }

      const provider: Provider = {};

      provider.npi = prescriber.npi || '';
      provider.firstName = prescriber.firstName || '';
      provider.lastName = prescriber.lastName || '';
      provider.phoneNumber = prescriber.phoneNumber || '';
      provider.faxNumber = prescriber.faxNumber || '';
      provider.address = this.mapAddressDetails(prescriber.address || {});

      return provider;
    } catch (error: any) {
      this.errorMessage = error.message;
      return {} as Provider;
    }
  }

  public mapPharmacyDetails(pharmacy: Pharmacy): Pharmacy {
    try {
      const pharmacyDetails: Pharmacy = {};

      if (pharmacy.pharmacyName) pharmacyDetails.pharmacyName = pharmacy.pharmacyName;
      if (pharmacy.address) pharmacyDetails.address = this.mapAddressDetails(pharmacy.address);
      if (pharmacy.storeId) pharmacyDetails.storeId = pharmacy.storeId;

      return pharmacyDetails;
    } catch (error: any) {
      this.errorMessage = error.message;
      return {} as Pharmacy;
    }
  }

  public mapAddressDetails(address: Address): Address {
    try {
      const mappedAddress: Address = {};

      if (address.line) mappedAddress.line = address.line;
      if (address.city) mappedAddress.city = address.city;
      if (address.state) mappedAddress.state = address.state;
      if (address.postalCode) mappedAddress.postalCode = address.postalCode;
      if (address.phoneNumber) mappedAddress.phoneNumber = address.phoneNumber;

      return mappedAddress;
    } catch (error: any) {
      this.errorMessage = error.message;
      return {} as Address;
    }
  }

  // Utility method to format date
  public formatDate(dateStr?: string): string {
    try {
      const date = dateStr ? new Date(dateStr) : new Date();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = String(date.getFullYear());

      return `${month}/${day}/${year}`;
    } catch (error: any) {
      this.errorMessage = 'Invalid date format';
      return '';
    }
  }
}

