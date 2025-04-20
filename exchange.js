// location-search.reducer.ts
export interface LocationSearchState {
  ...
  includeServiceAreaInLabel: boolean; // 👈 new
}

export const initialLocationSearchState: LocationSearchState = {
  ...
  includeServiceAreaInLabel: false
};

on(LocationSearchActions.updateLabelIncludeServiceArea, (state, { include }) => ({
  ...state,
  includeServiceAreaInLabel: include
}))


// location-search.actions.ts
export const updateLabelIncludeServiceArea = createAction(
  '[LocationSearch] Update Label Include Service Area',
  props<{ include: boolean }>()
);


// location-search.facade.ts
public readonly includeServiceAreaInLabel$ = this.store.select(
  LocationSearchFeature.selectIncludeServiceAreaInLabel
);

public setIncludeServiceAreaInLabel(include: boolean) {
  this.store.dispatch(LocationSearchActions.updateLabelIncludeServiceArea({ include }));
}

// pl-search-component.ts


if (this.filteredServiceAreaList.length > 0) {
  ...
  this.plPharmacySearchStore.updateLocationSuggestions({ ... });
  this.locationSearchFacade.setIncludeServiceAreaInLabel(true); // 👈 Set flag
}

// locationsearchComponent.ts

public includeServiceAreaInLabel$ = this.locationSearchFacade.includeServiceAreaInLabel$;

public computedHeading$ = combineLatest([
  this.includeServiceAreaInLabel$,
  of(this.locationSearchStaticContent.heading)
]).pipe(
  map(([includeServiceArea, originalHeading]) =>
    includeServiceArea ? `${originalHeading} or Service Area` : originalHeading
  )
);

// location.search.comp.html

<lib-custom-type-ahead
  [label]="computedHeading$ | async"
  ...
>
</lib-custom-type-ahead>

