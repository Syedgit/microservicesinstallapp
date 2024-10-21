import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { Observable, of, throwError } from 'rxjs';
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
  private ssrAccessToken: string | null = null;
  private tokenExpirationTime: number | null = null;

  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    return new Observable<GetMemberInfoAndTokenResponse>((observer) => {
      this.getValidSsrToken(useTransferSecret).subscribe({
        next: (ssrAuth) => {
          if (!ssrAuth || !ssrAuth.access_token) {
            observer.error(new Error('SSO Authentication failed: Missing access token.'));
            return;
          }

          this.ssrAccessToken = ssrAuth.access_token;

          this.configFacade.config$.subscribe({
            next: (config) => {
              if (isPlatformServer(this.platformId) || !config) {
                observer.error(new Error('Configuration missing or server-side environment detected.'));
                return;
              }

              this.makeB2BCall(config, request).subscribe({
                next: (response) => {
                  observer.next(response);
                  observer.complete();
                },
                error: (error) => {
                  observer.error(error);
                }
              });
            },
            error: (error) => {
              observer.error(error);
            }
          });
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  private getValidSsrToken(useTransferSecret: boolean): Observable<any> {
    if (this.ssrAccessToken && this.tokenExpirationTime && Date.now() < this.tokenExpirationTime) {
      return of({ access_token: this.ssrAccessToken });
    }

    return new Observable((observer) => {
      this.ssrAuthFacade.getSsrAuth(useTransferSecret).subscribe({
        next: (ssrAuth) => {
          if (ssrAuth && ssrAuth.access_token) {
            const expiresInSeconds = parseInt(ssrAuth.expires_in, 10) * 1000;
            this.tokenExpirationTime = Date.now() + expiresInSeconds;
            observer.next(ssrAuth);
            observer.complete();
          } else {
            observer.error(new Error('Failed to retrieve SSR auth token.'));
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  private makeB2BCall(
    config: any,
    request: GetMemberInfoAndTokenRequest
  ): Observable<GetMemberInfoAndTokenResponse> {
    const requestData = {
      data: {
        idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
        lookupReq: request.data.lookupReq
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.ssrAccessToken}`,
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
      .pipe(
        mapResponseBody(),
        map((response: GetMemberInfoAndTokenResponse) => response)
      );
  }
}
