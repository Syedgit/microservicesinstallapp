import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { Observable, switchMap, take, tap } from 'rxjs';
import { GetMemberInfoAndTokenRequest, GetMemberInfoAndTokenResponse } from '../+state/member-authentication.interfaces';
import { b2bConfig } from './member-authentication.config';

@Injectable({
  providedIn: 'root'
})
export class MemberAuthenticationService {
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly ssrAuthFacade = inject(SsrAuthFacade);

  getMemberInfoAndToken(request: GetMemberInfoAndTokenRequest, useTransferSecret = true): Observable<GetMemberInfoAndTokenResponse> {
    console.log('getMemberInfoAndToken called with:', request);
    
    // Trigger SSR Auth token retrieval
    this.ssrAuthFacade.getSsrAuth(useTransferSecret);
    
    // Wait for the SSR Auth token and then make the B2B call
    return this.ssrAuthFacade.ssrAuth$.pipe(
      take(1),
      switchMap(ssrAuth => {
        if (!ssrAuth?.access_token) {
          throw new Error('Failed to obtain SSR Auth token');
        }
        return this.makeB2BCall(request, ssrAuth.access_token);
      })
    );
  }

  private makeB2BCall(request: GetMemberInfoAndTokenRequest, token: string): Observable<GetMemberInfoAndTokenResponse> {
    console.log('Making B2B call');
    return this.configFacade.config$.pipe(
      take(1),
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
          { maxRequestTime: 20_000 }
        ).pipe(
          tap(() => console.log('B2B call made')),
          mapResponseBody()
        );
      })
    );
  }
}
