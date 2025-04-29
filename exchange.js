<div class="pl-pharmacy-search-container">
  <ps-tile border="outlined" class="pl-pharmacy-search-outer-title">
    <div class="pl-pharmacy-search-button-container">
      <ps-button
        class="pl-pharmacy-search-button"
        variant="solid"
        submit="false"
        is-full-width="true"
        (click)="onSearchClick()"
        (keyPress)="onSearchClick()"
        >Search</ps-button
      >
    </div>
    <ps-divider is-decorative="true"></ps-divider>
    @if (
      (plPharmacySearchStore.selectRetailFindPharmacy$ | async) ||
      (plPharmacySearchStore.selectMailFindPharmacy$ | async) ||
      (plPharmacySearchStore.selectFindpharmacyLoading$ | async)
    ) {
      @if (plPharmacySearchStore.selectFindpharmacyLoading$ | async) {
        <ps-tile>
          <util-spinning-loader
            [loading]="
              plPharmacySearchStore.selectFindpharmacyLoading$ | async
            "></util-spinning-loader>
        </ps-tile>
      } @else {
        <div class="filter-button-container">
          <ps-chip
            [isSelected]="!!selectedFiltersCount"
            (click)="toggleModal(true)">
            <svg
              slot="icon"
              aria-hidden="true"
              focusable="false"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none">
              <path
                d="M14.5064 2.10671C14.3864 1.87337 14.1664 1.76671 13.9131 1.76004H2.08642C1.83308 1.78004 1.62642 1.88004 1.49308 2.10671C1.35975 2.33337 1.39308 2.58004 1.52642 2.78671L5.99308 7.86671V13.6334C5.99308 14.0867 6.47308 14.3734 6.87308 14.1734L9.39308 12.8867C9.77975 12.6867 10.0331 12.2867 10.0331 11.84V7.86004L14.4731 2.80004C14.5931 2.58671 14.6197 2.34671 14.5064 2.12004V2.10671ZM9.37308 12.1734L6.66642 13.5134L6.65308 7.62004L2.07308 2.42671H13.9131L9.38642 7.58004L9.37308 12.1867V12.1734Z"
                fill="#262626" />
            </svg>
            Filter ({{ selectedFiltersCount }})
          </ps-chip>
        </div>
        <ps-tabs (ps-tabs-tab-click)="clickTab($event)">
          <ps-tab
            label="Retail"
            id="Retail"
            [attr.selected]="
              (plPharmacySearchStore.selectRetailFindPharmacy$ | async)
                ?.length ||
              (plPharmacySearchStore.selectMailFindPharmacy$ | async)
                ?.length === 0
                ? true
                : null
            ">
            <div class="pl-pharmacy-retail-tab-container">
              <div
                role="alert"
                aria-live="polite"
                aria-atomic="true"
                aria-describedby="noOfRetailPharmacyText"
                class="no-of-pharmacy-text">
                <p id="noOfRetailPharmacyText">
                  Showing {{ retailFindPharmacyDisplayed.length }}
                  {{
                    retailFindPharmacyDisplayed.length > 1
                      ? 'results'
                      : 'result'
                  }}
                  near
                  {{
                    searchedAddressData?.postalCode ||
                      searchedAddressData?.formattedAddress
                  }}
                </p>
                <p [innerHTML]="resultsAnnouncementSpot | sanitizeHtml"></p>
              </div>
              <ps-divider is-decorative="true"></ps-divider>
              <div
                class="pharmacy-retail-scrollable-block scrollable-block"
                *ngIf="
                  (plPharmacySearchStore.selectRetailFindPharmacy$ | async) !==
                    undefined &&
                    (plPharmacySearchStore.selectRetailFindPharmacy$ | async)
                      ?.length;
                  else retailFindPharmacyErrorTemplate
                ">
                <ol
                  role="list"
                  [attr.aria-label]="
                    'Showing ' +
                    retailFindPharmacyDisplayed.length +
                    ' results near ' +
                    (searchedAddressData?.postalCode ||
                      searchedAddressData?.formattedAddress)
                  ">
                  <li
                    role="listitem"
                    *ngFor="
                      let pharmacyData of retailFindPharmacyDisplayed;
                      let i = index
                    ">
                    <div
                      class="pl-pharmacy-retail-pharmacy-tile pharmacy-tile-container-block">
                      <div class="pharmacy-tile-left-block">
                        <h2 class="pharmacy-name">
                          {{ pharmacyData.pharmacyName | titlecase }}
                        </h2>
                        <div class="pharmacy-address-block">
                          <p class="pharmacy-address-line">
                            {{
                              pharmacyData.formattedAddresses?.line | titlecase
                            }}
                          </p>
                          <p class="pharmacy-city-state-zip">
                            {{
                              pharmacyData.formattedAddresses?.city | titlecase
                            }},
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
                          <ps-info-tag
                            *ngIf="pharmacyData?.ninetyDaySupplyNetwork"
                            >{{
                              staticContent.networkSupplyInfoTag
                            }}</ps-info-tag
                          >
                          <ps-info-tag
                            *ngIf="pharmacyData?.specialtyInd === 'Y'"
                            >{{ staticContent.specialtyInfoTag }}</ps-info-tag
                          >
                        </div>
                        <div class="retail-pharmacy-operational-info-block">
                          @if (
                            pharmacyData.pharmacyOperationalInfo
                              ?.isPharmacyOpenNow
                          ) {
                            <p>
                              <span class="retail-pharmacy-open-text"
                                >Open now</span
                              >,
                              {{
                                pharmacyData.pharmacyOperationalInfo
                                  ?.openCloseTimeText
                              }}
                            </p>
                          } @else {
                            <p>
                              <span class="retail-pharmacy-closed-text"
                                >Closed now</span
                              >
                              @if (
                                pharmacyData.pharmacyOperationalInfo
                                  ?.openCloseTimeText
                              ) {
                                <span
                                  class="retail-pharmacy-closed-display-content"
                                  >,
                                  {{
                                    pharmacyData.pharmacyOperationalInfo
                                      ?.openCloseTimeText
                                  }}</span
                                >
                              }
                            </p>
                          }
                        </div>
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
                      </div>
                      <div class="pharmacy-tile-right-block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none">
                          <path
                            d="M17.7002 3.20003C16.0902 1.83003 14.0702 1.11003 11.9902 1.09003C9.92018 1.09003 7.89018 1.82003 6.28018 3.20003C4.49018 4.71003 3.46018 6.93003 3.43018 9.28003C3.43018 10.62 3.84018 11.93 4.60018 13.04L11.2002 22.54C11.3902 22.79 11.6802 22.93 12.0002 22.91C12.3102 22.91 12.6102 22.79 12.8002 22.54L19.4002 13.04C20.1602 11.93 20.5702 10.62 20.5702 9.28003C20.5502 6.94003 19.5102 4.71003 17.7202 3.20003H17.7002ZM18.6302 12.51L11.9902 22.03L5.35018 12.51C4.69018 11.56 4.33018 10.42 4.33018 9.25003C4.36018 7.16003 5.30018 5.18003 6.90018 3.85003C8.33018 2.64003 10.1402 1.99003 11.9902 1.97003C13.8402 1.99003 15.6502 2.64003 17.0802 3.85003C18.6802 5.20003 19.6302 7.16003 19.6502 9.25003C19.6502 10.41 19.2902 11.54 18.6302 12.51Z"
                            fill="#1A1A19" />
                          <path
                            d="M11.99 11.77C13.4922 11.77 14.71 10.5522 14.71 9.05002C14.71 7.5478 13.4922 6.33002 11.99 6.33002C10.4878 6.33002 9.27002 7.5478 9.27002 9.05002C9.27002 10.5522 10.4878 11.77 11.99 11.77Z"
                            fill="#1A1A19" />
                        </svg>
                        <p class="distance-text">
                          {{ pharmacyData?.distance }} miles
                        </p>
                      </div>
                    </div>
                  </li>
                </ol>
                @if (
                  !!retailFindPharmacyDisplayed &&
                  retailFindPharmacyDisplayed.length &&
                  !!retailFindPharmacyFromStore &&
                  retailFindPharmacyFromStore.length > 5
                ) {
                  <div
                    class="pharmacy-retail-show-more-button-container show-more-button-container">
                    @if (
                      retailFindPharmacyDisplayed.length <
                      retailFindPharmacyFromStore.length
                    ) {
                      <ps-button
                        variant="text"
                        is-full-width="true"
                        class="pharmacy-retail-show-more-button"
                        (click)="
                          updateDisplayingRetailPharmacy(); addMapPins()
                        ">
                        {{ retailShowMoreButtonFormattedText }}
                      </ps-button>
                    } @else {
                      <p
                        class="pharmacy-retail-no-more-pharmacy-text no-more-pharmacy-text">
                        {{ staticContent.noMorePharmacyText }}
                      </p>
                    }
                  </div>
                }
              </div>
            </div>
            <ng-template #retailFindPharmacyErrorTemplate>
              <div
                class="retail-findpharmacy-error-container findpharmacy-error-container">
                <ps-important-note variant="info">
                  <h2 slot="heading">
                    {{ staticContent.retailFindPharmacyErrorHeading }}
                  </h2>
                  <p>
                    {{ staticContent.retailFindPharmacyErrorDescription }}
                  </p>
                </ps-important-note>
              </div>
            </ng-template>
          </ps-tab>
          <ps-tab
            [label]="mailPharmacyTabLabel"
            [id]="mailPharmacyTabLabel"
            [attr.selected]="
              (plPharmacySearchStore.selectRetailFindPharmacy$ | async)
                ?.length === 0 &&
              (plPharmacySearchStore.selectMailFindPharmacy$ | async)?.length
                ? true
                : null
            ">
            <div class="pl-pharmacy-mail-tab-container">
              <div
                role="alert"
                aria-live="polite"
                aria-atomic="true"
                aria-describedby="noOfMailPharmacyText"
                class="no-of-pharmacy-text">
                <p id="noOfMailPharmacyText">
                  Showing {{ mailFindPharmacyDisplayed.length }}
                  {{
                    mailFindPharmacyDisplayed.length > 1 ? 'results' : 'result'
                  }}
                  near
                  {{
                    searchedAddressData?.postalCode ||
                      searchedAddressData?.formattedAddress
                  }}
                </p>
                <p [innerHTML]="resultsAnnouncementSpot | sanitizeHtml"></p>
              </div>
              <ps-divider is-decorative="true"></ps-divider>
              <div
                class="pharmacy-mail-scrollable-block scrollable-block"
                *ngIf="
                  (plPharmacySearchStore.selectMailFindPharmacy$ | async) !==
                    undefined &&
                    (plPharmacySearchStore.selectMailFindPharmacy$ | async)
                      ?.length;
                  else mailFindPharmacyErrorTemplate
                ">
                <ol
                  role="list"
                  [attr.aria-label]="
                    'Showing ' +
                    mailFindPharmacyDisplayed.length +
                    ' results near ' +
                    (searchedAddressData?.postalCode ||
                      searchedAddressData?.formattedAddress)
                  ">
                  @for (
                    mailPharmacyData of mailFindPharmacyDisplayed;
                    track mailPharmacyData;
                    let i = $index
                  ) {
                    <li role="listitem">
                      <div
                        class="pl-pharmacy-mail-pharmacy-tile pharmacy-tile-container-block">
                        <h2 class="mail-pharmacy-name">
                          {{ mailPharmacyData.pharmacyName | titlecase }}
                        </h2>
                        @if (
                          mailPharmacyData?.formattedAddresses?.phoneNumber
                        ) {
                          <div class="pharmacy-address-block">
                            <p class="mail-pharmacy-phone-number">
                              {{
                                mailPharmacyData?.formattedAddresses
                                  ?.phoneNumber
                              }}
                            </p>
                          </div>
                        }
                        <div class="info-tag-block">
                          @if (mailPharmacyData.pharmacyLob === 'M') {
                            <ps-info-tag>{{
                              staticContent.networkSupplyInfoTag
                            }}</ps-info-tag>
                          }
                          @if (mailPharmacyData.pharmacyLob === 'S') {
                            <ps-info-tag>{{
                              staticContent.specialtyInfoTag
                            }}</ps-info-tag>
                          }
                        </div>
                        <div
                          class="mail-pharmacy-detail-link-block pharmacy-detail-link-block">
                          <ps-link
                            class="mail-pharmacy-details-link"
                            link-href="javascript:void(0)"
                            (click)="loadPharmacyDetail(i, mailPharmacyData)"
                            (keyPress)="loadPharmacyDetail(i, mailPharmacyData)"
                            variant="standalone"
                            subtype="default"
                            weight="strong"
                            >Pharmacy details</ps-link
                          >
                        </div>
                      </div>
                    </li>
                  }
                </ol>
                @if (
                  !!mailFindPharmacyDisplayed &&
                  mailFindPharmacyDisplayed.length &&
                  !!mailFindPharmacyFromStore &&
                  mailFindPharmacyFromStore.length > 5
                ) {
                  <div
                    class="pharmacy-mail-show-more-button-container show-more-button-container">
                    @if (
                      mailFindPharmacyDisplayed.length <
                      mailFindPharmacyFromStore.length
                    ) {
                      <ps-button
                        variant="text"
                        is-full-width="true"
                        class="pharmacy-mail-show-more-button"
                        (click)="updateDisplayingMailPharmacy()">
                        {{ mailShowMoreButtonFormattedText }}
                      </ps-button>
                    } @else {
                      <p
                        class="pharmacy-mail-no-more-pharmacy-text no-more-pharmacy-text">
                        {{ staticContent.noMorePharmacyText }}
                      </p>
                    }
                  </div>
                }
              </div>
            </div>
            <ng-template #mailFindPharmacyErrorTemplate>
              <div
                class="mail-findpharmacy-error-container findpharmacy-error-container">
                <ps-important-note variant="info">
                  <h2 slot="heading">
                    {{ staticContent.mailFindPharmacyErrorHeading }}
                  </h2>
                  <p>{{ staticContent.mailFindPharmacyErrorDescription }}</p>
                </ps-important-note>
              </div>
            </ng-template>
          </ps-tab>
        </ps-tabs>
      }
    }
  </ps-tile>
  <util-conditional-modal
    [showAsModal]="true"
    [heading]="staticContent.searchFilterHeading"
    [hasCloseButton]="false"
    size="lg">
    <lib-pl-select-filter
      (closeFilterModal)="toggleModal($event)"
      (applyFiltersAndSearch)="onSearchClick()"
      [selectedSearchFiltersValue]="searchFiltersValue"
      [plPznInfo]="plPharmacySearchStore.plPznData$ | async"
      [memberPlanBenefitData]="memberPlanBenefitData"
      [memberPlanDetailsPrefPharmInd]="
        memberPlanDetailsPrefPharmInd
      "></lib-pl-select-filter>
  </util-conditional-modal>
</div>
