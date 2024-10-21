import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { catchError, filter, map, Observable, of, retry, switchMap, throwError, take, tap } from 'rxjs';
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

  private tokenInfo: { token: string; expiresAt: number } | null = null;

  getMemberInfoAndToken(request: GetMemberInfoAndTokenRequest, useTransferSecret = true): Observable<GetMemberInfoAndTokenResponse> {
    console.log('getMemberInfoAndToken called with:', request);
    return this.getValidSsrToken(useTransferSecret).pipe(
      switchMap(token => {
        if (!token) {
          console.error('No valid token obtained');
          return throwError(() => new Error('Failed to obtain SSR token'));
        }
        return this.makeB2BCall(request, token).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              console.log('B2B call failed with 401, refreshing token and retrying');
              return this.refreshToken(useTransferSecret).pipe(
                switchMap(newToken => {
                  if (!newToken) {
                    return throwError(() => new Error('Failed to refresh token'));
                  }
                  return this.makeB2BCall(request, newToken);
                })
              );
            }
            return throwError(() => error);
          })
        );
      }),
      catchError(this.handleError)
    );
  }

  private getValidSsrToken(useTransferSecret: boolean): Observable<string | null> {
    console.log('getValidSsrToken called');
    if (this.isTokenValid()) {
      console.log('Using cached token');
      return of(this.tokenInfo!.token);
    }
    console.log('Refreshing token');
    return this.refreshToken(useTransferSecret);
  }

  private isTokenValid(): boolean {
    const isValid = !!this.tokenInfo && Date.now() < this.tokenInfo.expiresAt - 5 * 60 * 1000;
    console.log('Token validity check:', isValid);
    return isValid;
  }

  private refreshToken(useTransferSecret: boolean): Observable<string | null> {
    console.log('Refreshing token, useTransferSecret:', useTransferSecret);
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);
    return this.ssrAuthFacade.ssrAuth$.pipe(
      take(1),
      tap(ssrAuth => console.log('SSR Auth response:', ssrAuth)),
      map(ssrAuth => {
        if (ssrAuth?.access_token && ssrAuth.expires_in) {
          this.tokenInfo = {
            token: ssrAuth.access_token,
            expiresAt: Date.now() + Number(ssrAuth.expires_in) * 1000
          };
          console.log('New token set');
          return this.tokenInfo.token;
        }
        console.error('Failed to obtain token from SSR Auth');
        return null;
      }),
      catchError(error => {
        console.error('Error refreshing token:', error);
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

  private handleError(error: any): Observable<never> {
    console.error('Error in getMemberInfoAndToken:', error);
    return throwError(() => new Error('Failed to get member info and token'));
  }
}
