import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { catchError, filter, map, Observable, of, switchMap, throwError } from 'rxjs';
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
  private ssrAccessToken: string | null = null;
  private tokenExpirationTime: number | null = null;

  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    // Step 1: Get a valid SSR token
    return this.getValidSsrToken(useTransferSecret).pipe(
      switchMap((ssrAuthToken) => {
        if (!ssrAuthToken) {
          return throwError(() => new Error('Missing access token.'));
        }

        // Step 2: Use the token to make the B2B call
        return this.configFacade.config$.pipe(
          filter((config) => !!config && !isPlatformServer(this.platformId)),
          switchMap((config) => this.makeB2BCall(config, request, ssrAuthToken))
        );
      }),
      catchError((error) => {
        console.error('Error in getMemberInfoAndToken:', error);
        return throwError(() => new Error('Failed to get member info and token'));
      })
    );
  }

  private getValidSsrToken(useTransferSecret: boolean): Observable<string | null> {
    const tokenAgeInSeconds = 15 * 60; // 15 minutes (expires_in = 899)

    // Check if the SSR token exists and hasn't expired
    if (this.ssrAccessToken && this.tokenExpirationTime && Date.now() < this.tokenExpirationTime) {
      return of(this.ssrAccessToken);
    }

    // Retrieve new SSR token
    this.ssrAuthFacade.getSsrAuth(useTransferSecret); // Ensure triggering SSR Auth

    return this.ssrAuthFacade.ssrAuth$.pipe(
      map((ssrAuth) => {
        if (ssrAuth && ssrAuth.access_token && ssrAuth.expires_in) {
          // Convert expires_in to a number and use it to set expiration time
          const expiresInNumber = Number(ssrAuth.expires_in);
          if (!isNaN(expiresInNumber)) {
            this.ssrAccessToken = ssrAuth.access_token;
            this.tokenExpirationTime = Date.now() + expiresInNumber * 1000; // Set expiration in milliseconds
          }
        }
        return this.ssrAccessToken;
      })
    );
  }

  private makeB2BCall(
    config: any,
    request: GetMemberInfoAndTokenRequest,
    ssrAuthToken: string
  ): Observable<GetMemberInfoAndTokenResponse> {
    const requestData = {
      data: {
        idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
        lookupReq: request.data.lookupReq
      }
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ssrAuthToken}`, // Use the fresh SSR token
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
