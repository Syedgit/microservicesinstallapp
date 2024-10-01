import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { SubmitTransferComponent } from './submit-transfer.component';
import { SubmitTransferStore } from './submit-transfer.store';
import { TransferOrderRequest, SubmitTransferResponse } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

describe('SubmitTransferComponent', () => {
  let component: SubmitTransferComponent;
  let fixture: ComponentFixture<SubmitTransferComponent>;
  let store: SubmitTransferStore;
  let mockStore: MockStore;

  const currentPrescriptionsMock = [
    {
      id: 7389902,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '01/01/1990',
      prescriptionforPatient: [
        {
          isSelected: true,
          drugInfo: { drug: { name: 'Drug 1' } },
          prescriptionLookupKey: 'lookupKey1',
          prescriber: { firstName: 'Brian', lastName: 'BAALI', npi: '1234567890' }
        }
      ]
    }
  ];

  const successResponse: SubmitTransferResponse = {
    statusCode: '0000',
    statusDescription: 'Success',
    data: [
      {
        statusCode: '0000',
        statusDescription: 'Success',
        confirmationNumber: 'WE202409251821481QRP'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        SubmitTransferStore,
        provideMockStore({ initialState: {} })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitTransferComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(SubmitTransferStore);
    mockStore = TestBed.inject(MockStore);
  });

  it('should handle a successful transfer submission', () => {
    // Mock the currentPrescriptions$ observable
    jest.spyOn(store, 'currentPrescriptions$').mockReturnValue(of(currentPrescriptionsMock));

    // Mock the submitTransfer method
    const spySubmitTransfer = jest.spyOn(store, 'submitTransfer').mockImplementation(() => {});

    // Mock the submitTransferResponse$ observable to simulate a successful response
    jest.spyOn(store, 'submitTransferResponse$').mockReturnValue(of(successResponse));

    component.submitTransfer();

    // Check if submitTransfer was called with the correct request
    const expectedRequest: TransferOrderRequest = component.buildTransferOrderRequest(currentPrescriptionsMock);
    expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);

    // Simulate the success handling
    expect(component.errorMessage).toBeNull();
  });
});
