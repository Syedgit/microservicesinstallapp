pharmacy-detail action

import { createActionGroup, props } from '@ngrx/store';
import { PharmacyDetail } from './pharmacy-detail.interface';

export const PlPharmacyDetailActions = createActionGroup({
  source: 'PharmacyDetail',
  events: {
    'Set Selected Pharmacy': props<{ pharmacy: PharmacyDetail }>(),
    'Clear Selected Pharmacy': props<{}>()
  }
});


Pharmacy-Detail Reducer

import { createFeature, createReducer, on } from '@ngrx/store';
import { PlPharmacyDetailActions } from './pharmacy-detail.actions';
import { PharmacyDetail } from './pharmacy-detail.interface';

export interface PharmacyDetailState {
  selectedPharmacy: PharmacyDetail | null;
}

export const initialState: PharmacyDetailState = {
  selectedPharmacy: null
};

export const pharmacyDetailReducer = createReducer(
  initialState,
  on(PlPharmacyDetailActions.setSelectedPharmacy, (state, { pharmacy }) => ({
    ...state,
    selectedPharmacy: pharmacy
  })),
  on(PlPharmacyDetailActions.clearSelectedPharmacy, (state) => ({
    ...state,
    selectedPharmacy: null
  }))
);

export const PharmacyDetailFeature = createFeature({
  name: 'pharmacyDetail',
  reducer: pharmacyDetailReducer
});

Pharmacy Detail Facade

import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PharmacyDetailState, PharmacyDetailFeature } from './pharmacy-detail.reducer';
import { PlPharmacyDetailActions } from './pharmacy-detail.actions';
import { PharmacyDetail } from './pharmacy-detail.interface';

@Injectable({ providedIn: 'root' })
export class PharmacyDetailFacade {
  constructor(private readonly store: Store<PharmacyDetailState>) {}

  // Observable for selected pharmacy
  selectedPharmacy$: Observable<PharmacyDetail | null> = this.store.pipe(
    select(PharmacyDetailFeature.selectSelectedPharmacy)
  );

  // When a user clicks "View Details", save the pharmacy to state
  setSelectedPharmacy(pharmacy: PharmacyDetail): void {
    this.store.dispatch(PlPharmacyDetailActions.setSelectedPharmacy({ pharmacy }));
  }

  // Clear pharmacy data when leaving the page
  clearSelectedPharmacy(): void {
    this.store.dispatch(PlPharmacyDetailActions.clearSelectedPharmacy());
  }
}

Search Page Component

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyDetailFacade } from '../store/pharmacy-detail.facade';
import { PharmacyDetail } from '../store/pharmacy-detail.interface';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  pharmacies: PharmacyDetail[] = [
    {
      pharmacyNumber: '001',
      pharmacyName: 'ABC Pharmacy',
      nationalProviderId: '12345',
      addresses: { city: 'New York', state: 'NY', postalCode: '10001', phoneNumber: '123-456-7890' },
      distance: 1.2
    },
    {
      pharmacyNumber: '002',
      pharmacyName: 'XYZ Pharmacy',
      nationalProviderId: '67890',
      addresses: { city: 'Los Angeles', state: 'CA', postalCode: '90001', phoneNumber: '987-654-3210' },
      distance: 2.5
    }
  ];

  constructor(
    private pharmacyDetailFacade: PharmacyDetailFacade,
    private router: Router
  ) {}

  viewPharmacyDetails(pharmacy: PharmacyDetail): void {
    // Save selected pharmacy to store
    this.pharmacyDetailFacade.setSelectedPharmacy(pharmacy);

    // Navigate to the pharmacy details page
    this.router.navigate(['/pharmacy/pharmacy-locator/pharmacyDetails', pharmacy.pharmacyNumber]);
  }
}

Search Page Html 

<div *ngFor="let pharmacy of pharmacies">
  <h3>{{ pharmacy.pharmacyName }}</h3>
  <p>{{ pharmacy.addresses.city }}, {{ pharmacy.addresses.state }}</p>
  <p>Distance: {{ pharmacy.distance }} miles</p>
  <button (click)="viewPharmacyDetails(pharmacy)">View Details</button>
</div>


Pharmacy Detail Component

import { Component, OnInit } from '@angular/core';
import { PharmacyDetailFacade } from '../store/pharmacy-detail.facade';
import { PharmacyDetail } from '../store/pharmacy-detail.interface';

@Component({
  selector: 'app-pharmacy-detail',
  templateUrl: './pharmacy-detail.component.html',
  styleUrls: ['./pharmacy-detail.component.scss']
})
export class PharmacyDetailComponent implements OnInit {
  selectedPharmacy: PharmacyDetail | null = null;

  constructor(private pharmacyDetailFacade: PharmacyDetailFacade) {}

  ngOnInit(): void {
    this.pharmacyDetailFacade.selectedPharmacy$.subscribe((pharmacy) => {
      this.selectedPharmacy = pharmacy;
    });
  }
}

Pharmacy Detail html

<div *ngIf="selectedPharmacy; else noPharmacy">
  <h2>{{ selectedPharmacy.pharmacyName }}</h2>
  <p>Address: {{ selectedPharmacy.addresses.city }}, {{ selectedPharmacy.addresses.state }}</p>
  <p>Phone: {{ selectedPharmacy.addresses.phoneNumber }}</p>
  <p>Distance: {{ selectedPharmacy.distance }} miles</p>
</div>

<ng-template #noPharmacy>
  <p>No pharmacy selected. Go back to search.</p>
</ng-template>
