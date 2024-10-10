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

  // Set indicators based on ternary conditions
  const open24Hours = pharmacy.open24Hours || false;
  const indicatorPharmacyTwentyFourHoursOpen = open24Hours ? 'Y' : 'N';
  const instorePickupService = pharmacy.instorePickupService === 'Y' ? 'Y' : 'N';
  const indicatorDriveThruService = pharmacy.indicatorDriveThruService === 'Y' ? 'Y' : 'N';

  // Use a ternary condition to set pharmacyHours
  const pharmacyHours = !open24Hours ? pharmacy.pharmacyHours : undefined;

  return {
    pharmacyName,
    address,
    storeId,
    instorePickupService,
    indicatorDriveThruService,
    indicatorPharmacyTwentyFourHoursOpen,
    pharmacyHours,
    open24Hours
  };
}
