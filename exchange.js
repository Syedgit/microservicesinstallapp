
this.selected = {
                            "pharmacyName": "CVS PHARMACY",
                            "storeId": "68735",
                            "address": {
                                "line": [
                                    "GREY 1 CVS DRIVE"
                                ],
                                "city": "WOONSOCKET",
                                "state": "RI",
                                "postalCode": "02895",
                                "phoneNumber": "8005414959"
                            },
                            "instorePickupService": "Y",
                            "indicatorDriveThruService": "Y",
                            "indicatorPharmacyTwentyFourHoursOpen": "N",
                            "pharmacyHours": {
                                "dayHours": [
                                    {
                                        "day": "MON",
                                        "hours": "08:00 AM - 09:00 PM"
                                    },
                                    {
                                        "day": "TUE",
                                        "hours": "08:00 AM - 09:00 PM"
                                    },
                                    {
                                        "day": "WED",
                                        "hours": "08:00 AM - 09:00 PM"
                                    },
                                    {
                                        "day": "THU",
                                        "hours": "08:00 AM - 09:00 PM"
                                    },
                                    {
                                        "day": "FRI",
                                        "hours": "08:00 AM - 09:00 PM"
                                    },
                                    {
                                        "day": "SAT",
                                        "hours": "09:00 AM - 06:00 PM"
                                    },
                                    {
                                        "day": "SUN",
                                        "hours": "10:00 AM - 05:00 PM"
                                    }
                                ]
                            }
                        }


interface.ts

export interface Pharmacy {
  maintenanceChoice?: boolean;
  nationalProviderId?: string;
  nintyDayRetail?: boolean;
  pharmacyName?: string;
  distance?: number;
  rxM90Pharmacy?: boolean;
  addresses?: PharmacyAddress;
  address?: PharmacyAddress;
  storeId?: string;
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






public mapPharmacyDetails(pharmacy: any): Pharmacy {
    if (!pharmacy) {
      this.errorMessage = 'Missing pharmacy details.';
      throw new Error(this.errorMessage);
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
      address = this.mapAddressDetails(pharmacy.addresses);
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
