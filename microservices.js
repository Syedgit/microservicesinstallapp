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

              const rxDetailsArray: RxDetails[] = member.prescriptionforPatient
                .filter((drug: any) => drug.isSelected) // Filter only selected prescriptions
                .map((drug) => this.mapRxDetails(member, drug)) // Map each selected prescription to RxDetails
                .filter((rxDetail): rxDetail is RxDetails => rxDetail !== null);

              if (rxDetailsArray.length > 0) {
                const patient: Patient = this.mapPatientDetails(member);

                return {
                  requestedChannel: 'WEB',
                  carrierId: member.carrierID,
                  clinicalRuleDate: this.getCurrentDate(),
                  patient,
                  rxDetails: rxDetailsArray // Pass the array of RxDetails
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

    // Map the prescription to a DrugDetails object
    const drugDetails: DrugDetails[] = [{
      drugName: drug.drugInfo?.drug?.name || '',
      encPrescriptionLookupKey: drug.prescriptionLookupKey || '',
      prescriptionLookupKey: this.mapPrescriptionLookupKey(member, drug),
      provider: drug.prescriber ? this.mapProviderDetails(drug.prescriber) : null,
      recentFillDate: drug.lastRefillDate ? this.formatDate(drug.lastRefillDate) : '',
      daySupply: drug.daysSupply || 0,
      quantity: drug.quantity || 0
    }];

    // Set fromPharmacy using the pharmacyDetails from the drug
    if (!fromPharmacy && drug.pharmacyDetails) {
      fromPharmacy = this.mapPharmacyDetails(drug.pharmacyDetails);
    }

    // toPharmacy is set using the selectedPharmacy
    const toPharmacy: Pharmacy = this.mapPharmacyDetails(this.selectedPharmacy);

    if (drugDetails.length === 0 || !fromPharmacy || !toPharmacy) {
      return null;
    }

    return {
      drugDetails,
      fromPharmacy,
      toPharmacy
    };
  } catch (error: unknown) {
    this.store.setStateFailure(true);
    errorMessage('Error in processing RxDetails', error);
    throw error;
  }
}
