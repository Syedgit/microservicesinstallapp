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
      ],
      declarations: [SubmitTransferComponent]
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
        emailAddresses: [
          {
            value: 'john.doe@example.com'
          }
        ],
        prescriptionforPatient: [
          {
            isSelected: true,
            id: '133225401',
            drugInfo: {
              drug: {
                name: 'Drug 1'
              }
            },
            prescriptionLookupKey: 'lookupKey1',
            prescriber: {
              firstName: 'John',
              lastName: 'Doe',
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
            },
            quantity: 30,
            daySupply: 30,
            recentFillDate: '2024-09-01'
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

      // Mock currentPrescriptions$ observable
      mockStore.overrideSelector('currentPrescriptions$', of(currentPrescriptions));

      // Spy on submitTransfer to ensure it gets called
      const spySubmitTransfer = jest.spyOn(store, 'submitTransfer').mockImplementation(() => {});

      component.submitTransfer();

      expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);
      expect(component.errorMessage).toBeNull();
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

      expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);

      mockStore.setState({ submitTransferResponse: errorResponse });
      mockStore.refreshState();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Error occurred');
    });

    it('should warn if no prescriptions are selected', () => {
      currentPrescriptions[0].prescriptionforPatient[0].isSelected = false;
      component.currentPrescriptions = currentPrescriptions;
      component.submitTransfer();

      expect(component.errorMessage).toBe('No prescriptions selected for transfer.');
    });
  });

  describe('submitTransferResponse subscription and statusCode handling', () => {
    it('should subscribe to submitTransferResponse$ and handle success on statusCode 0000', () => {
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

      // Spy on handleSuccess method to verify it gets called
      const spyHandleSuccess = jest.spyOn(component, 'handleSuccess').mockImplementation(() => {});

      // Mock the submitTransferResponse$ observable to return the mocked success response
      jest.spyOn(store, 'submitTransferResponse$', 'get').mockReturnValue(of(mockedResponse));

      // Call submitTransfer and ensure submitTransferResponse$ is subscribed to
      component.submitTransfer();

      // Expect that handleSuccess is called upon receiving statusCode "0000"
      expect(spyHandleSuccess).toHaveBeenCalled();
    });

    it('should handle error if statusCode is not 0000', () => {
      const mockedResponse: SubmitTransferResponse = {
        statusCode: "5000",
        statusDescription: "Failed",
        data: []
      };

      // Spy on handleError method to verify it gets called
      const spyHandleError = jest.spyOn(component, 'handleError').mockImplementation(() => {});

      // Mock the submitTransferResponse$ observable to return the mocked error response
      jest.spyOn(store, 'submitTransferResponse$', 'get').mockReturnValue(of(mockedResponse));

      // Call submitTransfer and ensure submitTransferResponse$ is subscribed to
      component.submitTransfer();

      // Expect that handleError is called upon receiving statusCode not equal to "0000"
      expect(spyHandleError).toHaveBeenCalledWith(mockedResponse.statusDescription);
    });
  });

  describe('buildTransferOrderRequest', () => {
    it('should build the transfer order request correctly', () => {
      component.currentPrescriptions = currentPrescriptions;

      const request = component.buildTransferOrderRequest(currentPrescriptions);

      expect(request.data.externalTransfer.length).toBe(1);
      expect(request.data.externalTransfer[0].patient.firstName).toBe('John');
      expect(request.data.externalTransfer[0].rxDetails[0].fromPharmacy.pharmacyName).toBe('Pharmacy 1');
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

      expect(result?.drugDetails.length).toBe(1);
      expect(result?.fromPharmacy.pharmacyName).toBe('Pharmacy 1');
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
