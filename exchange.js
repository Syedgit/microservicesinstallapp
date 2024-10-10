public mapPharmacyDetails(pharmacy: any): Pharmacy {
  if (!pharmacy) {
    this.errorMessage = 'Missing pharmacy details.';
    throw new Error(this.errorMessage);
  }

  const pharmacyName = pharmacy.pharmacyName || '';
  const address = pharmacy.address 
    ? this.mapAddressDetails(pharmacy.address) 
    : pharmacy.addresses 
      ? this.mapAddressDetails(pharmacy.addresses) 
      : undefined;
  const storeId = pharmacy.storeId || '';

  // Check if the pharmacy name contains "cvs" (case-insensitive)
  const containsCVS = pharmacyName.toLowerCase().includes('cvs');

  // Define additional fields only if the pharmacy name contains "cvs"
  const cvsSpecificFields = containsCVS ? {
    open24Hours: pharmacy.open24Hours || false,
    indicatorPharmacyTwentyFourHoursOpen: pharmacy.open24Hours ? 'Y' : 'N',
    instorePickupService: pharmacy.instorePickupService === 'Y' ? 'Y' : 'N',
    indicatorDriveThruService: pharmacy.indicatorDriveThruService === 'Y' ? 'Y' : 'N',
    pharmacyHours: {
      dayHours: pharmacy.open24Hours ? [] : pharmacy.pharmacyHours?.dayHours || [] // If open24Hours is true, return empty dayHours, else use existing dayHours
    }
  } : null;

  // Build the pharmacy details object
  const pharmacyDetails: Pharmacy = {
    pharmacyName,
    address,
    storeId,
    ...(cvsSpecificFields ?? {}) // Spread CVS-specific fields only if they exist
  };

  return pharmacyDetails;
}
