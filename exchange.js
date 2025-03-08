import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlPharmacyContentSpotFacade } from '../store/pl-pharmacy-content-spot.facade';
import { SpotRequest } from '../store/pl-pharmacy-content-spot.actions';

@Component({
  selector: 'app-pl-pharmacy-content',
  templateUrl: './pl-pharmacy-content.component.html',
  styleUrls: ['./pl-pharmacy-content.component.scss'],
  standalone: true,
  imports: [CommonModule] // Add additional dependencies if needed
})
export class PlPharmacyContentComponent implements OnInit {
  private readonly plPharmacyFacade = inject(PlPharmacyContentSpotFacade);

  public plPharmacyContentSpots$ = this.plPharmacyFacade.plPharmacyContentSpots$; // Observable for data
  public loading$ = this.plPharmacyFacade.loading$; // Loading state
  public error$ = this.plPharmacyFacade.error$; // Error state

  ngOnInit(): void {
    const spots: SpotRequest[] = [
      { spotName: 'headerSpot' },
      { spotName: 'bodySpot' },
      { spotName: 'promoSpot' }
    ];

    this.plPharmacyFacade.getPlPharmacyContentSpots(spots);
  }
}
