import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import {
  HttpService,
  mapResponseBody
} from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { filter, first, Observable, switchMap, tap } from 'rxjs';

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

  // Variable to track the in-memory SSR token
  private ssrAccessToken: string | null = null;

  // Method to get the SSR token and then call B2B API
  getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Observable<GetMemberInfoAndTokenResponse> {
    // Step 1: Clear any previous SSR token from memory
    this.ssrAccessToken = null;

    // Step 2: Trigger the SSR Auth process to get a fresh token
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);

    // Step 3: Wait for the SSR Auth to complete and get the fresh token
    return this.ssrAuthFacade.ssrAuth$.pipe(
      filter(
        (ssrAuth): ssrAuth is OauthResponse =>
          !!ssrAuth && !!ssrAuth.access_token
      ),
      first(), // Take only the first valid token
      tap((ssrAuth) => {
        // Store the access token in memory to prevent re-fetching
        this.ssrAccessToken = ssrAuth.access_token;
      }),
      switchMap(() => {
        // Step 4: Now that we have the SSR token in memory, proceed with the B2B call

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

            // Prepare the headers with the in-memory SSR token
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.ssrAccessToken}`, // Use the in-memory token here
              'x-experienceId': b2bConfig.expId,
              'x-api-key': b2bConfig['x-api-key']
            });

            // Step 5: Make the B2B API call using the token
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
                map((response: GetMemberInfoAndTokenResponse) => {
                  return response;
                })
              );
          })
        );
      })
    );
  }
}
