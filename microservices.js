import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { SubmitTransferStore } from './submit-transfer.store';
import { SubmitTransferComponent } from './submit-transfer.component';
import { SubmitTransferResponse } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

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
      mockStore.setState({
        submitTransferResponse: mockedResponse
      });

      const spySubmitTransfer = jest.spyOn(store, 'submitTransfer');
      component.currentPrescriptions = currentPrescriptions;
      component.submitTransfer();

      expect(spySubmitTransfer).toHaveBeenCalled();
      expect(component.errorMessage).toBeNull();

      mockStore.setState({ submitTransferResponse: mockedResponse });
      mockStore.refreshState();
      fixture.detectChanges();

      expect(component.errorMessage).toBeNull();
    });

    it('should handle a failed transfer submission', () => {
      const errorResponse = {
        statusCode: "5000",
        statusDescription: "Error occurred",
        data: []
      };

      const spySubmitTransfer = jest.spyOn(store, 'submitTransfer');
      component.currentPrescriptions = currentPrescriptions;
      component.submitTransfer();

      expect(spySubmitTransfer).toHaveBeenCalled();

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
      expect(result.email).toBe('');
    });

    it('should handle missing email addresses', () => {
      currentPrescriptions[0].emailAddresses = [];
      const prescription = currentPrescriptions[0];
      const result = component.mapPatientDetails(prescription);

      expect(result.email).toBe('');
    });
  });
});
