import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { catchError, filter, map, Observable, of, switchMap, throwError, retryWhen, delay, take } from 'rxjs';
import { GetMemberInfoAndTokenRequest, GetMemberInfoAndTokenResponse, OauthResponse } from '../+state/member-authentication.interfaces';
import { b2bConfig } from './member-authentication.config';

@Injectable({
  providedIn: 'root'
})
export class MemberAuthenticationService {
  private readonly ssrAuthFacade = inject(SsrAuthFacade);
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Retrieves member info and token.
   * @param request Member request object.
   * @param useTransferSecret Flag to determine whether to use transfer secret.
   */
  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);

    return this.ssrAuthFacade.ssrAuth$.pipe(
      filter(
        (ssrAuth): ssrAuth is OauthResponse =>
          !!ssrAuth && !!ssrAuth.access_token
      ),
      switchMap((ssrAuth) => {
        return this.configFacade.config$.pipe(
          filter((config) => !isPlatformServer(this.platformId) && !!config),
          switchMap((config) => this.makeB2BCall(request, ssrAuth.access_token, config))
        );
      }),
      catchError((error) => {
        console.error('Error in getMemberInfoAndToken:', error);
        return throwError(() => new Error('Failed to get member info and token'));
      })
    );
  }

  /**
   * Makes the B2B call using the current SSR access token.
   * Retries if the token is invalid (based on B2B response or 401).
   * @param request Member request object.
   * @param token SSR access token.
   * @param config Configuration object.
   */
  private makeB2BCall(
    request: GetMemberInfoAndTokenRequest,
    token: string,
    config: any
  ): Observable<GetMemberInfoAndTokenResponse> {
    const requestData = {
      data: {
        idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
        lookupReq: request.data.lookupReq
      }
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-experienceId': b2bConfig.expId,
      'x-api-key': config.b2bApiKey
    });

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
        switchMap((response: GetMemberInfoAndTokenResponse) => {
          // Check if token is invalid
          if (response?.statusCode === '1009' || (response?.statusDesc && response.statusDesc.includes('no longer valid'))) {
            console.error('Invalid token, retrying...');
            // Retry by fetching new SSR Auth token
            return this.retrySsrAuthAndB2B(request);
          }
          return of(response); // Return the response if valid
        }),
        catchError((error) => {
          // Check for HTTP 401 Unauthorized and retry
          if (error.status === 401) {
            console.error('Unauthorized 401, retrying with new SSR token...');
            return this.retrySsrAuthAndB2B(request);
          }
          return throwError(error); // Rethrow the error if not related to token expiration
        })
      );
  }

  /**
   * Helper method to retry the SSR Auth and B2B call.
   * @param request Member request object.
   */
  private retrySsrAuthAndB2B(request: GetMemberInfoAndTokenRequest): Observable<GetMemberInfoAndTokenResponse> {
    // Retry by fetching a new SSR token
    this.ssrAuthFacade.getSsrAuth(true);
    
    return this.ssrAuthFacade.ssrAuth$.pipe(
      filter(
        (ssrAuth): ssrAuth is OauthResponse =>
          !!ssrAuth && !!ssrAuth.access_token
      ),
      take(1), // Take only the first valid token response
      switchMap((ssrAuth) => this.configFacade.config$.pipe(
        filter((config) => !!config),
        take(1),
        switchMap((config) => this.makeB2BCall(request, ssrAuth.access_token, config)) // Retry the B2B call with the new token
      ))
    );
  }
}
