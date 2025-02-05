import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { PlPharmacyDetailActions } from './pl-pharmacy-detail.actions';

@Injectable()
export class PlPharmacyDetailEffects {
  private readonly actions$ = inject(Actions);

  // Effect to log when a pharmacy is selected
  logSelectedPharmacy$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PlPharmacyDetailActions.setSelectedPharmacy),
        tap(({ pharmacy }) => {
          console.log('🟢 Effect Triggered: Pharmacy Selected', pharmacy);
        })
      ),
    { dispatch: false } // No need to dispatch a new action, just logging
  );

  // Effect to clear pharmacy details when leaving the page
  clearPharmacyOnLeave$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PlPharmacyDetailActions.clearSelectedPharmacy),
        tap(() => {
          console.log('🔴 Effect Triggered: Pharmacy Cleared');
        })
      ),
    { dispatch: false }
  );
}
