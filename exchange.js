import { Injectable, inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PharmacyDetail } from '../pl-pharmacy-detail.types';

import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';
import { PlPharmacyDetailFeature } from './pl-pharmacy-detail.reducer';

@Injectable({ providedIn: 'root' })
export class PlPharmacyDetailFacade {
  protected readonly store = inject(Store);

  public readonly selectedPharmacy$: Observable<PharmacyDetail | null> =
    this.store.pipe(select(PlPharmacyDetailFeature.selectSelectedPharmacy));

  public readonly loading$ = this.store.select(
    PlPharmacyDetailFeature.selectLoading
  );

  public readonly error$ = this.store.select(
    PlPharmacyDetailFeature.selectError
  );

  public setSelectedPharmacy(pharmacy: PharmacyDetail): void {
    this.store.dispatch(
      PlPharmacyDetailActions.setSelectedPharmacy({ pharmacy })
    );
  }

  clearSelectedPharmacy(): void {
    this.store.dispatch(PlPharmacyDetailActions.clearSelectedPharmacy());
  }
}
