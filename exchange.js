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
