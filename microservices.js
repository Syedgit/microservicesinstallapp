import { of } from 'rxjs';
import { IPrescriptionDetails } from '@your-app-path';  // Adjust the import path as needed
import { SubmitTransferResponse, TransferOrderRequest } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';

describe('SubmitTransferComponent', () => {
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

  const successResponse: SubmitTransferResponse = {
    statusCode: '0000',
    statusDescription: 'Success',
    data: []
  };

  beforeEach(() => {
    // Mock store observables
    jest.spyOn(store, 'currentPrescriptions$').mockReturnValue(of(currentPrescriptionsMock));
    jest.spyOn(store, 'submitTransferResponse$').mockReturnValue(of(successResponse));

    // Mock submitTransfer
    jest.spyOn(store, 'submitTransfer').mockImplementation(() => {});
  });

  it('should handle a successful transfer submission', () => {
    // Build expected transfer request
    const expectedRequest: TransferOrderRequest = component.buildTransferOrderRequest(currentPrescriptionsMock);

    // Call the submitTransfer method
    component.submitTransfer();

    // Verify submitTransfer was called with the expected request
    expect(store.submitTransfer).toHaveBeenCalledWith(expectedRequest);

    // Verify that errorMessage is null, meaning the transfer was successful
    expect(component.errorMessage).toBeNull();
  });
});
