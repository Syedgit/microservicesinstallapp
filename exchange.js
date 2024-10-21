import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { catchError, filter, map, Observable, of, switchMap, throwError } from 'rxjs';
import { GetMemberInfoAndTokenRequest, GetMemberInfoAndTokenResponse } from '../+state/member-authentication.interfaces';
import { b2bConfig } from './member-authentication.config';

@Injectable({
  providedIn: 'root'
})
export class MemberAuthenticationService {
  private readonly ssrAuthFacade = inject(SsrAuthFacade);
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly platformId = inject(PLATFORM_ID);
  private ssrAccessToken: string | null = null;
  private tokenExpirationTime: number | null = null;

  /**
   * Retrieves member info and token.
   * @param request Member request object.
   * @param useTransferSecret Flag to determine whether to use transfer secret.
   */
  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    // Call the getValidSsrToken method to handle SSR auth and token expiration
    return this.getValidSsrToken(useTransferSecret).pipe(
      switchMap((ssrToken) => {
        if (!ssrToken) {
          return throwError(() => new Error('SSO Authentication failed: Missing access token.'));
        }
        this.ssrAccessToken = ssrToken;

        return this.configFacade.config$.pipe(
          filter((config) => !!config && !isPlatformServer(this.platformId)),
          // Step 4: Make the B2B call with the fresh SSR token
          switchMap((config) => this.makeB2BCall(config, request))
        );
      }),
      catchError((error) => {
        console.error('Error in getMemberInfoAndToken:', error);
        return throwError(() => new Error('Failed to get member info and token'));
      })
    );
  }

  /**
   * Retrieves and validates the SSR token, considering expiration.
   * @param useTransferSecret Flag to determine whether to use transfer secret.
   */
  private getValidSsrToken(useTransferSecret: boolean): Observable<string | null> {
    const tokenAgeInSeconds = 15 * 60; // 15 minutes (expires_in = 899)
    
    // Check if the SSR token exists and hasn't expired
    if (this.ssrAccessToken && this.tokenExpirationTime && Date.now() < this.tokenExpirationTime) {
      return of(this.ssrAccessToken);  // Return token string
    }

    // Retrieve new SSR token from SSR Auth Facade by subscribing to ssrAuth$
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);
    
    return this.ssrAuthFacade.ssrAuth$.pipe(
      map((ssrAuth) => {
        if (ssrAuth && ssrAuth.access_token && ssrAuth.expires_in) {
          this.ssrAccessToken = ssrAuth.access_token;
          this.tokenExpirationTime = Date.now() + ssrAuth.expires_in * 1000;
        }
        return this.ssrAccessToken;  // Return token string
      })
    );
  }

  /**
   * Makes the B2B call using the current SSR access token.
   * @param config Configuration object.
   * @param request Member request object.
   */
  private makeB2BCall(config: any, request: GetMemberInfoAndTokenRequest): Observable<GetMemberInfoAndTokenResponse> {
    const requestData = {
      data: {
        idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
        lookupReq: request.data.lookupReq
      }
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.ssrAccessToken}`, // Use the fresh SSR token
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
        map((response: GetMemberInfoAndTokenResponse) => response)
      );
  }
}
