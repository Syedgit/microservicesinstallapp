service:

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

config:

export const b2bConfig = {
  MOCK: 'assets/pharmacy/member-authentication/mock-data/experience_api/member-authentication.json',
  b2bUrl: '/api/b2b/user/v1/token',
  oAuth: '/api/oauth2/v2/token'
  expId: '58e30ce4-7cef-4761-a082-11939da7704d'
};


SSrhttpService:

import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import {
  HttpSSRService,
  mapResponseBody
} from '@digital-blocks/angular/core/util/services';
import { Observable, tap } from 'rxjs';

import { OauthResponse } from '../oauth.type';

const MOCK_PATH = '/assets/pharmacy/shared/mock-data';

@Injectable({
  providedIn: 'root'
})
export class SsrAuthService {
  private readonly httpSSRService = inject(HttpSSRService);
  private readonly config = inject(ConfigFacade);
  private basePath = '/';
  private apiSec = '';
  private b2bTransferApiSecret = '';

  constructor() {
    this.config.config$.pipe(takeUntilDestroyed()).subscribe((config) => {
      this.basePath = config.environment.basePath;
      this.apiSec = config.b2bAuthApiSecret;
      this.b2bTransferApiSecret = config.b2bTransferApiSecret;
    });
  }

  public getOauthToken(useTransferSecret = false): Observable<OauthResponse> {
    const headers = this.oAuthHeaders(useTransferSecret);
    const serviceUrl = useTransferSecret
      ? this.basePath + '/api/oauth2/v2/token'
      : this.basePath + '/mcapi/oauth2/v2/token';

    return this.httpSSRService
      .universalPostRequest<OauthResponse>(
        serviceUrl,
        CONFIG.mock,
        {
          headers,
          withCredentials: true
        },
        this.oAuthRequestBody(),
        {
          maxRequestTime: 10_000
        }
      )
      .pipe(
        tap((response) => {
          if (response.status !== 200) {
            throw new Error('Received bad API response.');
          }
        }),
        mapResponseBody()
      );
  }

  private oAuthHeaders(useTransferSecret: boolean) {
    const secret = useTransferSecret ? this.b2bTransferApiSecret : this.apiSec;

    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      authorization: secret
    });
  }

  private oAuthRequestBody() {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any --  @todo - fix any type and remove this disable.  Disabled while updating & fixing lint rules. Using 'any' as a type removes numerous benefits of typescript, makes the code less readable, difficult to debug, and harder to maintain at scale.  Please reach out if assistance is needed to avoid this. */
    const tokenpayload: any = new URLSearchParams();

    tokenpayload.set('grant_type', 'client_credentials');

    return tokenpayload;
  }
}

/* eslint-disable no-secrets/no-secrets -- Temporarily configured for QA2 until permanent approach from blocks team */
export const CONFIG = {
  mock: `${MOCK_PATH}/oauth2.json`
};


 
