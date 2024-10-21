import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { ConfigFacade, HttpService, SsrAuthFacade } from '@your-imports';
import { Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MemberAuthenticationService {
  private readonly ssrAuthFacade = inject(SsrAuthFacade);
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly platformId = inject(PLATFORM_ID);

  private tokenInfo: { token: string; expiresAt: number } | null = null;

  getMemberInfoAndToken(request: GetMemberInfoAndTokenRequest): Observable<GetMemberInfoAndTokenResponse> {
    return this.getValidSsrToken().pipe(
      switchMap(token => this.makeB2BCall(request, token)),
      retry({
        count: 1,
        delay: (error) => this.handleRetry(error)
      }),
      catchError(this.handleError)
    );
  }

  private getValidSsrToken(): Observable<string> {
    if (this.isTokenValid()) {
      return of(this.tokenInfo!.token);
    }

    return this.refreshToken();
  }

  private isTokenValid(): boolean {
    return !!this.tokenInfo && Date.now() < this.tokenInfo.expiresAt - 5 * 60 * 1000; // 5 minutes buffer
  }

  private refreshToken(): Observable<string> {
    return this.ssrAuthFacade.getSsrAuth(true).pipe(
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

  private handleRetry(error: any): Observable<never> {
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
