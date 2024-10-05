public mapPharmacyDetails(pharmacy: Pharmacy | null): Pharmacy {
  if (!pharmacy) {
    this.errorMessage = 'Missing pharmacy details.';
    throw new Error(this.errorMessage); // Optionally throw an error if pharmacy details are missing
  }

  let pharmacyName = '';
  let address: Address | undefined;
  let storeId = '';

  if (pharmacy.pharmacyName) {
    pharmacyName = pharmacy.pharmacyName;
  }

  if (pharmacy.address) {
    address = this.mapAddressDetails(pharmacy.address);
  } else if (pharmacy.addresses) {
    address = this.mapAddressDetails(pharmacy.addresses[0]); // Assuming addresses is an array and taking the first one
  }

  if (pharmacy.storeId) {
    storeId = pharmacy.storeId;
  }

  return {
    pharmacyName,
    address,
    storeId
  };
}
