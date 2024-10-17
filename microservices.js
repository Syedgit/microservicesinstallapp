import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { filter, first, switchMap, Observable, throwError, catchError } from 'rxjs';

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

  // Method to get the SSR token and then call B2B API
  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {

    // Step 1: Trigger the SSR Auth process to get a fresh token
    return this.ssrAuthFacade.getSsrAuth(useTransferSecret).pipe(
      // Step 2: Wait for the SSR Auth to complete and get the fresh token
      switchMap(() =>
        this.ssrAuthFacade.ssrAuth$.pipe(
          filter((ssrAuth): ssrAuth is OauthResponse => !!ssrAuth && !!ssrAuth.access_token),
          first(), // Ensure only the first valid token is taken
          switchMap((ssrAuth) => {
            // Step 3: After getting SSR token, proceed to the B2B call
            return this.callB2BApi(request, ssrAuth.access_token);
          })
        )
      )
    );
  }

  // Helper method to handle the B2B API call
  private callB2BApi(
    request: GetMemberInfoAndTokenRequest,
    ssrAccessToken: string
  ): Observable<GetMemberInfoAndTokenResponse> {
    return this.configFacade.config$.pipe(
      filter((config) => !!config && !isPlatformServer(this.platformId)),
      first(),
      switchMap((config) => {
        // Prepare the request data
        const requestData = {
          data: {
            idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
            lookupReq: request.data.lookupReq
          }
        };

        // Prepare the headers with the SSR token
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ssrAccessToken}`, // Use the passed token
          'x-experienceId': b2bConfig.expId,
          'x-api-key': b2bConfig['x-api-key']
        });

        // Step 4: Make the B2B API call using the token
        return this.httpService
          .post<GetMemberInfoAndTokenResponse>(
            `${config.environment.basePath}${b2bConfig.b2bUrl}`,
            b2bConfig.MOCK,
            {
              headers
            },
            requestData,
            {
              maxRequestTime: 10_000
            }
          )
          .pipe(
            mapResponseBody(),
            catchError((error) => {
              // Handle B2B call failure
              return throwError(() => error);
            })
          );
      })
    );
  }
}
