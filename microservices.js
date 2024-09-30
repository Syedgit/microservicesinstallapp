 public submitTransfer(): void {
    this.store.currentPrescriptions$.pipe(
      switchMap((data: IPrescriptionDetails[] | undefined) => {
        this.currentPrescriptions = data || [];
 
        Iif (this.currentPrescriptions.length > 0) {
          const transferOrderRequest = this.buildTransferOrderRequest(this.currentPrescriptions);
          this.store.submitTransfer(transferOrderRequest);
 
          this.store.submitTransferResponse$.subscribe((response) => {
            Iif (response) {
              if (response.statusCode === '0000') {
                this.handleSuccess();
              } else {
                this.handleError(response);
              }
            }
          });
 
          return of(null);
        } else {
          this.errorMessage = 'No prescriptions selected for transfer.';
          return of(null);
        }
      })
    ).subscribe();
  }

component.specs.ts

 it('should handle a successful transfer submission', () => {
      // const spySubmit = jest.spyOn(component, 'submitTransfer');
       const expectedRequest: TransferOrderRequest = component.buildTransferOrderRequest(currentPrescriptions);
      // store.currentPrescriptions$.subscribe(() => {
      //   expect(spySubmit).toHaveBeenCalled();
      // });
      component.submitTransfer();
      const spySubmitTransfer = jest.spyOn(store, 'submitTransfer').mockImplementation(() => {});
      store.submitTransfer(() => {
        expect(spySubmitTransfer).toHaveBeenCalledWith(expectedRequest);
      });
    });
