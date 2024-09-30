import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ExperienceService } from '@digital-blocks/angular/core/util/services';
import { errorMessage } from '@digital-blocks/core/util/error-handler';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';

import { PrescriptionsListService } from '../services/prescriptions-list.service';
import { PrescriptionsListEffects } from './prescriptions-list.effects';
import { PrescriptionsListActions } from './prescriptions-list.actions';
import { SubmitTransferResponse } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

describe('PrescriptionsListEffects', () => {
  let actions$: Observable<any>;
  let effects: PrescriptionsListEffects;
  let service: PrescriptionsListService;
  const mockExperienceService = { post: jest.fn() };
  const errorText = 'Transfer failed';
  
  const mockResponse: SubmitTransferResponse = {
    statusCode: "0000",
    statusDescription: "Success",
    data: [
      {
        statusCode: "0000",
        statusDescription: "Success",
        confirmationNumber: "WE202409251821481QRP"
      }
    ]
  };

  const mockRequest = {
    data: {
      externalTransfer: [
        {
          carrierId: "",
          clinicalRuleDate: "09/16/2024",
          patient: {
            address: {
              city: "LOS ANGELES",
              line: ["10800 ROSE AVENUE"],
              phoneNumber: "7322083469",
              postalCode: "90034",
              state: "CA"
            },
            dateOfBirth: "",
            email: "",
            firstName: "John",
            gender: "M",
            lastName: "Miller",
            memberId: "",
            patientId: "737961639",
            patientIdType: "PBM_QL_PARTICIPANT_ID_TYPE",
            profileId: null
          },
          requestedChannel: "",
          rxDetails: [
            {
              drugDetails: [
                {
                  daySupply: 30,
                  drugName: "LYRICA 100MG CAP",
                  encPrescriptionLookupKey: "U2FsdGVkX",
                  prescriptionLookupKey: {
                    id: 73796,
                    idType: "PBM_QL_PARTICIPANT_ID_TYPE",
                    rxNumber: "129740006"
                  },
                  provider: {
                    address: {
                      city: "HILLIARD",
                      line: ["5 LOVERS LANE"],
                      postalCode: "43026",
                      state: "OH"
                    },
                    faxNumber: "4920136825",
                    firstName: "CPMSEBQ",
                    lastName: "BRADENIII",
                    npi: "",
                    phoneNumber: "4920130462"
                  },
                  quantity: 30,
                  recentFillDate: "08/21/2024"
                }
              ],
              fromPharmacy: {
                address: {
                  city: "ASHWAUBENON",
                  line: ["2395 S ONEIDA ST STE 100"],
                  phoneNumber: "9203057011",
                  postalCode: "54304",
                  state: "WI"
                },
                pharmacyName: "HYVEE PHARMACY 1025"
              },
              toPharmacy: {
                address: {
                  city: "WOONSOCKET",
                  line: ["GREY 1 CVS DRIVE"],
                  phoneNumber: "8005414959",
                  postalCode: "02895",
                  state: "RI"
                },
                pharmacyName: "ALLIANCERX WALGREENS PRIME 16280",
                storeId: "99999"
              }
            }
          ]
        }
      ],
      idType: "PBM_QL_PARTICIPANT_ID_TYPE",
      profile: null
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PrescriptionsListEffects,
        provideMockStore(),
        provideMockActions(() => actions$),
        PrescriptionsListService,
        { provide: ExperienceService, useValue: mockExperienceService }
      ]
    });

    effects = TestBed.inject(PrescriptionsListEffects);
    service = TestBed.inject(PrescriptionsListService);
  });

  describe('submitTransfer$', () => {
    it('should return submitTransferSuccess action on successful transfer', async () => {
      actions$ = of(PrescriptionsListActions.submitTransfer({ request: mockRequest }));

      jest
        .spyOn(service, 'submitTransfer')
        .mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(effects.submitTransfer$);

      expect(result).toEqual(
        PrescriptionsListActions.submitTransferSuccess({
          submitTransferResponse: mockResponse
        })
      );
    });

    it('should return submitTransferFailure action on failed transfer', async () => {
      actions$ = of(PrescriptionsListActions.submitTransfer({ request: mockRequest }));

      jest
        .spyOn(service, 'submitTransfer')
        .mockReturnValue(
          throwError(() => errorMessage(effects.constructor.name, errorText))
        );

      const result = await firstValueFrom(effects.submitTransfer$);

      expect(result).toEqual(
        PrescriptionsListActions.submitTransferFailure({
          error: errorMessage(effects.constructor.name, errorText)
        })
      );
    });
  });
});
