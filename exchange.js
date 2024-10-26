import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { Config } from '@digital-blocks/angular/core/util/config';
import {
  HttpService,
  mapResponseBody
} from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import {
  catchError,
  filter,
  Observable,
  of,
  switchMap,
  throwError,
  take
} from 'rxjs';

import {
  GetMemberInfoAndTokenRequest,
  GetMemberInfoAndTokenResponse,
  OauthResponse
} from '../+state/member-authentication.interfaces';

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
          switchMap((config) =>
            this.makeB2BCall(request, ssrAuth.access_token, config)
          )
        );
      }),
      catchError((error: unknown) => {
        return throwError(
          () => new Error('Failed to get member info and token')
        );
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
    config: Config
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
        { maxRequestTime: 20_000 }
      )
      .pipe(
        mapResponseBody(),
        switchMap((response: GetMemberInfoAndTokenResponse) => {
          if (
            response?.statusCode === '1009' ||
            response?.statusDescription.includes(
              'Access token is no longer valid'
            )
          ) {
            return this.retrySsrAuthAndB2B(request);
          }

          return of(response);
        })
      );
  }

  /**
   * Helper method to retry the SSR Auth and B2B call.
   * @param request Member request object.
   */
  public retrySsrAuthAndB2B(
    request: GetMemberInfoAndTokenRequest
  ): Observable<GetMemberInfoAndTokenResponse> {
    this.ssrAuthFacade.getSsrAuth(true);

    return this.ssrAuthFacade.ssrAuth$.pipe(
      filter(
        (ssrAuth): ssrAuth is OauthResponse =>
          !!ssrAuth && !!ssrAuth.access_token
      ),
      take(1),
      switchMap((ssrAuth) =>
        this.configFacade.config$.pipe(
          filter((config) => !!config),
          take(1),
          switchMap((config) =>
            this.makeB2BCall(request, ssrAuth.access_token, config)
          )
        )
      )
    );
  }
}
