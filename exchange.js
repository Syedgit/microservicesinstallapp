import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { catchError, filter, map, Observable, of, switchMap, throwError, take, tap } from 'rxjs';
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

  private tokenInfo: { token: string } | null = null;

  getMemberInfoAndToken(request: GetMemberInfoAndTokenRequest, useTransferSecret = true): Observable<GetMemberInfoAndTokenResponse> {
    console.log('getMemberInfoAndToken called with:', request);
    return this.getNewSsrAuthToken(useTransferSecret).pipe(
      switchMap(token => {
        if (!token) {
          console.error('Failed to obtain a valid SSR Auth token');
          return throwError(() => new Error('Failed to obtain a valid SSR Auth token'));
        }
        return this.makeB2BCall(request, token);
      }),
      catchError(error => {
        if (this.isInvalidTokenError(error)) {
          console.log('B2B call failed due to invalid token, refreshing token and retrying');
          return this.getNewSsrAuthToken(useTransferSecret).pipe(
            switchMap(newToken => {
              if (!newToken) {
                return throwError(() => new Error('Failed to refresh SSR Auth token'));
              }
              return this.makeB2BCall(request, newToken);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  private getNewSsrAuthToken(useTransferSecret: boolean): Observable<string | null> {
    console.log('Getting new SSR Auth token, useTransferSecret:', useTransferSecret);
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);
    return this.ssrAuthFacade.ssrAuth$.pipe(
      take(1),
      tap(ssrAuth => console.log('SSR Auth response received:', ssrAuth ? 'Valid response' : 'Null response')),
      map(ssrAuth => {
        if (ssrAuth?.access_token) {
          console.log('Valid token received from SSR Auth');
          this.tokenInfo = { token: ssrAuth.access_token };
          return this.tokenInfo.token;
        } else {
          console.error('Failed to obtain valid token from SSR Auth');
          return null;
        }
      }),
      catchError(error => {
        console.error('Error in getNewSsrAuthToken:', error);
        return of(null);
      })
    );
  }

  private makeB2BCall(request: GetMemberInfoAndTokenRequest, token: string): Observable<GetMemberInfoAndTokenResponse> {
    console.log('Making B2B call');
    return this.configFacade.config$.pipe(
      filter(config => !!config && !isPlatformServer(this.platformId)),
      take(1),
      tap(config => console.log('Config received for B2B call')),
      switchMap(config => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-experienceId': b2bConfig.expId,
          'x-api-key': config.b2bApiKey
        });

        console.log('B2B call headers set');
        return this.httpService.post<GetMemberInfoAndTokenResponse>(
          `${config.environment.basePath}${b2bConfig.b2bUrl}`,
          b2bConfig.MOCK,
          { headers },
          { data: { idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE', lookupReq: request.data.lookupReq } },
          { maxRequestTime: 10_000 }
        ).pipe(
          tap(() => console.log('B2B call made')),
          mapResponseBody()
        );
      })
    );
  }

  private isInvalidTokenError(error: any): boolean {
    return (
      (error instanceof HttpErrorResponse && error.status === 401) ||
      (error.statusCode === "1009" && error.statusDescription === "Access token is no longer valid")
    );
  }
}
