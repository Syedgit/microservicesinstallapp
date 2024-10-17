import { Renderer2, RendererFactory2, Injectable, inject, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MemberAuthenticationService {
  private ssrAccessToken: string = ''; // In-memory token storage
  private renderer: Renderer2;

  private readonly ssrAuthFacade = inject(SsrAuthFacade);
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly rendererFactory = inject(RendererFactory2);

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    // Clear both tokens in memory and cookies
    this.clearTokens();

    return this.ssrAuthFacade.getSsrAuth(useTransferSecret).pipe(
      filter((ssrAuth): ssrAuth is OauthResponse => !!ssrAuth && !!ssrAuth.access_token),
      tap((ssrAuth) => {
        // Store fresh SSR token
        this.ssrAccessToken = ssrAuth.access_token;
      }),
      switchMap(() => {
        return this.configFacade.config$.pipe(
          filter((config) => !!config && !isPlatformServer(this.platformId)),
          switchMap((config) => {
            const requestData = {
              data: {
                idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
                lookupReq: request.data.lookupReq,
              },
            };

            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.ssrAccessToken}`,
              'x-experienceId': b2bConfig.expId,
              'x-api-key': b2bConfig['x-api-key'],
            });

            return this.httpService
              .post<GetMemberInfoAndTokenResponse>(
                `${config.environment.basePath}${b2bConfig.b2bUrl}`,
                b2bConfig.MOCK,
                {
                  headers,
                },
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

  private clearTokens(): void {
    this.ssrAccessToken = ''; // Clear in-memory token
    // Clear cookies with different paths
    this.deleteCookie('access_token', '/');        // Root path cookie
    this.deleteCookie('access_token', '/another'); // Specific path cookie (e.g., '/another')
  }

  private deleteCookie(name: string, path: string): void {
    const date = new Date(0).toUTCString();
    const cookieString = `${name}=; expires=${date}; path=${path};`;
    this.renderer.setProperty(document, 'cookie', cookieString);
  }
}
