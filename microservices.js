import { ReplaySubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemberAuthenticationService {
  private readonly ssrAuthFacade = inject(SsrAuthFacade);
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly platformId = inject(PLATFORM_ID);

  private ssrAccessToken: ReplaySubject<string> = new ReplaySubject<string>(1); // Store the access token

  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    // Trigger SSR Auth without pipe, as it's just dispatching an action
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);

    // Subscribe to ssrAuth$ and emit the token into the ReplaySubject
    this.ssrAuthFacade.ssrAuth$.pipe(
      filter(
        (ssrAuth): ssrAuth is OauthResponse =>
          !!ssrAuth && !!ssrAuth.access_token
      ),
      first()
    ).subscribe((ssrAuth) => {
      // Store the SSR access token in the ReplaySubject
      this.ssrAccessToken.next(ssrAuth.access_token);
    });

    // Now make the B2B call after the SSR token is ready
    return this.ssrAccessToken.pipe(
      switchMap((token) => {
        return this.configFacade.config$.pipe(
          filter((config) => !isPlatformServer(this.platformId) && !!config),
          first(),
          switchMap((config) => {
            const requestData = {
              data: {
                idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
                lookupReq: request.data.lookupReq
              }
            };

            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // Use the SSR token
              'x-experienceId': b2bConfig.expId,
              'x-api-key': b2bConfig['x-api-key']
            });

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
  }
}
