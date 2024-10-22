import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import {
  HttpService,
  mapResponseBody
} from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { filter, map, Observable, switchMap } from 'rxjs';

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
          switchMap((config) => {
            const requestData = {
              data: {
                idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
                lookupReq: request.data.lookupReq
              }
            };

            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${ssrAuth.access_token}`,
              'x-experienceId': b2bConfig.expId,
              'x-api-key': config.b2bApiKey
            });

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
