Error: 

SubmitTransferComponent › submitTransfer › should handle a successful transfer submission

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: {"data": {"externalTransfer": [{"carrierId": "", "clinicalRuleDate": "09/16/2024", "patient": {"address": {"city": "", "line": [""], "phoneNumber": "", "postalCode": "", "state": ""}, "dateOfBirth": "01/01/1990", "email": "john.doe@example.com", "firstName": "John", "gender": "1", "lastName": "Doe", "memberId": "7389902", "patientId": "7389902", "patientIdType": "PBM_QL_PARTICIPANT_ID_TYPE", "profileId": null}, "requestedChannel": "", "rxDetails": [{"drugDetails": [{"daySupply": 90, "drugName": "Drug 1", "encPrescriptionLookupKey": "lookupKey1", "prescriptionLookupKey": {"id": "133225401", "idType": "PBM_QL_PARTICIPANT_ID_TYPE", "rxNumber": "lookupKey1"}, "provider": {"address": {"city": "Town", "line": [Array], "phoneNumber": "123-456-7890", "postalCode": "90210", "state": "CA"}, "faxNumber": "", "firstName": "Brian", "lastName": "BAALI", "npi": "1234567890", "phoneNumber": ""}, "quantity": 90, "recentFillDate": "08/21/2024"}], "fromPharmacy": {"address": {"city": "WOONSOCKET", "line": ["GREY 1 CVS DRIVE"], "phoneNumber": "8005414959", "postalCode": "02895", "state": "RI"}, "pharmacyName": "ALLIANCERX WALGREENS PRIME 16280", "storeId": "99999"}, "toPharmacy": {"address": {"city": "WOONSOCKET", "line": ["GREY 1 CVS DRIVE"], "phoneNumber": "8005414959", "postalCode": "02895", "state": "RI"}, "pharmacyName": "ALLIANCERX WALGREENS PRIME 16280", "storeId": "99999"}}]}], "idType": "PBM_QL_PARTICIPANT_ID_TYPE", "profile": null}}

    Number of calls: 0

TEst case specs

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { SubmitTransferStore } from './submit-transfer.store';
import { SubmitTransferComponent } from './submit-transfer.component';
import { SubmitTransferResponse, TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

describe('SubmitTransferComponent', () => {
  let component: SubmitTransferComponent;
  let fixture: ComponentFixture<SubmitTransferComponent>;
  let store: SubmitTransferStore;
  let mockStore: MockStore;
  let currentPrescriptions: any[];

  const initialState = {
    config: {
      loading: false,
      currentPrescriptions: [],
      submitTransferResponse: null,
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SubmitTransferStore,
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitTransferComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(SubmitTransferStore);
    mockStore = TestBed.inject(MockStore);

    currentPrescriptions = [
      {
        id: 7389902,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '01/01/1990',
        gender: '1',
        emailAddresses: [
          {
            value: 'john.doe@example.com'
          }
        ],
        prescriptionforPatient: [
          {
            isSelected: true,
            id: '133225401',
            daysSupply: 90,
            quantity: 90,
            lastRefillDate: "08/21/2024",
            drugInfo: {
              drug: {
                name: 'Drug 1'
              }
            },
            prescriptionLookupKey: 'lookupKey1',
            prescriber: {
              firstName: 'Brian',
              lastName: 'BAALI',
              npi: '1234567890',
              address: {
                line: ['123 Main St'],
                city: 'Town',
                state: 'CA',
                postalCode: '90210',
                phoneNumber: '123-456-7890'
              }
            },
            storeDetails: {
              pharmacyName: 'Pharmacy 1',
              address: {
                line: ['456 Other St'],
                city: 'City',
                state: 'CA',
                postalCode: '90210',
                phoneNumber: '987-654-3210'
              }
            }
          }
        ]
      }
    ];

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('submitTransfer', () => {
    const mockedResponse: SubmitTransferResponse = {
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

    it('should handle a successful transfer submission', () => {
      const expectedRequest: TransferOrderRequest = component.buildTransferOrderRequest(currentPrescriptions);
      mockStore.overrideSelector('currentPrescriptions$', of(currentPrescriptions));
      const spySubmitTransfer = jest.spyOn(store, 'submitTransfer').mockImplementation(() => {});
      component.submitTransfer();
      expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);
      expect(spySubmitTransfer).toHaveBeenCalled();
    });

    it('should handle a failed transfer submission', () => {
      const errorResponse = {
        statusCode: "5000",
        statusDescription: "Error occurred",
        data: []
      };

      const spySubmitTransfer = jest.spyOn(store, 'submitTransfer').mockImplementation(() => {});

      component.currentPrescriptions = currentPrescriptions;

      const expectedRequest: TransferOrderRequest = component.buildTransferOrderRequest(currentPrescriptions);

      component.submitTransfer();

      // expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);

      mockStore.setState({ submitTransferResponse: errorResponse });
      mockStore.refreshState();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('No prescriptions selected for transfer.');
    });

    it('should warn if no prescriptions are selected', () => {
      currentPrescriptions[0].prescriptionforPatient[0].isSelected = false;
      component.currentPrescriptions = currentPrescriptions;
      component.submitTransfer();

      expect(component.errorMessage).toBe('No prescriptions selected for transfer.');
    });
  });

  describe('buildTransferOrderRequest', () => {
    it('should build the transfer order request correctly', () => {
      component.currentPrescriptions = currentPrescriptions;
      const fromPharmacy = {
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
      };
      const request = component.buildTransferOrderRequest(currentPrescriptions);

      expect(request.data.externalTransfer.length).toBe(1);
      expect(request.data.externalTransfer[0].patient.firstName).toBe('John');
      expect(request.data.externalTransfer[0].rxDetails[0].fromPharmacy.pharmacyName).toBe(fromPharmacy.pharmacyName);
    });

    it('should return empty externalTransfer array if no prescriptions are selected', () => {
      currentPrescriptions[0].prescriptionforPatient[0].isSelected = false;
      component.currentPrescriptions = currentPrescriptions;
      const request = component.buildTransferOrderRequest(currentPrescriptions);
      expect(request.data.externalTransfer.length).toBe(0);
    });
  });

  describe('mapRxDetails', () => {
    it('should map the prescription details correctly', () => {
      const prescription = currentPrescriptions[0];
      const result = component.mapRxDetails(prescription);
      const fromPharmacy = {
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
      };
      expect(result?.drugDetails.length).toBe(1);
      expect(result?.fromPharmacy.pharmacyName).toBe(fromPharmacy.pharmacyName);
    });

    it('should return null if no selected prescriptions', () => {
      currentPrescriptions[0].prescriptionforPatient[0].isSelected = false;
      const prescription = currentPrescriptions[0];
      const result = component.mapRxDetails(prescription);

      expect(result).toBeNull();
    });
  });

  describe('mapPatientDetails', () => {
    it('should map the patient details correctly', () => {
      const prescription = currentPrescriptions[0];
      const result = component.mapPatientDetails(prescription);

      expect(result.firstName).toBe('John');
      expect(result.email).toBe('john.doe@example.com');
    });

    it('should handle missing email addresses', () => {
      currentPrescriptions[0].emailAddresses = [];
      const prescription = currentPrescriptions[0];
      const result = component.mapPatientDetails(prescription);

      expect(result.email).toBe('');
    });
  });
});
