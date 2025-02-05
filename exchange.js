import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { PlPharmacyDetailFeature } from './+state';

@NgModule({
  imports: [
    // EffectsModule.forFeature([PlPharmacyDetailEffects]),
    StoreModule.forFeature(PlPharmacyDetailFeature)
  ]
})
export class PlPharmacyDetailModule {}
