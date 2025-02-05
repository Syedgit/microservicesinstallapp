import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';

@Injectable()
export class PlPharmacyDetailEffects {
  private readonly actions$ = inject(Actions);

  // Effect to store selected pharmacy in session storage
  storeSelectedPharmacy$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PlPharmacyDetailActions.setSelectedPharmacy),
        tap(({ pharmacy }) => {
          sessionStorage.setItem('selectedPharmacy', JSON.stringify(pharmacy)); // Store in session storage
        })
      ),
    { dispatch: false }
  );

  // Effect to clear pharmacy details when leaving the page
  clearPharmacyOnLeave$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PlPharmacyDetailActions.clearSelectedPharmacy),
        tap(() => {
          sessionStorage.removeItem('selectedPharmacy'); // Remove from session storage
        })
      ),
    { dispatch: false }
  );
}
