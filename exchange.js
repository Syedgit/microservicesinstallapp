public mapPharmacyDetails(pharmacy: any): Pharmacy {
  if (!pharmacy) {
    this.errorMessage = 'Missing pharmacy details.';
    throw new Error(this.errorMessage);
  }

  const pharmacyName = pharmacy.pharmacyName || '';
  const storeId = pharmacy.storeId || '';
  const containsCVS = pharmacyName.toLowerCase().includes('cvs');

  // Build the address object conditionally adding phoneNumber if it is present
  let address: Address | undefined;
  if (pharmacy.address) {
    address = {
      ...this.mapAddressDetails(pharmacy.address),
      ...(pharmacy.phoneNumber && pharmacy.phoneNumber.trim() !== '' ? { phoneNumber: pharmacy.phoneNumber } : {})
    };
  } else if (pharmacy.addresses) {
    address = {
      ...this.mapAddressDetails(pharmacy.addresses),
      ...(pharmacy.phoneNumber && pharmacy.phoneNumber.trim() !== '' ? { phoneNumber: pharmacy.phoneNumber } : {})
    };
  }

  const cvsSpecificFields = containsCVS
    ? {
        open24Hours: pharmacy.open24Hours || false,
        indicatorPharmacyTwentyFourHoursOpen: pharmacy.open24Hours ? 'Y' : 'N',
        instorePickupService: pharmacy.instorePickupService === 'Y' ? 'Y' : 'N',
        indicatorDriveThruService: pharmacy.indicatorDriveThruService === 'Y' ? 'Y' : 'N',
        pharmacyHours: {
          dayHours: pharmacy.open24Hours ? [] : pharmacy.pharmacyHours?.dayHours || []
        }
      }
    : null;

  // Build the pharmacy details object
  const pharmacyDetails: Pharmacy = {
    pharmacyName,
    address,
    storeId,
    ...(cvsSpecificFields ?? {}) // Spread CVS-specific fields only if they exist
  };

  return pharmacyDetails;
}
