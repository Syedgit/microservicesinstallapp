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


search-component.ts 

  protected readonly userAnalyticsFacade = inject(UserAnalyticsFacade);
  private readonly locationSearchFacade = inject(LocationSearchFacade);
  public cmsResponse: cmsContent[] = [];
  public resultsAnnouncementSpot = '';
  public searchedAddressData: Address | undefined = undefined;
