public ngOnInit(): void {
  // Mock multiple pharmacies data (for search page scenario)
  this.pharmacies = [
    {
      id: '1',
      name: 'Pharmacy One',
      latitude: 40.73061,
      longitude: -73.935242
    },
    {
      id: '2',
      name: 'Pharmacy Two',
      latitude: 40.7128,
      longitude: -74.006
    }
  ];

  // Mock single pharmacy data (for pharmacy detail scenario)
  this.selectedPharmacy = {
    id: '1',
    name: 'Pharmacy One',
    latitude: 40.73061,
    longitude: -73.935242
  };

  // Logic to set options based on selectedPharmacy or multiple pharmacies
  if (this.selectedPharmacy) {
    this.options = {
      center: {
        lat: this.selectedPharmacy.latitude,
        lng: this.selectedPharmacy.longitude
      },
      zoom: 15,
      markers: [
        {
          position: {
            lat: this.selectedPharmacy.latitude,
            lng: this.selectedPharmacy.longitude
          }
        }
      ]
    };
  } else if (this.pharmacies.length > 0) {
    this.options = {
      center: {
        lat: this.pharmacies[0].latitude,
        lng: this.pharmacies[0].longitude
      },
      zoom: 12,
      markers: this.pharmacies.map((pharmacy) => ({
        position: {
          lat: pharmacy.latitude,
          lng: pharmacy.longitude
        }
      }))
    };
  } else {
    // Fallback default location
    this.options = {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 10,
      markers: []
    };
  }
}
