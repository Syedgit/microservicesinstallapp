@if ((locationSearchStore.hideLocationSearch$ | async) === false) {
  <div
    class="location-search-container"
    [ngClass]="!!customizedClass ? customizedClass : ''">
    <lib-custom-type-ahead
      [label]="locationSearchStaticContent.heading"
      inputId="location-search-input"
      [loadingMessage]="locationSearchStaticContent.loadingMessage"
      [errorMessage]="locationSearchErrorText$ | async"
      [suggestionList]="locationSearchFacade.locationSuggestions$ | async"
      (search)="handleSearch($event)"
      (suggestionSelected)="handleSuggestionSelected($event)"
      (typeAheadBlur)="freeInputZipcodeSearch($event)"
      (inputCleared)="onInputClear()"
      [clearInput]="clearInput"
      [initialInputValue]="initialValue">
    </lib-custom-type-ahead>
    @if (showUseCurrentLocationBtn) {
      <ps-button
        class="uselocation-button"
        variant="text"
        size="sm"
        (click)="useMyLocation()"
        (keyPress)="useMyLocation()"
        [isFullWidth]="isUseCurrentLocationBtnFullWidth">
        @if (userCurrentLocationBtnLeadingImage) {
          <!-- eslint-disable-next-line @nx/workspace/no-setting-inner-html-in-templates -- content has been sanitized -->
          <div
            slot="leading"
            [innerHTML]="
              userCurrentLocationBtnLeadingImage | sanitizeHtml: true
            "></div>
        }
        {{ locationSearchStaticContent.currentLocationBtnTxt }}
      </ps-button>
    }
  </div>
}

config as page dedinations :


{
  "identifiers": {
    "platform": "web",
    "tenant": "caremark",
    "path": "/pharmacy/benefits/pharmacy-locator/search"
  },
  "payload": {
    "page": {
      "header": {
        "name": "CaremarkHeader"
      },
      "main": [
        {
          "name": "PlHeading",
          "inputs": {
            "headerText": "Find an in-network pharmacy",
            "breadcrumbMenuList": [
              {
                "pageName": "Home",
                "externalPath": "/memberportal/cmkdashboard"
              },
              {
                "pageName": "Find an in-network pharmacy",
                "pagePath": "pharmacy/benefits/pharmacy-locator/search"
              }
            ],
            "hideBreadcrumbForMweb": true
          }
        },
        {
          "name": "LocationSearch",
          "inputs": {
            "locationSearchStaticContent": {
              "heading": "ZIP code or location",
              "loadingMessage": "Searching locations",
              "currentLocationBtnTxt": "Use my current location",
              "searchErrorText": "Select an address from the drop down"
            },
            "customizedClass": "pl-search-flow"
          }
        },
        {
          "name": "PlPharmacyMap",
          "inputs": {
            "staticContent": {}
          }
        },
        {
          "name": "PlDisclaimers",
          "inputs": {}
        }
      ],
      "footer": {
        "name": "CaremarkFooter"
      },
      "metadata": {
        "title": "CVS Caremark - Pharmacy Locator search",
        "tealium": {
          "pageCategory": "plan_and_benefits",
          "pageIdentifier": "plan_and_benefits:pl"
        },
        "styles": {
          "margin": false
        },
        "publish": true,
        "authenticated": true
      }
    }
  }
}

