public submitTransfer(): void {
  try {
    if (this.currentPrescriptions.length > 0 && this.selectedPharmacy) {
      const transferOrderRequest = this.buildTransferOrderRequest(this.currentPrescriptions);
      
      this.store.submitTransfer(transferOrderRequest);
      this.store.submitTransferResponse$.subscribe((response) => {
        if (response) {
          const submitExternalTransfer = response.data?.submitExternalTransfer || [];

          const hasSuccess = submitExternalTransfer.some(
            (transfer) => transfer.statusCode === '0000'
          );

          const allFailed = submitExternalTransfer.every(
            (transfer) => transfer.statusCode === '0002'
          );

          if (hasSuccess) {
            this.handleSuccess();
          } else if (allFailed) {
            throw new Error('All transfers failed');
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
