This assertion is unnecessary since it does not change the type of the expression.


  public buildTransferOrderRequest(
    currentPrescriptions: IPrescriptionDetails[]
  ): TransferOrderRequest {
    const externalTransfer: ExternalTransfer[] =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- null' is not assignable to type
      currentPrescriptions!.length > 0
        ? currentPrescriptions
            .map((prescription) => {
              const rxDetails: RxDetails | null =
                this.mapRxDetails(prescription);

              if (rxDetails && rxDetails.drugDetails.length > 0) {
                const patient: Patient = this.mapPatientDetails(prescription);

                return {
                  requestedChannel: '',
                  carrierId: '',
                  clinicalRuleDate: '09/16/2024',
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
        profile: 'test',
        externalTransfer
      }
    };
  }
