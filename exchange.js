public submitTransfer(): void {
  try {
    if (this.currentPrescriptions.length > 0 && this.selectedPharmacy) {
      const transferOrderRequest = this.buildTransferOrderRequest(this.currentPrescriptions);

      this.store.submitTransfer(transferOrderRequest);

      // Add better handling for the response
      this.store.submitTransferResponse$.subscribe((response) => {
        // Handle null response without immediately failing
        if (response === null) {
          console.warn('Received null response, waiting for actual response...');
          return;
        }

        if (response && response.statusCode === '0000') {
          // Handle individual transfers
          const allTransfers = response?.data?.submitExternalTransfer || [];
          const allFailed = allTransfers.every(transfer => transfer.statusCode !== '0000');
          
          if (allFailed) {
            // Handle scenario where all transfers fail
            this.store.setStateFailure(true);
            this.handleError(new Error('All transfers failed'));
          } else {
            // Handle at least one successful transfer
            this.handleSuccess();
          }
        } else {
          this.handleError(response);
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
