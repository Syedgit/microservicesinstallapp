 Number of calls: 0

      122 |       const expectedRequest: TransferOrderRequest = component.buildTransferOrderRequest(currentPrescriptions);
      123 |   
    > 124 |       expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);
          |                                 ^
      125 |       
      126 |       expect(component.errorMessage).toBeNull();
      127 |     });

      at src/lib/submit-transfer.component.spec.ts:124:33
