/* eslint-disable @typescript-eslint/no-explicit-any -- fix later*/
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit
} from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
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
  public currentPrescriptions: IPrescriptionDetails[] = [];
  public errorMessage: string | null = null;
  public cardHolderEmailAdd = '';
  public cardHolderPhoneNum = '';
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
    this.listenCurrentPrescriptiondata();
  }

  public listenCurrentPrescriptiondata(): void {
    this.store.currentPrescriptions$.subscribe((data) => {
      this.currentPrescriptions = data || [];
    });
  }

  public submitTransfer(): void {
    try {
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
      } else {
        this.store.setStateFailure(true);
        throw new Error('No prescriptions selected for transfer');
      }
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
                if (
                  member.memberType === 'primary' &&
                  member.emailAddresses.length > 0
                ) {
                  this.cardHolderEmailAdd =
                    member.emailAddresses[0].value || '';
                }

                const rxDetailsArray: RxDetails[] =
                  member.prescriptionforPatient
                    .filter((drug: any) => drug.isSelected)
                    .map((drug) => this.mapRxDetails(member, drug))
                    .filter(
                      (rxDetail): rxDetail is RxDetails => rxDetail !== null
                    );

                if (rxDetailsArray.length > 0) {
                  const patient: Patient = this.mapPatientDetails(member);

                  return {
                    requestedChannel: 'WEB',
                    carrierId: member.carrierID,
                    clinicalRuleDate: this.getCurrentDate(),
                    patient,
                    rxDetails: rxDetailsArray
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
        '/pharmacy/benefits/transfer/guest/order-confirmation',
        { queryParamsHandling: 'preserve' },
        {
          navigateByPath: true
        }
      );
    } else {
      this.navigationService.navigate(
        '/pharmacy/benefits/transfer/order-confirmation',
        { queryParamsHandling: 'preserve' },
        {
          navigateByPath: true
        }
      );
    }
  }

  public mapRxDetails(member: any, drug: any): RxDetails | null {
    try {
      let fromPharmacy: Pharmacy | null = null;

      const drugDetails: DrugDetails[] = [
        {
          drugName: drug.drugInfo?.drug?.name || '',
          encPrescriptionLookupKey: drug.prescriptionLookupKey || '',
          prescriptionLookupKey: this.mapPrescriptionLookupKey(member, drug),
          provider: this.mapProviderDetails(drug.prescriber),
          recentFillDate: drug.lastRefillDate
            ? this.formatDate(drug.lastRefillDate)
            : '',
          daySupply: drug.daysSupply || 0,
          quantity: drug.quantity || 0
        }
      ];

      if (!fromPharmacy && drug.pharmacyDetails) {
        fromPharmacy = this.mapPharmacyDetails(drug.pharmacyDetails);
      }
      const toPharmacy: Pharmacy = this.mapPharmacyDetails(
        this.selectedPharmacy
      );

      if (drugDetails.length === 0 || !fromPharmacy || !toPharmacy) {
        return null;
      }

      return {
        drugDetails,
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

    if (
      member.phoneNumbers &&
      member.memberType === 'primary' &&
      member.phoneNumbers.length > 0
    ) {
      this.cardHolderPhoneNum = member.phoneNumbers[0].value || '';
    }

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

    const memberDetail: Patient = {
      firstName: member.firstName,
      lastName: member.lastName,
      gender,
      dateOfBirth: member.dateOfBirth,
      memberId: member.id?.toString() || '',
      patientId: member.id?.toString() || '',
      patientIdType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      profileId: '',
      email: this.cardHolderEmailAdd,
      address: this.mapAddressDetails(member.addresses || {}, true)
    };

    return memberDetail;
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
      address: this.mapAddressDetails(prescriber.address || {}, false)
    };

    if (prescriber.fax && prescriber.fax.trim() !== '') {
      mappedProvider.faxNumber = prescriber.fax.replaceAll('-', '');
    }

    if (prescriber.phone && prescriber.phone.trim() !== '') {
      mappedProvider.phoneNumber = prescriber.phone.replaceAll('-', '');
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
      address = this.mapAddressDetails(pharmacy.addresses, true);
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

  public mapAddressDetails(
    address: Address,
    includePhoneNumber = true
  ): Address {
    const mappedAddress: any = {
      line: address.line || [''],
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || ''
    };

    if (includePhoneNumber && address.phoneNumber) {
      mappedAddress.phoneNumber = address.phoneNumber.replaceAll('-', '');
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
    const [year, month, day] = dateString.split('-');

    if (!year || !month || !day) {
      return this.getCurrentDate();
    }

    return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  }
}
