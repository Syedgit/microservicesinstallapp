import { of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

public submitTransfer(): void {
  if (this.currentPrescriptions.length === 0 || !this.selectedPharmacy) {
    this.store.setStateFailure(true);
    throw new Error('No prescriptions selected for transfer');
  }

  const transferOrderRequest = this.buildTransferOrderRequest(this.currentPrescriptions);

  this.store.submitTransfer(transferOrderRequest);

  this.store.submitTransferResponse$
    .pipe(
      map((response) => {
        const transfers = response?.data?.submitExternalTransfer || [];
        
        // Check if all transfers failed
        const allFailed = transfers.every(transfer => transfer.statusCode === '0002');

        if (allFailed) {
          throw new Error('All transfers failed');
        }

        return transfers; // Pass transfers along if at least one succeeds
      }),
      catchError((error) => {
        this.store.setStateFailure(true);
        errorMessage('submitTransferFailure', error);
        return throwError(() => new Error('Failed to submit transfer')); // Propagate the error
      })
    )
    .subscribe({
      next: (transfers) => {
        // Check if at least one transfer succeeded
        const hasSuccessfulTransfer = transfers.some(transfer => transfer.statusCode === '0000');

        if (hasSuccessfulTransfer) {
          this.handleSuccess(); // Navigate on success
        } else {
          this.handleError({ statusDescription: 'Transfer failed' });
        }
      },
      error: (error) => {
        // Handle any errors from catch block
        this.handleError({ statusDescription: error.message });
      }
    });
}
