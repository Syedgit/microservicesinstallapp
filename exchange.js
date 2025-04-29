filter component ts 

@Output() public applyFiltersAndSearch = new EventEmitter<void>();

public onSubmit(): void {
  this.plSelectFilterStore.setPlPharmacySearchFilterOptions(
    <PlSearchFilterDefaultValue>this.plSearchFilterForm.value
  );

  this.applyFiltersAndSearch.emit(); // 👈 Add this line

  this.closeFilterModal.emit(false);

  const details: Record<string, string> = {
    adobe_page_name: pageTags.adobe_page_name,
    notification_checkbox: this.plSelecedFilterNames(
      this.plSearchFilterForm.value as Record<string, boolean | string | null>
    )
      .toLowerCase()
      .replaceAll(' ', '_')
  };

  this.userAnalyticsFacade.linkEvent(
    'plan_and_benefits:pl:search_results_page:filters_modal:apply',
    details
  );
}


search 

<lib-pl-select-filter
  (closeFilterModal)="toggleModal($event)"
  (applyFiltersAndSearch)="onSearchClick()" <!-- 👈 Add this line -->
  [selectedSearchFiltersValue]="searchFiltersValue"
  [plPznInfo]="plPharmacySearchStore.plPznData$ | async"
  [memberPlanBenefitData]="memberPlanBenefitData"
  [memberPlanDetailsPrefPharmInd]="memberPlanDetailsPrefPharmInd">
</lib-pl-select-filter>
