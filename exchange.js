import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { filter, map, Observable, switchMap, catchError, throwError } from 'rxjs';
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

  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    // Trigger SSR Auth to get the token
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);

    return this.ssrAuthFacade.ssrAuth$.pipe(
      filter(
        (ssrAuth): ssrAuth is OauthResponse =>
          !!ssrAuth && !!ssrAuth.access_token
      ),
      switchMap((ssrAuth) => {
        // Make the B2B call with the SSR token
        return this.makeB2BCall(ssrAuth.access_token, request).pipe(
          catchError((error) => {
            // If the error is due to an invalid token, retry with a new SSR token
            if (error.status === 401 || error.message.includes('invalid token')) {
              console.warn('B2B call failed due to invalid token, retrying...');
              return this.retryWithNewSsrToken(request, useTransferSecret);
            }
            return throwError(() => error); // Rethrow other errors
          })
        );
      })
    );
  }

  private makeB2BCall(token: string, request: GetMemberInfoAndTokenRequest): Observable<GetMemberInfoAndTokenResponse> {
    return this.configFacade.config$.pipe(
      filter((config) => !isPlatformServer(this.platformId) && !!config),
      switchMap((config) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-experienceId': b2bConfig.expId,
          'x-api-key': config.b2bApiKey
        });

        const requestData = {
          data: {
            idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
            lookupReq: request.data.lookupReq
          }
        };

        return this.httpService
          .post<GetMemberInfoAndTokenResponse>(
            `${config.environment.basePath}${b2bConfig.b2bUrl}`,
            b2bConfig.MOCK,
            { headers },
            requestData,
            { maxRequestTime: 10_000 }
          )
          .pipe(mapResponseBody());
      })
    );
  }

  // Retry the entire process with a new SSR token
  private retryWithNewSsrToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret: boolean
  ): Observable<GetMemberInfoAndTokenResponse> {
    // Trigger SSR Auth to get a new token
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);

    return this.ssrAuthFacade.ssrAuth$.pipe(
      filter(
        (ssrAuth): ssrAuth is OauthResponse =>
          !!ssrAuth && !!ssrAuth.access_token
      ),
      switchMap((ssrAuth) => {
        // Retry the B2B call with the new SSR token
        return this.makeB2BCall(ssrAuth.access_token, request);
      })
    );
  }
}
