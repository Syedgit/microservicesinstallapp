getMemberInfoAndToken(
  request: GetMemberInfoAndTokenRequest,
  useTransferSecret = true
): Observable<GetMemberInfoAndTokenResponse> {
  this.clearTokens(); // Clear cookies or tokens as needed

  // Ensure SSR Auth is fetched first
  this.ssrAuthFacade.getSsrAuth(useTransferSecret); // Invoke this directly since it doesn't return an observable

  // Now, we will wait for ssrAuth$ observable to emit the SSR auth token
  return this.ssrAuthFacade.ssrAuth$.pipe(
    filter((ssrAuth): ssrAuth is OauthResponse => !!ssrAuth && !!ssrAuth.access_token), // Ensure we have a valid token
    tap((ssrAuth) => {
      // Store the SSR access token in memory
      this.ssrAccessToken = ssrAuth.access_token;
    }),
    switchMap(() => {
      // Proceed to fetch config and make the B2B API call after SSR token is retrieved
      return this.configFacade.config$.pipe(
        filter((config) => !!config && !isPlatformServer(this.platformId)), // Ensure we have the config and it's not server-side
        switchMap((config) => {
          const requestData = {
            data: {
              idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
              lookupReq: request.data.lookupReq,
            },
          };

          const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.ssrAccessToken}`, // Use the stored SSR access token
            'x-experienceId': b2bConfig.expId,
            'x-api-key': b2bConfig['x-api-key'],
          });

          // Make the B2B API call
          return this.httpService
            .post<GetMemberInfoAndTokenResponse>(
              `${config.environment.basePath}${b2bConfig.b2bUrl}`,
              b2bConfig.MOCK,
              { headers },
              requestData,
              { maxRequestTime: 10_000 }
            )
            .pipe(
              mapResponseBody(),
              map((response: GetMemberInfoAndTokenResponse) => {
                return response;
              })
            );
        })
      );
    })
  );
}
