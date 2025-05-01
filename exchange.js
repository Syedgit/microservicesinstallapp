<ps-link
  class="pharmacy-details-link"
  [link-href]="getPharmacyDetailsUrl()"
  (click)="loadPharmacyDetail(i, pharmacyData)">
  Pharmacy details
</ps-link>

import { Router } from '@angular/router';

constructor(private router: Router) {}

getPharmacyDetailsUrl(): string {
  return this.router.serializeUrl(
    this.router.createUrlTree(['/pharmacy/benefits/pharmacy-locator/pharmacy-details'])
  );
}


