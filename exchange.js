import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { filter, map, Observable, switchMap, tap } from 'rxjs';

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
  
  private ssrAuthToken: string | null = null;  // Store SSR token

  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    // Delete cookies before starting the authentication process
    this.deleteCookie('access_token', '/ssr-auth');
    this.deleteCookie('access_token', '/b2b');

    // Fetch the SSR auth token
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);

    return this.ssrAuthFacade.ssrAuth$.pipe(
      filter((ssrAuth): ssrAuth is OauthResponse => !!ssrAuth?.access_token),
      tap((ssrAuth) => {
        this.ssrAuthToken = ssrAuth.access_token; // Store SSR token
      }),
      switchMap(() =>
        this.configFacade.config$.pipe(
          filter((config) => !isPlatformServer(this.platformId) && !!config),
          switchMap((config) => this.makeB2BCall(config, request))
        )
      )
    );
  }

  private makeB2BCall(config: any, request: GetMemberInfoAndTokenRequest): Observable<GetMemberInfoAndTokenResponse> {
    const requestData = {
      data: {
        idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
        lookupReq: request.data.lookupReq
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getValidAccessToken()}`,  // Get valid token
      'x-experienceId': b2bConfig.expId,
      'x-api-key': b2bConfig['x-api-key']
    });

    return this.httpService
      .post<GetMemberInfoAndTokenResponse>(
        `${config.environment.basePath}${b2bConfig.b2bUrl}`,
        b2bConfig.MOCK,
        { headers },
        requestData,
        { maxRequestTime: 10_000 }
      )
      .pipe(mapResponseBody());
  }

  private getValidAccessToken(): string {
    // Check SSR and B2B tokens, fallback to in-memory token
    return (
      this.getCookie('access_token', '/ssr-auth') ||
      this.getCookie('access_token', '/b2b') ||
      this.ssrAuthToken ||
      ''
    );
  }

  // Delete a cookie by name and path
  private deleteCookie(name: string, path: string): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }

  // Simple cookie retrieval method
  private getCookie(name: string, path: string): string | null {
    return document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith(`${name}=`) && cookie.includes(`Path=${path}`))
      ?.split('=')[1] || null;
  }
}
