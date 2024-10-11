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

  // Determine storeId: if pharmacyName contains "CVS" or "HYVEE", use pharmacy.storeId, otherwise default to "99999"
  const storeId = /cvs|hyvee/i.test(pharmacyName) ? (pharmacy.storeId || '') : '99999';

  // Add phoneNumber to address if available
  if (pharmacy.phoneNumber && address) {
    address.phoneNumber = pharmacy.phoneNumber;
  }

  // Additional fields for "CVS" pharmacies
  const cvsSpecificFields = pharmacyName.toLowerCase().includes('cvs')
    ? {
        open24Hours: pharmacy.open24Hours || false,
        indicatorPharmacyTwentyFourHoursOpen: pharmacy.open24Hours ? 'Y' : 'N',
        instorePickupService: pharmacy.instorePickupService === 'Y' ? 'Y' : 'N',
        indicatorDriveThruService: pharmacy.indicatorDriveThruService === 'Y' ? 'Y' : 'N',
        pharmacyHours: {
          dayHours: pharmacy.open24Hours ? [] : pharmacy.pharmacyHours?.dayHours || []
        }
      }
    : {};

  // Construct the final pharmacy object
  return {
    pharmacyName,
    address,
    storeId,
    ...cvsSpecificFields
  };
}
