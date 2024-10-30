import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { Config } from '@digital-blocks/angular/core/util/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
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
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly platformId = inject(PLATFORM_ID);

  private b2bTransferApiSecret: string;
  private b2bApiKey: string;
  private basePath: string;

  constructor() {
    // Initialize configuration values
    this.configFacade.config$.pipe(
      filter((config) => !!config),
      take(1)
    ).subscribe((config: Config) => {
      this.b2bTransferApiSecret = config.b2bTransferApiSecret;
      this.b2bApiKey = config.b2bApiKey;
      this.basePath = config.environment.basePath;
    });
  }

  /**
   * Retrieves the OAuth token, then calls B2B with that token.
   * @param request Member request object.
   * @param useTransferSecret Flag to determine whether to use transfer secret.
   */
  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    return this.getOauthToken(useTransferSecret).pipe(
      switchMap((oAuthResponse) =>
        this.makeB2BCall(request, oAuthResponse.access_token)
      ),
      catchError((error: unknown) => {
        return throwError(() => new Error('Failed to get member info and token'));
      })
    );
  }

  /**
   * Calls the OAuth service to get the access token.
   * @param useTransferSecret Flag to determine if transfer secret is used.
   */
  private getOauthToken(useTransferSecret: boolean): Observable<OauthResponse> {
    const headers = this.createOAuthHeaders(useTransferSecret);
    const serviceUrl = useTransferSecret
      ? `${this.basePath}${b2bConfig.oAuth}`
      : `${this.basePath}/mcapi/oauth2/v2/token`;

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
        catchError((error) => {
          console.error('OAuth Token Retrieval Failed', error);
          return throwError(() => new Error('Failed to retrieve OAuth token'));
        })
      );
  }

  private createOAuthHeaders(useTransferSecret: boolean): HttpHeaders {
    const secret = useTransferSecret ? this.b2bTransferApiSecret : this.b2bApiKey;
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      authorization: secret
    });
  }

  private oAuthRequestBody(): URLSearchParams {
    const tokenPayload = new URLSearchParams();
    tokenPayload.set('grant_type', 'client_credentials');
    return tokenPayload;
  }

  /**
   * Makes the B2B call using the OAuth token.
   * @param request Member request object.
   * @param token OAuth token.
   */
  private makeB2BCall(
    request: GetMemberInfoAndTokenRequest,
    token: string
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
      'x-api-key': this.b2bApiKey
    });

    return this.httpService
      .post<GetMemberInfoAndTokenResponse>(
        `${this.basePath}${b2bConfig.b2bUrl}`,
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
            response?.statusDescription.includes('Access token is no longer valid')
          ) {
            return this.retryOAuthAndB2B(request);
          }

          return of(response);
        })
      );
  }

  /**
   * Helper method to retry the OAuth and B2B call.
   * @param request Member request object.
   */
  private retryOAuthAndB2B(
    request: GetMemberInfoAndTokenRequest
  ): Observable<GetMemberInfoAndTokenResponse> {
    return this.getOauthToken(true).pipe(
      switchMap((oAuthResponse) =>
        this.makeB2BCall(request, oAuthResponse.access_token)
      )
    );
  }
}
