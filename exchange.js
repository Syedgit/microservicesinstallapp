public buildTransferOrderRequest(
    currentPrescriptions: IPrescriptionDetails[]
  ): TransferOrderRequest {
    try {
      const externalTransfer: ExternalTransfer[] =
        currentPrescriptions.length > 0
          ? currentPrescriptions
              .map((member) => {
                const rxDetails: RxDetails | null = this.mapRxDetails(member);

                if (rxDetails && rxDetails.drugDetails.length > 0) {
                  const patient: Patient = this.mapPatientDetails(member);

                  return {
                    requestedChannel: '',
                    carrierId: member.carrierID,
                    clinicalRuleDate: this.getCurrentDate(),
                    patient,
                    rxDetails: [rxDetails]
                  };
                }

                return null;
              })
              .filter(
                (transfer): transfer is ExternalTransfer => transfer !== null
              )
          : [];
        

      return {
        data: {
          idType: 'PBM_QL_PARTICIPANT_ID_TYPE',
          profile: '',
          externalTransfer
        }
      };
    } catch (error) {
      this.store.setStateFailure(true);
      errorMessage('Error building transfer order request', error);
      throw error;
    }
  }
