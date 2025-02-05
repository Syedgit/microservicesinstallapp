Search html

<ps-tabs>
      <ps-tab label="Retail" selected>
        <div
          class="pl-pharmacy-retail-tab-container"
          *ngIf="
            (plPharmacySearchStore.selectRetailFindPharmacy$ | async) !==
              undefined &&
            (plPharmacySearchStore.selectRetailFindPharmacy$ | async)?.length
          ">
          <p class="no-of-pharmacy-text">
            Showing {{ retailFindPharmacyDisplayed.length }} results near
            {{ selectedAddress?.postalCode }}
          </p>
          <ps-divider is-decorative="true"></ps-divider>
          <div class="pharmacy-retail-scrollable-block">
            <div
              class="pl-pharmacy-retail-pharmacy-tile"
              *ngFor="
                let pharmacyData of retailFindPharmacyDisplayed;
                let i = index
              ">
              <div class="pharmacy-tile-left-block">
                <h2 class="pharmacy-name">
                  {{ pharmacyData.pharmacyName | titlecase }}
                </h2>
                <div class="pharmacy-address-block">
                  <p class="pharmacy-address-line">
                    {{ pharmacyData.formattedAddresses?.line | titlecase }}
                  </p>
                  <p class="pharmacy-city-state-zip">
                    {{ pharmacyData.formattedAddresses?.city | titlecase }},
                    {{ pharmacyData.formattedAddresses?.state }}
                    {{ pharmacyData.formattedAddresses?.postalCode }}
                  </p>
                </div>
                <div
                  class="info-tag-block"
                  *ngIf="
                    pharmacyData?.ninetyDaySupplyNetwork ||
                    pharmacyData?.specialtyInd === 'Y'
                  ">
                  <ps-info-tag *ngIf="pharmacyData?.ninetyDaySupplyNetwork">{{
                    staticContent.networkSupplyInfoTag
                  }}</ps-info-tag>
                  <ps-info-tag *ngIf="pharmacyData?.specialtyInd === 'Y'">{{
                    staticContent.specialtyInfoTag
                  }}</ps-info-tag>
                </div>
                <div class="pharmacy-detail-link-block">
                  <ps-link
                    class="pharmacy-details-link"
                    link-href="javascript:void(0)"
                    (click)="loadPharmacyDetail(i)"
                    (keyPress)="loadPharmacyDetail(i)"
                    variant="standalone"
                    subtype="default"
                    weight="strong"
                    >Pharmacy details</ps-link
                  >
                </div>
              </div>

search component.ts 

export class PlPharmacySearchComponent implements OnInit {
  @Input() public staticContent = {
    networkSupplyInfoTag: '',
    specialtyInfoTag: ''
  };
  public findPharmacyRequest = {};
  public isDefaultAddressSearch = true;
  public retailFindPharmacyFromStore: IFormattedPharmaciesResponse[] = [];
  public retailFindPharmacyDisplayed: IFormattedPharmaciesResponse[] = [];
  public retailPharmacyShowMoreCount = 0;
  public selectedAddress: Address = {
    formattedAddress: ''
  };
  public pharmacyDetailIndex = 0;

 public loadPharmacyDetail(clickedPharmacyIndex: number): void {
    this.pharmacyDetailIndex = clickedPharmacyIndex;
  }

}
