import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { ExperienceService } from '@digital-blocks/angular/core/util/services';
import { of, throwError } from 'rxjs';
import { Config } from './prescriptions-list.service.config';
import { SubmitTransferResponse, TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';
import { PrescriptionsListService } from './prescriptions-list.service';

describe('PrescriptionsListService', () => {
  let service: PrescriptionsListService;
  let experienceService: ExperienceService;

  const mockResponse: SubmitTransferResponse = {
    statusCode: '0000',
    statusDescription: 'Success',
    data: [
      {
        statusCode: '0000',
        statusDescription: 'Success',
        confirmationNumber: 'CONFIRM123'
      }
    ]
  };

  const mockRequest: TransferOrderRequest = {
    data: {
      externalTransfer: [
        {
          carrierId: '',
          clinicalRuleDate: '09/16/2024',
          patient: {
            address: {
              city: 'Los Angeles',
              line: ['123 Main St'],
              phoneNumber: '1234567890',
              postalCode: '90001',
              state: 'CA'
            },
            dateOfBirth: '01/01/1990',
            email: 'john.doe@example.com',
            firstName: 'John',
            gender: 'M',
            lastName: 'Doe',
            memberId: '7389902',
            patientId: '7389902',
            patientIdType: 'PBM_QL_PARTICIPANT_ID_TYPE',
            profileId: null
          },
          requestedChannel: '',
          rxDetails: [
            {
              drugDetails: [
                {
                  daySupply: 30,
                  drugName: 'Test Drug',
                  encPrescriptionLookupKey: 'ENC_KEY',
                  prescriptionLookupKey: {
                    id: 123,
                    idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
                    rxNumber: 'RX123'
                  },
                  provider: {
                    address: {
                      city: 'LA',
                      line: ['456 Pharmacy St'],
                      phoneNumber: '9876543210',
                      postalCode: '90002',
                      state: 'CA'
                    },
                    faxNumber: '',
                    firstName: 'Dr.',
                    lastName: 'Smith',
                    npi: 'NPI123',
                    phoneNumber: '9876543210'
                  },
                  quantity: 30,
                  recentFillDate: '2024-09-01'
                }
              ],
              fromPharmacy: {
                address: {
                  city: 'LA',
                  line: ['456 Pharmacy St'],
                  phoneNumber: '9876543210',
                  postalCode: '90002',
                  state: 'CA'
                },
                pharmacyName: 'Local Pharmacy'
              },
              toPharmacy: {
                address: {
                  city: 'LA',
                  line: ['789 Destination St'],
                  phoneNumber: '1234567890',
                  postalCode: '90003',
                  state: 'CA'
                },
                pharmacyName: 'Destination Pharmacy',
                storeId: '1001'
              }
            }
          ]
        }
      ],
      idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
      profile: null
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PrescriptionsListService,
        { provide: ExperienceService, useValue: { post: jest.fn() } }
      ]
    });

    service = TestBed.inject(PrescriptionsListService);
    experienceService = TestBed.inject(ExperienceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should submit transfer and return a successful response', (done) => {
    const mockHttpResponse = new HttpResponse<SubmitTransferResponse>({
      body: mockResponse,
      status: 200
    });

    jest.spyOn(experienceService, 'post').mockReturnValue(of(mockHttpResponse));

    service.submitTransfer(mockRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    expect(experienceService.post).toHaveBeenCalledWith(
      Config.clientId,
      Config.experiences,
      Config.mock,
      { data: mockRequest.data },
      { maxRequestTime: 10_000 }
    );
  });

  it('should return an error when the transfer fails', (done) => {
    const mockError = { message: 'Transfer failed' };
    jest.spyOn(experienceService, 'post').mockReturnValue(throwError(() => mockError));

    service.submitTransfer(mockRequest).subscribe({
      next: () => {
        fail('Expected an error, but got success response');
      },
      error: (error) => {
        expect(error).toEqual(mockError);
        done();
      }
    });
  });
});
