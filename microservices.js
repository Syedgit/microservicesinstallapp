import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmitTransferComponent } from './submit-transfer.component';
import { SubmitTransferStore } from './submit-transfer.store';
import { provideMockStore } from '@ngrx/store/testing';
import { IPrescriptionDetails } from '@your-path'; // Adjust the imports accordingly
import { TransferOrderRequest, SubmitTransferResponse } from '@your-path'; // Adjust the imports accordingly

describe('SubmitTransferComponent', () => {
  let fixture: ComponentFixture<SubmitTransferComponent>;
  let component: SubmitTransferComponent;
  let store: SubmitTransferStore;

  const currentPrescriptionsMock: IPrescriptionDetails[] = [
    {
      id: '7389902',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '01/01/1990',
      gender: '1',
      emailAddresses: [{ value: 'john.doe@example.com' }],
      prescriptionforPatient: [
        {
          isSelected: true,
          id: '133225401',
          drugInfo: { drug: { name: 'Drug 1' } },
          prescriptionLookupKey: 'lookupKey1',
          prescriber: { firstName: 'Brian', lastName: 'BAALI', npi: '1234567890' },
          storeDetails: { pharmacyName: 'Pharmacy 1' }
        }
      ]
    }
  ];

  const successResponse: SubmitTransferResponse = {
    statusCode: '0000',
    statusDescription: 'Success',
    data: []
  };

  const errorResponse: SubmitTransferResponse = {
    statusCode: '5000',
    statusDescription: 'Error',
    data: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubmitTransferComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: 'currentPrescriptions$', value: of(currentPrescriptionsMock) },
            { selector: 'submitTransferResponse$', value: of(successResponse) }
          ]
        }),
        SubmitTransferStore
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitTransferComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(SubmitTransferStore);
  });

  it('should handle a successful transfer submission', () => {
    const spySubmitTransfer = jest.spyOn(store, 'submitTransfer').mockImplementation(() => {});

    // Call submitTransfer
    component.submitTransfer();

    // Expected request
    const expectedRequest: TransferOrderRequest = component.buildTransferOrderRequest(currentPrescriptionsMock);

    expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);
    expect(component.errorMessage).toBeNull();
  });

  it('should handle an error during transfer submission', () => {
    jest.spyOn(store, 'submitTransferResponse$').mockReturnValue(of(errorResponse));

    component.submitTransfer();

    expect(component.errorMessage).toBe('An error occurred while submitting the transfer request.');
  });
});
