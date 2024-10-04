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
  Provider
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
    try {
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
    } catch (error) {
      this.errorMessage = 'An unexpected error occurred during submission.';
    }
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
                clinicalRuleDate: this.getCurrentDate(),
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
    this.errorMessage = error?.statusDescription || 'Error occurred during transfer.';
  }

  public mapRxDetails(member: IPrescriptionDetails): RxDetails | null {
    const seenRxNumbers = new Set<string>();
    let fromPharmacy: Pharmacy | null = null;

    const uniqueDrugDetails: DrugDetails[] = member.prescriptionforPatient
      .filter((drug: IPrescriptionforPatient) => drug.isSelected)
      .map((drug: any) => {
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
            recentFillDate: this.formatDate(drug.lastRefillDate) || '',
            daySupply: drug.daysSupply || 0
          };
        }
        return null;
      })
      .filter((drugDetail: DrugDetails | null): drugDetail is DrugDetails => !!drugDetail);

    if (!fromPharmacy) {
      fromPharmacy = this.mapPharmacyDetails(this.selectedPharmacy);
    }

    const toPharmacy: Pharmacy = this.mapPharmacyDetails(this.selectedPharmacy);

    return uniqueDrugDetails.length > 0 ? { drugDetails: uniqueDrugDetails, fromPharmacy, toPharmacy } : null;
  }

  public mapPatientDetails(member: IPrescriptionDetails): Patient {
    return {
      firstName: member?.firstName ?? '',
      lastName: member?.lastName ?? '',
      gender: member?.gender ?? '',
      dateOfBirth: member?.dateOfBirth ?? '',
      memberId: member?.id?.toString() ?? '',
      patientId: member?.id?.toString() ?? '',
      patientIdType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      profileId: null,
      email: member?.emailAddresses?.[0]?.value ?? '',
      address: this.mapAddressDetails(member?.address)
    };
  }

  public mapPharmacyDetails(pharmacy: Pharmacy): Pharmacy {
    return {
      pharmacyName: pharmacy?.pharmacyName ?? '',
      address: this.mapAddressDetails(pharmacy?.address),
      storeId: pharmacy?.storeId ?? ''
    };
  }

  public mapPrescriptionLookupKey(
    member: IPrescriptionDetails,
    drug: PrescriptionLookupKey
  ): PrescriptionLookupKey {
    return {
      id: member?.id ?? '',
      idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      rxNumber: drug?.id ?? ''
    };
  }

  public mapProviderDetails(prescriber: IPrescriber): Provider {
    return {
      npi: prescriber?.npi ?? '',
      firstName: prescriber?.firstName ?? '',
      lastName: prescriber?.lastName ?? '',
      phoneNumber: prescriber?.phoneNumber ?? '',
      faxNumber: prescriber?.faxNumber ?? '',
      address: this.mapAddressDetails(prescriber?.address)
    };
  }

  public mapAddressDetails(address: Address): Address {
    return {
      line: address?.line || [''],
      city: address?.city ?? '',
      state: address?.state ?? '',
      postalCode: address?.postalCode ?? '',
      phoneNumber: address?.phoneNumber ?? ''
    };
  }

  public getCurrentDate(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear());

    return `${month}/${day}/${year}`;
  }

  public formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
      return this.getCurrentDate();
    }
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${month}/${day}/${year}`;
  }
}
