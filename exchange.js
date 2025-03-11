public getPlPharmacyContentSpots$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(PlPharmacyContentSpotActions.getPlPharmacyContentSpots),
    tap((action) => console.log('🟡 Effects - Full Action Object:', action)), // Debug log
    switchMap((action) => {
      console.log('🟡 Effects - Extracted cmsSpots:', action.cmsSpots); // Debug log

      if (!action.cmsSpots || action.cmsSpots.length === 0) {
        console.error('🔴 Effects - Error: cmsSpots is empty or undefined!');
        return of(PlPharmacyContentSpotActions.getPlPharmacyContentSpotsFailure({
          error: errorMessage(this.errorTag, 'cmsSpots is empty or undefined!')
        }));
      }

      return this.getPlPageSpotsService.fetchMultiplePlPageContents(action.cmsSpots).pipe(
        map((spotData) => {
          console.log('✅ Effects - API Response:', spotData);
          return PlPharmacyContentSpotActions.getPlPharmacyContentSpotsSuccess({
            plPharmacyContentSpots: spotData
          });
        }),
        catchError((error: unknown) => {
          console.error('🔴 Effects - Error:', error);
          return of(
            PlPharmacyContentSpotActions.getPlPharmacyContentSpotsFailure({
              error: errorMessage(this.errorTag, error)
            })
          );
        })
      );
    })
  );
});
