<div class="pharmacy-detail-container" *ngIf="selectedPharmacy">
  <div class="pharmacy-info">
    <!-- Pharmacy Name -->
    <h2>{{ selectedPharmacy.pharmacyName }}</h2>

    <!-- Address & Phone Number -->
    <div class="pharmacy-address">
      <p *ngIf="selectedPharmacy.addresses">
        📍 {{ selectedPharmacy.addresses.line.join(', ') }}, 
        {{ selectedPharmacy.addresses.city }}, 
        {{ selectedPharmacy.addresses.state }} - 
        {{ selectedPharmacy.addresses.postalCode }}
      </p>
      <p *ngIf="selectedPharmacy.addresses.phoneNumber">
        📞 Phone: {{ selectedPharmacy.addresses.phoneNumber }}
      </p>
    </div>

    <!-- Pharmacy Hours -->
    <div class="pharmacy-hours" *ngIf="selectedPharmacy.pharmacyHours">
      <h3>Operating Hours</h3>
      <ul>
        <li *ngFor="let hour of selectedPharmacy.pharmacyHours.dayHours">
          <strong>{{ hour.day | titlecase }}:</strong> {{ hour.hours }}
        </li>
      </ul>
    </div>

    <!-- Features -->
    <div class="pharmacy-features">
      <h3>Features</h3>
      <ul>
        <li *ngIf="selectedPharmacy.open24hours">🏪 Open 24 Hours</li>
        <li *ngIf="selectedPharmacy.nintyDayRetail">💊 90-Day Supply Available</li>
        <li *ngIf="selectedPharmacy.specialtyInd === 'Y'">⭐ Specialty Pharmacy</li>
        <li *ngIf="selectedPharmacy.prefPharmInd">🏆 Preferred Pharmacy</li>
        <li *ngIf="selectedPharmacy.physicalDisabilityInd === 'Y'">♿ Accessible</li>
      </ul>
    </div>

    <!-- Website Link -->
    <a *ngIf="selectedPharmacy.websiteURL" [href]="selectedPharmacy.websiteURL" target="_blank">
      🌐 Visit Website
    </a>
  </div>

  <!-- Right Side: Map -->
  <div class="pharmacy-map">
    <iframe 
      width="100%" 
      height="350" 
      frameborder="0" 
      style="border:0"
      [src]="'https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=' 
      + selectedPharmacy.latitude + ',' + selectedPharmacy.longitude" 
      allowfullscreen>
    </iframe>
  </div>
</div>


css

.pharmacy-detail-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 20px;
}

.pharmacy-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pharmacy-map {
  flex: 1;
  max-width: 450px;
}
