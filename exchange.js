public submitTransfer(): void {
  if (this.currentPrescriptions.length > 0 && this.selectedPharmacy) {
    const transferOrderRequest = this.buildTransferOrderRequest(
      this.currentPrescriptions
    );

    this.store.submitTransfer(transferOrderRequest);

    this.store.submitTransferResponse$
      .pipe(
        map((response) => {
          if (!response || !response.data?.submitExternalTransfer) {
            throw new Error('Invalid response format');
          }

          // Check if all transfers failed
          const allFailed = response.data.submitExternalTransfer.every(
            (transfer) => transfer.statusCode === '0002'
          );

          if (allFailed) {
            throw new Error('All transfers failed');
          }

          return response; // Pass the response along the stream if successful
        }),
        catchError((error) => {
          this.store.setStateFailure(true);
          errorMessage('submitTransferFailure', error);
          return throwError(() => error); // Rethrow the error to trigger catch block
        })
      )
      .subscribe({
        next: (response) => {
          const hasSuccessfulTransfer = response.data.submitExternalTransfer.some(
            (transfer) => transfer.statusCode === '0000'
          );

          if (hasSuccessfulTransfer) {
            this.handleSuccess(); // Navigate to the confirmation page
          } else {
            this.handleError(response); // Handle the error scenario
          }
        },
        error: (error) => {
          // This will be triggered when any error is thrown
          this.handleError({ statusDescription: error.message });
        }
      });
  } else {
    this.store.setStateFailure(true);
    throw new Error('No prescriptions selected for transfer');
  }
}
