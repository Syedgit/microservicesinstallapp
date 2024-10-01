import { of } from 'rxjs';
import { TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

describe('SubmitTransferComponent', () => {
  let component: SubmitTransferComponent;
  let store: SubmitTransferStore;
  let fixture: ComponentFixture<SubmitTransferComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitTransferComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(SubmitTransferStore);
  });

  it('should handle a successful transfer submission', () => {
    const currentPrescriptions = [
      {
        id: 7389902,
        prescriptionforPatient: [
          {
            isSelected: true,
            id: '133225401',
            drugInfo: { drug: { name: 'Drug 1' } },
            prescriptionLookupKey: 'lookupKey1',
            prescriber: { firstName: 'John', lastName: 'Doe' },
            storeDetails: { pharmacyName: 'Pharmacy 1' }
          }
        ]
      }
    ];

    const expectedRequest: TransferOrderRequest = component.buildTransferOrderRequest(currentPrescriptions);

    // Mock currentPrescriptions$ to return mock data
    jest.spyOn(store, 'currentPrescriptions$').mockReturnValue(of(currentPrescriptions));

    // Mock submitTransferResponse$ to return success response
    jest.spyOn(store, 'submitTransferResponse$').mockReturnValue(
      of({ statusCode: '0000', statusDescription: 'Success' })
    );

    // Spy on submitTransfer and handleSuccess
    const spySubmitTransfer = jest.spyOn(store, 'submitTransfer').mockImplementation(() => {});
    const spyHandleSuccess = jest.spyOn(component, 'handleSuccess');

    // Call the method
    component.submitTransfer();

    // Check if submitTransfer is called with the correct request
    expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);
    // Check if handleSuccess is called
    expect(spyHandleSuccess).toHaveBeenCalled();
  });

  it('should handle no prescriptions selected for transfer', () => {
    // Mock currentPrescriptions$ to return an empty array
    jest.spyOn(store, 'currentPrescriptions$').mockReturnValue(of([]));

    // Call the method
    component.submitTransfer();

    // Check if the error message is set
    expect(component.errorMessage).toBe('No prescriptions selected for transfer.');
  });

  it('should handle a failed transfer submission', () => {
    const currentPrescriptions = [
      {
        id: 7389902,
        prescriptionforPatient: [
          {
            isSelected: true,
            id: '133225401',
            drugInfo: { drug: { name: 'Drug 1' } },
            prescriptionLookupKey: 'lookupKey1',
            prescriber: { firstName: 'John', lastName: 'Doe' },
            storeDetails: { pharmacyName: 'Pharmacy 1' }
          }
        ]
      }
    ];

    const expectedRequest: TransferOrderRequest = component.buildTransferOrderRequest(currentPrescriptions);

    // Mock currentPrescriptions$ to return mock data
    jest.spyOn(store, 'currentPrescriptions$').mockReturnValue(of(currentPrescriptions));

    // Mock submitTransferResponse$ to return error response
    jest.spyOn(store, 'submitTransferResponse$').mockReturnValue(
      of({ statusCode: '5000', statusDescription: 'Error occurred' })
    );

    // Spy on submitTransfer and handleError
    const spySubmitTransfer = jest.spyOn(store, 'submitTransfer').mockImplementation(() => {});
    const spyHandleError = jest.spyOn(component, 'handleError');

    // Call the method
    component.submitTransfer();

    // Check if submitTransfer is called with the correct request
    expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);
    // Check if handleError is called with the error response
    expect(spyHandleError).toHaveBeenCalledWith({ statusCode: '5000', statusDescription: 'Error occurred' });
  });
});
