import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { Config } from '@digital-blocks/angular/core/util/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { catchError, filter, Observable, of, switchMap, throwError, take } from 'rxjs';

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
    return this.getOauthToken(useTransferSecret).pipe(
      switchMap((oauthResponse) => {
        const token = oauthResponse.access_token;
        return this.configFacade.config$.pipe(
          filter((config) => !!config && !isPlatformServer(this.platformId)),
          switchMap((config) =>
            this.makeB2BCall(request, token, config)
          )
        );
      }),
      catchError((error: unknown) => {
        return throwError(() => new Error('Failed to get member info and token'));
      })
    );
  }

  /**
   * Calls the OAuth endpoint to retrieve a token.
   * @param useTransferSecret Flag to determine whether to use transfer secret.
   */
  public getOauthToken(useTransferSecret = false): Observable<OauthResponse> {
    return this.configFacade.config$.pipe(
      take(1),
      switchMap((config) => {
        const headers = this.oAuthHeaders(config, useTransferSecret);
        const serviceUrl = `${b2bConfig.oAuth}`;

        return this.httpService
          .post<OauthResponse>(
            serviceUrl,
            b2bConfig.MOCK,
            { headers, withCredentials: true },
            this.oAuthRequestBody(),
            { maxRequestTime: 10_000 }
          )
          .pipe(
            mapResponseBody(),
            catchError((error: unknown) => {
              console.error('Error retrieving OAuth token:', error);
              return throwError(() => new Error('Failed to retrieve OAuth token'));
            })
          );
      })
    );
  }

  /**
   * Creates the headers for the OAuth call.
   * @param config The platform configuration.
   * @param useTransferSecret Flag to determine whether to use transfer secret.
   */
  private oAuthHeaders(config: Config, useTransferSecret: boolean): HttpHeaders {
    const secret = useTransferSecret ? config.b2bTransferSecret : config.apiSec;

    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: secret
    });
  }

  /**
   * Creates the request body for the OAuth token request.
   */
  private oAuthRequestBody(): URLSearchParams {
    const tokenPayload = new URLSearchParams();
    tokenPayload.set('grant_type', 'client_credentials');
    return tokenPayload;
  }

  /**
   * Makes the B2B call using the current OAuth access token.
   * Retries if the token is invalid (based on B2B response or 401).
   * @param request Member request object.
   * @param token OAuth access token.
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
            response?.statusDescription?.includes('Access token is no longer valid')
          ) {
            return this.getOauthToken(true).pipe(
              switchMap((newOauthResponse) =>
                this.makeB2BCall(request, newOauthResponse.access_token, config)
              )
            );
          }
          return of(response);
        }),
        catchError((error: unknown) => {
          console.error('Error in B2B call:', error);
          return throwError(() => new Error('Failed to make B2B call'));
        })
      );
  }
}
