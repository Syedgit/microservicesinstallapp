import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { catchError, filter, map, Observable, of, retry, switchMap, throwError } from 'rxjs';
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

  private tokenInfo: { token: string; expiresAt: number } | null = null;

  getMemberInfoAndToken(request: GetMemberInfoAndTokenRequest, useTransferSecret = true): Observable<GetMemberInfoAndTokenResponse> {
    return this.getValidSsrToken(useTransferSecret).pipe(
      switchMap(token => this.makeB2BCall(request, token)),
      retry({
        count: 1,
        delay: (error:unknown) => this.handleRetry(error)
      }),
      catchError(this.handleError)
    );
  }

  private getValidSsrToken(useTransferSecret: boolean): Observable<string> {
    if (this.isTokenValid()) {
      return of(this.tokenInfo!.token);
    }

    return this.refreshToken(useTransferSecret);
  }

  private isTokenValid(): boolean {
    return !!this.tokenInfo && Date.now() < this.tokenInfo.expiresAt - 5 * 60 * 1000;
  }

  private refreshToken(useTransferSecret:boolean): Observable<string> {
    this.ssrAuthFacade.getSsrAuth(useTransferSecret); 
    return this.ssrAuthFacade.ssrAuth$.pipe(
      map(ssrAuth => {
        if (ssrAuth?.access_token && ssrAuth.expires_in) {
          this.tokenInfo = {
            token: ssrAuth.access_token,
            expiresAt: Date.now() + Number(ssrAuth.expires_in) * 1000
          };
          return this.tokenInfo.token;
        }
        throw new Error('Failed to obtain SSR token');
      })
    );
  }

  private makeB2BCall(request: GetMemberInfoAndTokenRequest, token: string): Observable<GetMemberInfoAndTokenResponse> {
    return this.configFacade.config$.pipe(
      filter(config => !!config && !isPlatformServer(this.platformId)),
      switchMap(config => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-experienceId': b2bConfig.expId,
          'x-api-key': config.b2bApiKey
        });

        return this.httpService.post<GetMemberInfoAndTokenResponse>(
          `${config.environment.basePath}${b2bConfig.b2bUrl}`,
          b2bConfig.MOCK,
          { headers },
          { data: { idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE', lookupReq: request.data.lookupReq } },
          { maxRequestTime: 10_000 }
        ).pipe(mapResponseBody());
      })
    );
  }

  private handleRetry(error: any): Observable<null> {
    if (error.status === 401) {
      this.tokenInfo = null; // Force token refresh
      return of(null); // Retry after clearing token
    }
    return throwError(() => error);
  }

  private handleError(error: any): Observable<never> {
    console.error('Error in getMemberInfoAndToken:', error);
    return throwError(() => new Error('Failed to get member info and token'));
  }
}
