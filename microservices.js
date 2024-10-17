@Injectable({
  providedIn: 'root'
})
export class MemberAuthenticationService {
  private readonly ssrAuthFacade = inject(SsrAuthFacade);
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly platformId = inject(PLATFORM_ID);

  private ssrAccessToken: string | null = null;

  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    // Trigger SSR Auth first
    return this.ssrAuthFacade.getSsrAuth(useTransferSecret).pipe(
      // Wait for SSR Auth observable to emit a valid token
      switchMap(() => {
        return this.ssrAuthFacade.ssrAuth$.pipe(
          filter(
            (ssrAuth): ssrAuth is OauthResponse =>
              !!ssrAuth && !!ssrAuth.access_token
          ),
          first(), // Ensure we get the first valid token
          switchMap((ssrAuth) => {
            // Store the SSR access token
            this.ssrAccessToken = ssrAuth.access_token;

            // Now, after getting the SSR access token, proceed with config$
            return this.configFacade.config$.pipe(
              filter((config) => !isPlatformServer(this.platformId) && !!config),
              first(), // Take the first valid config
              switchMap((config) => {
                const requestData = {
                  data: {
                    idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
                    lookupReq: request.data.lookupReq
                  }
                };

                const headers = new HttpHeaders({
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.ssrAccessToken}`, // Use the SSR token here
                  'x-experienceId': b2bConfig.expId,
                  'x-api-key': b2bConfig['x-api-key']
                });

                // Make the B2B API call only after SSR Auth has completed
                return this.httpService
                  .post<GetMemberInfoAndTokenResponse>(
                    `${config.environment.basePath}${b2bConfig.b2bUrl}`,
                    b2bConfig.MOCK,
                    {
                      headers
                    },
                    requestData,
                    {
                      maxRequestTime: 10_000
                    }
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
      })
    );
  }
}
