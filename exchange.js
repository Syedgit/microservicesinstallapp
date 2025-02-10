search html

<div class="search-pharmacy-container">
  <div class="search-filters">
    <h2>Find a Pharmacy</h2>
    <input
      type="text"
      placeholder="Enter ZIP Code or Address"
      [(ngModel)]="searchQuery"
      (input)="onSearchChange()"
    />
  </div>

  <div class="search-results">
    <div
      class="pharmacy-card"
      *ngFor="let pharmacy of pharmacies$ | async"
      (click)="viewPharmacyDetail(pharmacy)"
    >
      <h3>{{ pharmacy.pharmacyName }}</h3>
      <p>{{ pharmacy.addresses.line[0] }}, {{ pharmacy.addresses.city }}</p>
    </div>
  </div>

  <!-- Reusable Google Map Directive -->
  <div
    utilGoogleMaps
    [options]="mapOptions"
    [mapHeight]="'400px'"
  ></div>
</div>


import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Pharmacy,
  SearchPharmacyFacade
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/search-pharmacy';
import { PlPharmacyDetailFacade } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';

@Component({
  selector: 'app-search-pharmacy',
  templateUrl: './search-pharmacy.component.html',
  styleUrls: ['./search-pharmacy.component.scss']
})
export class SearchPharmacyComponent implements OnInit {
  pharmacies$: Observable<Pharmacy[]> = this.searchFacade.pharmacies$;
  searchQuery: string = '';
  mapOptions: any;

  constructor(
    private searchFacade: SearchPharmacyFacade,
    private pharmacyDetailFacade: PlPharmacyDetailFacade
  ) {}

  ngOnInit(): void {
    this.searchFacade.loadPharmacies();
    this.pharmacies$.subscribe((pharmacies) => {
      this.updateMapPins(pharmacies);
    });
  }

  onSearchChange(): void {
    this.searchFacade.searchPharmacies(this.searchQuery);
  }

  viewPharmacyDetail(pharmacy: Pharmacy): void {
    this.pharmacyDetailFacade.setSelectedPharmacy(pharmacy);
  }

  updateMapPins(pharmacies: Pharmacy[]): void {
    const markers = pharmacies.map((pharmacy) => ({
      lat: pharmacy.latitude,
      lng: pharmacy.longitude
    }));

    this.mapOptions = {
      center: markers[0] || { lat: 0, lng: 0 },
      zoom: 12,
      markers
    };
  }
}


pharmacy detail 

<div class="pharmacy-detail-container">
  <div class="pharmacy-info">
    <h2>{{ selectedPharmacy?.pharmacyName }}</h2>
    <p>{{ selectedPharmacy?.addresses.line[0] }}</p>
    <p>{{ selectedPharmacy?.addresses.city }}, {{ selectedPharmacy?.addresses.state }}</p>
    <p>Phone: {{ selectedPharmacy?.addresses.phoneNumber }}</p>
  </div>

  <!-- Map with pushpin for selected pharmacy -->
  <div
    utilGoogleMaps
    [options]="mapOptions"
    [mapHeight]="'400px'"
  ></div>
</div>


import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PlPharmacyDetailFacade } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';
import { Pharmacy } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pharmacy-detail';

@Component({
  selector: 'app-pharmacy-detail',
  templateUrl: './pharmacy-detail.component.html',
  styleUrls: ['./pharmacy-detail.component.scss']
})
export class PharmacyDetailComponent implements OnInit {
  selectedPharmacy$: Observable<Pharmacy | null> =
    this.pharmacyDetailFacade.selectedPharmacy$;
  selectedPharmacy: Pharmacy | null = null;
  mapOptions: any;

  constructor(private pharmacyDetailFacade: PlPharmacyDetailFacade) {}

  ngOnInit(): void {
    this.selectedPharmacy$.subscribe((pharmacy) => {
      if (pharmacy) {
        this.selectedPharmacy = pharmacy;
        this.mapOptions = {
          center: { lat: pharmacy.latitude, lng: pharmacy.longitude },
          zoom: 15,
          markers: [{ lat: pharmacy.latitude, lng: pharmacy.longitude }]
        };
      }
    });
  }
}
