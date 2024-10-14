/* eslint-disable @typescript-eslint/no-explicit-any -- fix later*/
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit
} from '@angular/core';
import { NavigationService } from '@digital-blocks/angular/core/util/services';
import { TransferPrescriptionsSubHeaderComponent } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/components';
import { IPrescriptionDetails } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/current-prescriptions';
import {
  TransferOrderRequest,
  ExternalTransfer,
  Patient,
  RxDetails,
  Address,
  DrugDetails,
  PrescriptionLookupKey,
  Provider,
  Pharmacy
} from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';
import { errorMessage } from '@digital-blocks/core/util/error-handler';
import { of, switchMap } from 'rxjs';

import { SubmitTransferStore } from './submit-transfer.store';

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
export class SubmitTransferComponent implements OnInit {
  @Input() public staticContent = {
    continueBtnText: 'Continue'
  };
  protected readonly navigationService = inject(NavigationService);
  public currentPrescriptions: IPrescriptionDetails[] | undefined;
  public errorMessage: string | null = null;
  selectedPharmacy: Pharmacy | undefined;
  protected readonly store = inject(SubmitTransferStore);

  constructor() {
    //
  }

  ngOnInit(): void {
    this.store.selectPharmacy$.subscribe((data) => {
      this.selectedPharmacy = data;
    });
    this.store.setStateFailure(false);
  }

  public submitTransfer(): void {
    try {
      this.store.currentPrescriptions$
        .pipe(
          switchMap((data: IPrescriptionDetails[] | undefined) => {
            this.currentPrescriptions = data || [];
            if (this.currentPrescriptions.length > 0 && this.selectedPharmacy) {
              const transferOrderRequest = this.buildTransferOrderRequest(
                this.currentPrescriptions
              );

              this.store.submitTransfer(transferOrderRequest);
              this.store.submitTransferResponse$.subscribe((response) => {
                if (response) {
                  if (response.statusCode === '0000') {
                    this.handleSuccess();
                  } else {
                    this.handleError(response);
                  }
                }
              });

              return of(null);
            } else {
              this.store.setStateFailure(true);
              throw new Error('No prescriptions selected for transfer');
            }
          })
        )
        .subscribe();
    } catch (error) {
      this.store.setStateFailure(true);
      errorMessage('submitTransferFailure', error);
      throw error;
    }
  }

  public buildTransferOrderRequest(
    currentPrescriptions: IPrescriptionDetails[]
  ): TransferOrderRequest {
    try {
      const externalTransfer: ExternalTransfer[] =
        currentPrescriptions.length > 0
          ? currentPrescriptions
              .map((member) => {
                const rxDetails: RxDetails | null = this.mapRxDetails(member);

                if (rxDetails && rxDetails.drugDetails.length > 0) {
                  const patient: Patient = this.mapPatientDetails(member);

                  return {
                    requestedChannel: '',
                    carrierId: member.carrierID,
                    clinicalRuleDate: this.getCurrentDate(),
                    patient,
                    rxDetails: [rxDetails]
                  };
                }

                return null;
              })
              .filter(
                (transfer): transfer is ExternalTransfer => transfer !== null
              )
          : [];

      if (externalTransfer.length === 0) {
        throw new Error('No valid Transfer data available');
      }

      return {
        data: {
          idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
          profile: '',
          externalTransfer
        }
      };
    } catch (error) {
      this.store.setStateFailure(true);
      errorMessage('Error building transfer order request', error);
      throw error;
    }
  }

  public handleError(error: any): void {
    this.errorMessage =
      error.statusDescription ||
      error.message ||
      'An unexpected error occurred';
  }

  public handleSuccess(): void {
    if (sessionStorage.getItem('xid')) {
      this.navigationService.navigate(
        '/pharmacy/-/transfer/guest/order-confirmation',
        { queryParamsHandling: 'preserve' },
        {
          navigateByPath: true
        }
      );
    } else {
      this.navigationService.navigate(
        '/pharmacy/-/transfer/order-confirmation',
        { queryParamsHandling: 'preserve' },
        {
          navigateByPath: true
        }
      );
    }
  }

  public mapRxDetails(member: any): RxDetails | null {
    try {
      const seenRxNumbers = new Set<string>();
      let fromPharmacy: Pharmacy | null = null;

      const uniqueDrugDetails: DrugDetails[] = member.prescriptionforPatient
        .filter((drug: any) => drug.isSelected)
        .map((drug: any) => {
          if (!seenRxNumbers.has(drug.id)) {
            seenRxNumbers.add(drug.id);
            if (!fromPharmacy && drug.pharmacyDetails) {
              fromPharmacy = drug.pharmacyDetails
                ? this.mapPharmacyDetails(drug.pharmacyDetails)
                : null;
            }

            return {
              drugName: drug.drugInfo.drug.name || '',
              encPrescriptionLookupKey: drug.prescriptionLookupKey || '',
              prescriptionLookupKey: this.mapPrescriptionLookupKey(
                member,
                drug
              ),
              provider: drug.prescriber
                ? this.mapProviderDetails(drug.prescriber)
                : null,
              recentFillDate: drug.lastRefillDate
                ? this.formatDate(drug.lastRefillDate)
                : '',
              daySupply: drug.daysSupply || 0,
              quantity: drug.quantity || 0
            };
          }

          return null;
        })
        .filter(
          (drugDetail: any): drugDetail is DrugDetails => drugDetail !== null
        );
      const toPharmacy: Pharmacy = this.mapPharmacyDetails(
        this.selectedPharmacy
      );

      if (uniqueDrugDetails.length === 0 || !fromPharmacy || !toPharmacy) {
        return null;
      }

      return {
        drugDetails: uniqueDrugDetails,
        fromPharmacy,
        toPharmacy
      };
    } catch (error: unknown) {
      this.store.setStateFailure(true);
      errorMessage('Error in processing RxDetails', error);
      throw error;
    }
  }

  public mapPatientDetails(member: any): Patient {
    if (!member) throw new Error('Member Details Missing');
    let gender: string;

    switch (member.gender) {
      case '1': {
        gender = 'M';
        break;
      }
      case '2': {
        gender = 'F';
        break;
      }
      default: {
        gender = '';
        break;
      }
    }

    return {
      firstName: member.firstName,
      lastName: member.lastName,
      gender,
      dateOfBirth: member.dateOfBirth,
      memberId: member.id?.toString() || '',
      patientId: member.id?.toString() || '',
      patientIdType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      profileId: '',
      email: member.emailAddresses?.[0]?.value || '',

      address: this.mapAddressDetails(member.addresses || {}, true)
    };
  }

  public mapPrescriptionLookupKey(
    member: any,
    drug: any
  ): PrescriptionLookupKey {
    if (!member || !drug) throw new Error('Member and Drug Details Missing');

    return {
      id: member.id ? Number(member.id) : 0,
      idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      rxNumber: drug.id || ''
    };
  }

  public mapProviderDetails(prescriber: any): Provider {
    if (!prescriber) throw new Error('Missing Prescriber Details');

    const mappedProvider: any = {
      npi: prescriber.id || '',
      firstName: prescriber.firstName || '',
      lastName: prescriber.lastName || '',
      phoneNumber: prescriber.phone || '',
      address: this.mapAddressDetails(prescriber.address || {}, false)
    }

    if (prescriber.fax && prescriber.fax.trim() !== '') {
       mappedProvider.faxNumber = prescriber.fax;
    }

    return mappedProvider;
  }

  public mapPharmacyDetails(pharmacy: any): Pharmacy {
    if (!pharmacy) {
      throw new Error('Missing pharmacy details.');
    }

    const pharmacyName = pharmacy.pharmacyName ?? '';
    let address: Address | undefined;
    const storeId = /cvs|hyvee/i.test(pharmacyName)
      ? pharmacy.storeId || ''
      : '99999';

    if (pharmacy.addresses) {
      address = {
        ...this.mapAddressDetails(pharmacy.addresses),
        ...(pharmacy.phoneNumber && pharmacy.phoneNumber.trim() !== ''
          ? { phoneNumber: pharmacy.phoneNumber }
          : {})
      };
    } else if (pharmacy.address) {
      address = this.mapAddressDetails(pharmacy.address, true);
    }
    const cvsSpecificFields = this.cvsSpecificFields(pharmacy);

    return {
      pharmacyName,
      address,
      storeId,
      ...cvsSpecificFields
    };
  }

  private cvsSpecificFields(pharmacy: any) {
    const pharmacyName = pharmacy.pharmacyName ?? '';
    const containsCVS = pharmacyName.toLowerCase().includes('cvs');

    return containsCVS
      ? {
          indicatorPharmacyTwentyFourHoursOpen: pharmacy.open24hours
            ? 'Y'
            : 'N',
          instorePickupService: pharmacy.instorePickupService ? 'Y' : 'N',
          indicatorDriveThruService: pharmacy.driveThru ? 'Y' : 'N',
          pharmacyHours: {
            dayHours: pharmacy.open24Hours
              ? []
              : pharmacy.pharmacyHours?.dayHours || []
          }
        }
      : null;
  }

  public mapAddressDetails(address: Address, includePhoneNumber: boolean = true): Address {
    const mappedAddress: any = {
      line: address.line || [''],
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || ''
    };
  
    if (includePhoneNumber && address.phoneNumber) {
      mappedAddress.phoneNumber = address.phoneNumber;
    }
  
    return mappedAddress;
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
