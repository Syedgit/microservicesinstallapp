 public loadPharmacyDetail(
    clickedPharmacyIndex: number,
    pharmacyData: IFormattedPharmaciesResponse
  ): void {
    this.pharmacyDetailIndex = clickedPharmacyIndex;
    this.plPharmacySearchStore.setSelectedPharmacy(
      pharmacyData as PharmacyDetail
    );
    this.navigationService.navigate(
      '/pharmacy/benefits/pharmacy-locator/pharmacy-details',
      { queryParamsHandling: 'preserve' },
      {
        navigateByPath: true
      }
    );
    this.plPharmacySearchStore.resetStateOnInputClear();
    if (pharmacyData.pharmacyLob == 'M' || pharmacyData.pharmacyLob == 'S') {
      this.plPharmacySearchStore.linkEvent(
        AdobeTaggingConstants.onClick_mail_details_link
      );
    } else if (pharmacyData.pharmacyLob == 'R')
      this.plPharmacySearchStore.linkEvent(
        AdobeTaggingConstants.onClick_retail_details_link
      );
  }


this is html 

<div
                          class="retail-pharmacy-detail-link-block pharmacy-detail-link-block">
                          <ps-link
                            class="pharmacy-details-link"
                            link-href="javascript:void(0)"
                            (click)="loadPharmacyDetail(i, pharmacyData)"
                            (keyPress)="loadPharmacyDetail(i, pharmacyData)"
                            variant="standalone"
                            subtype="default"
                            weight="strong"
                            >Pharmacy details</ps-link
                          >
                        </div>
