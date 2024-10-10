export interface Pharmacy {
  pharmacyName?: string;
  address?: PharmacyAddress;
  storeId?: string;
  instorePickupService?: string;
  indicatorDriveThruService?: string;
  indicatorPharmacyTwentyFourHoursOpen?: string;
  pharmacyHours?: PharmacyHours;
}

export interface PharmacyAddress {
  city: string;
  country?: string | null;
  line: string[];
  phoneNumber?: string;
  postalCode: string | null;
  state: string | null;
  postalCodeSuffix?: string | null;
}

export interface PharmacyHours {
  dayHours: DayHours[];
}

export interface DayHours {
  day: string;
  hours: string;
}


public mapPharmacyDetails(pharmacy: any): Pharmacy {
  if (!pharmacy) {
    this.errorMessage = 'Missing pharmacy details.';
    throw new Error(this.errorMessage);
  }

  let pharmacyName = '';
  let address: Address | undefined;
  let storeId = '';
  let instorePickupService: string | undefined;
  let indicatorDriveThruService: string | undefined;
  let indicatorPharmacyTwentyFourHoursOpen: string | undefined;
  let pharmacyHours: PharmacyHours | undefined;

  if (pharmacy.pharmacyName) {
    pharmacyName = pharmacy.pharmacyName;
  }

  if (pharmacy.address) {
    address = this.mapAddressDetails(pharmacy.address);
  } else if (pharmacy.addresses) {
    address = this.mapAddressDetails(pharmacy.addresses);
  }

  if (pharmacy.storeId) {
    storeId = pharmacy.storeId;
  }

  // Add additional fields if pharmacyName contains "CVS PHARMACY"
  if (pharmacyName.toUpperCase().includes('CVS PHARMACY')) {
    instorePickupService = pharmacy.instorePickupService;
    indicatorDriveThruService = pharmacy.indicatorDriveThruService;
    indicatorPharmacyTwentyFourHoursOpen = pharmacy.indicatorPharmacyTwentyFourHoursOpen;
    pharmacyHours = pharmacy.pharmacyHours;
  }

  return {
    pharmacyName,
    address,
    storeId,
    instorePickupService,
    indicatorDriveThruService,
    indicatorPharmacyTwentyFourHoursOpen,
    pharmacyHours
  };
}
