 public submitTransfer(): void {
    try {
      if (this.currentPrescriptions.length > 0 && this.selectedPharmacy) {
        const transferOrderRequest = this.buildTransferOrderRequest(
          this.currentPrescriptions
        );

        this.store.submitTransfer(transferOrderRequest);
        this.store.submitTransferResponse$.subscribe((response) => {
          if (response) {
            if (response.statusCode === '0000') {
              this.handleSuccess();
            } else {
              this.handleError(response);
            }
          }
        });
      } else {
        this.store.setStateFailure(true);
        throw new Error('No prescriptions selected for transfer');
      }
    } catch (error) {
      this.store.setStateFailure(true);
      errorMessage('submitTransferFailure', error);
      throw error;
    }
  }

Response :

{
    "statusCode": "0000",
    "statusDescription": "Success",
    "data": {
        "submitExternalTransfer": [
            {
                "statusCode": "0000",
                "statusDescription": "Success",
                "confirmationNumber": "TU20241022160335XM3X"
            },
            {
                "statusCode": "0002",
                "statusDescription": "Failure",
                "confirmationNumber": "TU202410221603353EDJ"
            }
        ]
    }
}
