import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { Observable, switchMap, take, tap, throwError, of, map } from 'rxjs';
import { GetMemberInfoAndTokenRequest, GetMemberInfoAndTokenResponse } from '../+state/member-authentication.interfaces';
import { b2bConfig } from './member-authentication.config';

@Injectable({
  providedIn: 'root'
})
export class MemberAuthenticationService {
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly ssrAuthFacade = inject(SsrAuthFacade);

  // Track the current SSR token and expiration time
  private ssrAccessToken: string | null = null;
  private tokenExpirationTime: number | null = null;

  /**
   * This method gets the member info and token by first ensuring that
   * a valid SSR Auth token is available and then making the B2B call.
   */
  getMemberInfoAndToken(request: GetMemberInfoAndTokenRequest, useTransferSecret = true): Observable<GetMemberInfoAndTokenResponse> {
    console.log('getMemberInfoAndToken called with:', request);
    
    // Step 1: Ensure valid SSR Auth token and then proceed with B2B call
    return this.getValidSsrToken(useTransferSecret).pipe(
      switchMap(ssrToken => {
        if (!ssrToken) {
          console.error('Failed to obtain valid SSR Auth token');
          return throwError(() => new Error('Failed to obtain valid SSR Auth token'));
        }

        console.log('SSR Token received, making B2B call');
        // Step 2: Make the B2B call using the SSR token
        return this.makeB2BCall(request, ssrToken);
      })
    );
  }

  /**
   * This method retrieves a valid SSR token, checking expiration if necessary.
   * @param useTransferSecret - whether to use the transfer secret.
   * @returns an Observable of the SSR token.
   */
  private getValidSsrToken(useTransferSecret: boolean): Observable<string | null> {
    const tokenAgeInSeconds = 15 * 60; // 15 minutes (expires_in = 899)
    
    // Check if the current SSR token is valid and hasn't expired
    if (this.ssrAccessToken && this.tokenExpirationTime && Date.now() < this.tokenExpirationTime) {
      console.log('Returning cached SSR token');
      return of(this.ssrAccessToken);
    }

    // Step 1: Trigger SSR Auth process to get a new token
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);
    
    // Step 2: Wait for SSR Auth token
    return this.ssrAuthFacade.ssrAuth$.pipe(
      take(1), // We only need the first emitted value
      map(ssrAuth => {
        if (ssrAuth && ssrAuth.access_token && ssrAuth.expires_in) {
          // Convert expires_in to a number and set the expiration time
          const expiresInNumber = Number(ssrAuth.expires_in);
          if (!isNaN(expiresInNumber)) {
            this.ssrAccessToken = ssrAuth.access_token;
            this.tokenExpirationTime = Date.now() + expiresInNumber * 1000; // Set expiration in milliseconds
            console.log('New SSR token cached with expiration time:', this.tokenExpirationTime);
          }
        }
        return this.ssrAccessToken;
      })
    );
  }

  /**
   * Makes the B2B call using the current SSR access token.
   * @param request - The member authentication request.
   * @param token - The SSR Auth token to use for the B2B call.
   * @returns an Observable of the B2B response.
   */
  private makeB2BCall(request: GetMemberInfoAndTokenRequest, token: string): Observable<GetMemberInfoAndTokenResponse> {
    return this.configFacade.config$.pipe(
      take(1), // Get the configuration once
      switchMap(config => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-experienceId': b2bConfig.expId,
          'x-api-key': config.b2bApiKey
        });

        console.log('B2B call headers set, making the call');
        return this.httpService.post<GetMemberInfoAndTokenResponse>(
          `${config.environment.basePath}${b2bConfig.b2bUrl}`,
          b2bConfig.MOCK,
          { headers },
          { data: { idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE', lookupReq: request.data.lookupReq } },
          { maxRequestTime: 20_000 }
        ).pipe(
          tap(() => console.log('B2B call completed')),
          mapResponseBody()
        );
      })
    );
  }
}
