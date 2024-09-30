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

    it('should call submitTransfer on valid form submission', () => {
      // Mock currentPrescriptions$ observable to return the mock prescription data
      mockStore.overrideSelector('currentPrescriptions$', of(currentPrescriptions));

      // Spy on submitTransfer in the store
      const spySubmitTransfer = jest.spyOn(store, 'submitTransfer').mockImplementation(() => {});

      // Call the component's submitTransfer method
      component.submitTransfer();

      // Check if submitTransfer was called
      expect(spySubmitTransfer).toHaveBeenCalled();
    });

    it('should build the correct transfer order request', () => {
      // Call the buildTransferOrderRequest method directly
      const actualRequest = component.buildTransferOrderRequest(currentPrescriptions);

      const expectedRequest: TransferOrderRequest = {
        data: {
          externalTransfer: [
            {
              carrierId: '',
              clinicalRuleDate: '09/16/2024',
              patient: {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '01/01/1990',
                memberId: '7389902',
                patientId: '7389902',
                patientIdType: 'PBM_QL_PARTICIPANT_ID_TYPE',
                profileId: null,
                email: 'john.doe@example.com',
                address: {
                  line: [''],
                  city: '',
                  state: '',
                  postalCode: '',
                  phoneNumber: ''
                }
              },
              requestedChannel: '',
              rxDetails: [
                {
                  drugDetails: [
                    {
                      drugName: 'Drug 1',
                      encPrescriptionLookupKey: 'lookupKey1',
                      prescriptionLookupKey: {
                        id: '133225401',
                        idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
                        rxNumber: 'lookupKey1'
                      },
                      provider: {
                        firstName: 'Brian',
                        lastName: 'BAALI',
                        npi: '1234567890',
                        phoneNumber: '',
                        faxNumber: '',
                        address: {
                          line: ['123 Main St'],
                          city: 'Town',
                          state: 'CA',
                          postalCode: '90210',
                          phoneNumber: '123-456-7890'
                        }
                      },
                      recentFillDate: '08/21/2024',
                      quantity: 90,
                      daySupply: 90
                    }
                  ],
                  fromPharmacy: {
                    pharmacyName: 'Pharmacy 1',
                    address: {
                      line: ['456 Other St'],
                      city: 'City',
                      state: 'CA',
                      postalCode: '90210',
                      phoneNumber: '987-654-3210'
                    },
                    storeId: '99999'
                  },
                  toPharmacy: {
                    pharmacyName: 'ALLIANCERX WALGREENS PRIME 16280',
                    address: {
                      line: ['GREY 1 CVS DRIVE'],
                      city: 'WOONSOCKET',
                      state: 'RI',
                      postalCode: '02895',
                      phoneNumber: '8005414959'
                    },
                    storeId: '99999'
                  }
                }
              ]
            }
          ],
          idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
          profile: null
        }
      };

      // Check if the actual request matches the expected request
      expect(actualRequest).toEqual(expectedRequest);
    });

    it('should handle successful transfer submission', () => {
      // Mock the successful response
      mockStore.overrideSelector('submitTransferResponse', of(mockedResponse));

      // Call the component's submitTransfer method
      component.submitTransfer();

      // Check if errorMessage is null on success
      expect(component.errorMessage).toBeNull();
    });

    it('should handle a failed transfer submission', () => {
      const errorResponse = {
        statusCode: "5000",
        statusDescription: "Error occurred",
        data: []
      };

      // Mock the error response
      mockStore.overrideSelector('submitTransferResponse', of(errorResponse));

      // Call the component's submitTransfer method
      component.submitTransfer();

      // Ensure the error message is set on failure
      expect(component.errorMessage).toBe('An error occurred while submitting the transfer.');
    });

    it('should warn if no prescriptions are selected', () => {
      // Update prescriptions to have none selected
      currentPrescriptions[0].prescriptionforPatient[0].isSelected = false;

      component.currentPrescriptions = currentPrescriptions;
      component.submitTransfer();

      // Check that the appropriate warning is shown
      expect(component.errorMessage).toBe('No prescriptions selected for transfer.');
    });
  });

  describe('buildTransferOrderRequest', () => {
    it('should build the transfer order request correctly', () => {
      component.currentPrescriptions = currentPrescriptions;
      const fromPharmacy = {
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
