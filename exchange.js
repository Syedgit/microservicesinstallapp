export class MemberAuthenticationEffects {
  // Inject dependencies
  private readonly actions$ = inject(Actions);
  private readonly memberAuthService = inject(MemberAuthenticationService);
  private readonly navigationService = inject(NavigationService);

  // Effect to handle API call and response
  public getMemberInfoAndToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MemberAuthenticationActions.getMemberInfoAndToken),
      switchMap(({ request, useTransferSecret }) =>
        this.memberAuthService.getMemberInfoAndToken(request, useTransferSecret).pipe(
          map((response) => 
            response.statusCode === '0000' 
              ? MemberAuthenticationActions.getMemberInfoAndTokenSuccess({ memberTokenResponse: response })
              : MemberAuthenticationActions.getMemberInfoAndTokenFailure({
                  error: { message: 'Authentication failed', details: response.statusDescription }
                })
          ),
          catchError((error) =>
            of(MemberAuthenticationActions.getMemberInfoAndTokenFailure({ error }))
          )
        )
      )
    )
  );

  // Effect to handle navigation on successful token retrieval
  public navigateOnSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(MemberAuthenticationActions.getMemberInfoAndTokenSuccess),
        tap(({ memberTokenResponse }) => {
          if (memberTokenResponse.access_token) {
            this.navigationService.navigate(
              '/pharmacy/benefits/transfer/current-prescriptions',
              { queryParamsHandling: 'preserve' },
              { navigateByPath: true }
            );
          }
        })
      ),
    { dispatch: false }
  );
}
