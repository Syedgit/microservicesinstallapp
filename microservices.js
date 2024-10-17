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
                  this.cardHolderEmailAdd =
                    member.emailAddresses[0].value || '';
                }

                const rxDetails: RxDetails | null = this.mapRxDetails(member);

                if (rxDetails && rxDetails.drugDetails.length > 0) {
                  const patient: Patient = this.mapPatientDetails(member);

                  return {
                    requestedChannel: 'WEB',
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


public mapRxDetails(member: any): RxDetails | null {
    try {
      const seenRxNumbers = new Set<string>();
      let fromPharmacy: Pharmacy | null = null;

      const uniqueDrugDetails: DrugDetails[] = member.prescriptionforPatient
        .filter((drug: any) => drug.isSelected)
        .map((drug: any) => {
          if (!seenRxNumbers.has(drug.id)) {
            seenRxNumbers.add(drug.id);
            if (!fromPharmacy && drug.pharmacyDetails) {
              fromPharmacy = drug.pharmacyDetails
                ? this.mapPharmacyDetails(drug.pharmacyDetails)
                : null;
            }

            return {
              drugName: drug.drugInfo.drug.name || '',
              encPrescriptionLookupKey: drug.prescriptionLookupKey || '',
              prescriptionLookupKey: this.mapPrescriptionLookupKey(
                member,
                drug
              ),
              provider: drug.prescriber
                ? this.mapProviderDetails(drug.prescriber)
                : null,
              recentFillDate: drug.lastRefillDate
                ? this.formatDate(drug.lastRefillDate)
                : '',
              daySupply: drug.daysSupply || 0,
              quantity: drug.quantity || 0
            };
          }

          return null;
        })
        .filter(
          (drugDetail: any): drugDetail is DrugDetails => drugDetail !== null
        );
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
    } catch (error: unknown) {
      this.store.setStateFailure(true);
      errorMessage('Error in processing RxDetails', error);
      throw error;
    }
  }
