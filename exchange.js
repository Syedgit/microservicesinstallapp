<div class="pharmacy-detail-container" *ngIf="selectedPharmacy">
  <h2>{{ selectedPharmacy.pharmacyName }}</h2>

  <div class="pharmacy-address">
    <p *ngIf="selectedPharmacy.addresses">
      {{ selectedPharmacy.addresses.line.join(', ') }}, 
      {{ selectedPharmacy.addresses.city }}, 
      {{ selectedPharmacy.addresses.state }} - 
      {{ selectedPharmacy.addresses.postalCode }}
    </p>
    <p *ngIf="selectedPharmacy.addresses.phoneNumber">
      📞 Phone: {{ selectedPharmacy.addresses.phoneNumber }}
    </p>
  </div>

  <div class="pharmacy-hours" *ngIf="selectedPharmacy.pharmacyHours">
    <h3>Operating Hours</h3>
    <ul>
      <li *ngFor="let hour of selectedPharmacy.pharmacyHours.dayHours">
        <strong>{{ hour.day | titlecase }}:</strong> {{ hour.hours }}
      </li>
    </ul>
  </div>

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

  <div class="pharmacy-map">
    <h3>Location</h3>
    <iframe 
      width="100%" 
      height="250" 
      frameborder="0" 
      style="border:0"
      [src]="'https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=' 
      + selectedPharmacy.latitude + ',' + selectedPharmacy.longitude" 
      allowfullscreen>
    </iframe>
  </div>

  <a *ngIf="selectedPharmacy.websiteURL" [href]="selectedPharmacy.websiteURL" target="_blank">
    🌐 Visit Website
  </a>
</div>

