import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap, withLatestFrom } from 'rxjs';
import { MemberAuthenticationService } from '../services/member-authentication.service';
import { MemberAuthenticationActions } from './member-authentication.actions';
import { GetMemberInfoAndTokenResponse } from './member-authentication.interfaces';
import { MemberAuthenticationState } from './member-authentication.reducer';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';

@Injectable()
export class MemberAuthenticationEffects {
  private readonly actions$ = inject(Actions);
  private readonly memberAuthService = inject(MemberAuthenticationService);
  private readonly store = inject(Store<MemberAuthenticationState>);
  private readonly ssrAuthFacade = inject(SsrAuthFacade);
  private readonly errorTag = 'MemberAuthenticationEffects';

  public getMemberInfoAndToken$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MemberAuthenticationActions.getMemberInfoAndToken),
      switchMap(({ request, useTransferSecret }) => {
        // First, get a fresh SSR Auth token
        this.ssrAuthFacade.getSsrAuth(useTransferSecret);
        return this.ssrAuthFacade.ssrAuth$.pipe(
          take(1),
          switchMap(ssrAuth => {
            if (!ssrAuth?.access_token) {
              throw new Error('Failed to obtain valid SSR Auth token');
            }
            // Then, call the member auth service with the fresh token
            return this.memberAuthService.getMemberInfoAndToken(request, ssrAuth.access_token);
          }),
          map((response: GetMemberInfoAndTokenResponse) => {
            return response?.statusCode === '0000'
              ? MemberAuthenticationActions.getMemberInfoAndTokenSuccess({ memberTokenResponse: response })
              : MemberAuthenticationActions.getMemberInfoAndTokenFailure({
                  error: errorMessage(this.errorTag, 'B2B Member Authentication API failed')
                });
          }),
          catchError((error: unknown) => {
            return of(
              MemberAuthenticationActions.getMemberInfoAndTokenFailure({
                error: errorMessage(this.errorTag, error)
              })
            );
          })
        );
      })
    );
  });
}


Service: 

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { catchError, filter, Observable, switchMap, throwError, take, tap } from 'rxjs';
import { GetMemberInfoAndTokenRequest, GetMemberInfoAndTokenResponse } from '../+state/member-authentication.interfaces';
import { b2bConfig } from './member-authentication.config';

@Injectable({
  providedIn: 'root'
})
export class MemberAuthenticationService {
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly platformId = inject(PLATFORM_ID);

  getMemberInfoAndToken(request: GetMemberInfoAndTokenRequest, ssrToken: string): Observable<GetMemberInfoAndTokenResponse> {
    console.log('getMemberInfoAndToken called with:', request);
    return this.makeB2BCall(request, ssrToken);
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
          { maxRequestTime: 20_000 }
        ).pipe(
          tap(() => console.log('B2B call made')),
          mapResponseBody(),
          catchError(error => {
            console.error('Error in B2B call:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }
}
