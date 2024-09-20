{
    "data": {
        "id": "737961639",
        "idType": "PBM_QL_PARTICIPANT_ID_TYPE",
        "profile": null,
        "externalTransfer": [
            {
                "requestedChannel": "",
                "carrierId": "",
                "clinicalRuleDate": "09/16/2024",
                "patient": {
                    "firstName": "John",
                    "lastName": "Miller",
                    "gender": "M",
                    "dateOfBirth": "",
                    "memberId": "",
                    "patientId": "737961639",
                    "patientIdType": "PBM_QL_PARTICIPANT_ID_TYPE",
                    "profileId": null,
                    "email": "",
                    "address": {
                        "line": [
                            "10800 ROSE AVENUE"
                        ],
                        "city": "LOS ANGELES",
                        "state": "CA",
                        "postalCode": "90034",
                        "phoneNumber": "7322083469"
                    }
                },
                "rxDetails": [
                    {
                        "drugDetails": [
                            {
                                "drugName": "LYRICA 100MG CAP",
                                "encPrescriptionLookupKey": "U2FsdGVkX",
                                "prescriptionLookupKey": {
                                    "id": 73796,
                                    "idType": "PBM_QL_PARTICIPANT_ID_TYPE",
                                    "rxNumber": "129740006"
                                },
                                "provider": {
                                    "npi": "",
                                    "firstName": "CPMSEBQ",
                                    "lastName": "BRADENIII",
                                    "phoneNumber": "4920130462",
                                    "faxNumber": "4920136825",
                                    "address": {
                                        "line": [
                                            "5 LOVERS LANE"
                                        ],
                                        "city": "HILLIARD",
                                        "state": "OH",
                                        "postalCode": "43026"
                                    }
                                },
                                "recentFillDate": "08/21/2024",
                                "quantity": 30,
                                "daySupply": 30
                            }
                        ],
                        "fromPharmacy": {
                            "pharmacyName": "HYVEE PHARMACY 1025",
                            "address": {
                                "line": [
                                    "2395 S ONEIDA ST STE 100"
                                ],
                                "city": "ASHWAUBENON",
                                "state": "WI",
                                "postalCode": "54304",
                                "phoneNumber": "9203057011"
                            }
                        },
                        "toPharmacy": {
                            "pharmacyName": "ALLIANCERX WALGREENS PRIME 16280",
                            "storeId": "99999",
                            "address": {
                                "line": [
                                    "GREY 1 CVS DRIVE"
                                ],
                                "city": "WOONSOCKET",
                                "state": "RI",
                                "postalCode": "02895",
                                "phoneNumber": "8005414959"
                            }
                        }
                    }
                ]
            }
        ]
    }
}


import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input
} from '@angular/core';
import { TransferPrescriptionsSubHeaderComponent } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/components';
import { PrescriptionsListFacade } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

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
export class SubmitTransferComponent {
  @Input() public staticContent = {
    continueBtnText: 'Continue'
  };
  protected readonly store = inject(SubmitTransferStore);
  protected readonly prescriptionsListFacade = inject(PrescriptionsListFacade);
  
  public submitTransfer(): void {
    this.prescriptionsListFacade.submitTransfer();
  }
}


