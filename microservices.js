public buildTransferOrderRequest(
  currentPrescriptions: IPrescriptionDetails[]
): TransferOrderRequest {
  try {
    const externalTransfer: ExternalTransfer[] =
      currentPrescriptions.length > 0
        ? currentPrescriptions
            .map((member) => {
              if (
                member.memberType === 'primary' &&
                member.emailAddresses.length > 0
              ) {
                this.cardHolderEmailAdd = member.emailAddresses[0].value || '';
              }

              // Use the new logic for handling each prescription separately
              const rxDetailsArray: RxDetails[] = member.prescriptionforPatient
                .filter((drug: any) => drug.isSelected)
                .map((drug) => this.mapRxDetails(member, drug))
                .filter((rxDetail): rxDetail is RxDetails => rxDetail !== null);

              if (rxDetailsArray.length > 0) {
                const patient: Patient = this.mapPatientDetails(member);

                return {
                  requestedChannel: 'WEB',
                  carrierId: member.carrierID,
                  clinicalRuleDate: this.getCurrentDate(),
                  patient,
                  rxDetails: rxDetailsArray // Now we pass the array of RxDetails
                };
              }

              return null;
            })
            .filter(
              (transfer): transfer is ExternalTransfer => transfer !== null
            )
        : [];

    if (externalTransfer.length === 0) {
      throw new Error('No valid Transfer data available');
    }

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


public mapRxDetails(member: any, drug: any): RxDetails | null {
  try {
    let fromPharmacy: Pharmacy | null = null;

    // Each drug will now have its own RxDetails object
    if (drug.isSelected) {
      if (!fromPharmacy && drug.pharmacyDetails) {
        fromPharmacy = this.mapPharmacyDetails(drug.pharmacyDetails);
      }

      const uniqueDrugDetails: DrugDetails[] = [{
        drugName: drug.drugInfo.drug.name || '',
        encPrescriptionLookupKey: drug.prescriptionLookupKey || '',
        prescriptionLookupKey: this.mapPrescriptionLookupKey(member, drug),
        provider: drug.prescriber
          ? this.mapProviderDetails(drug.prescriber)
          : null,
        recentFillDate: drug.lastRefillDate
          ? this.formatDate(drug.lastRefillDate)
          : '',
        daySupply: drug.daysSupply || 0,
        quantity: drug.quantity || 0
      }];

      const toPharmacy: Pharmacy = this.mapPharmacyDetails(
        this.selectedPharmacy
      );

      if (uniqueDrugDetails.length === 0 || !fromPharmacy || !toPharmacy) {
        return null;
      }

      return {
        drugDetails: uniqueDrugDetails,
        fromPharmacy,
        toPharmacy
      };
    }

    return null;
  } catch (error: unknown) {
    this.store.setStateFailure(true);
    errorMessage('Error in processing RxDetails', error);
    throw error;
  }
}
