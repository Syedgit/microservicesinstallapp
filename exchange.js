component

import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { Observable, switchMap, take, tap, throwError } from 'rxjs';
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
    
    // Wait for the SSR Auth token and then immediately make the B2B call
    return this.ssrAuthFacade.ssrAuth$.pipe(
      take(1),
      tap(ssrAuth => console.log('SSR Auth token received:', ssrAuth?.access_token ? 'Valid token' : 'No token')),
      switchMap(ssrAuth => {
        if (!ssrAuth?.access_token) {
          console.error('Failed to obtain SSR Auth token');
          return throwError(() => new Error('Failed to obtain SSR Auth token'));
        }
        console.log('Making B2B call with SSR Auth token');
        return this.makeB2BCall(request, ssrAuth.access_token);
      })
    );
  }

  private makeB2BCall(request: GetMemberInfoAndTokenRequest, token: string): Observable<GetMemberInfoAndTokenResponse> {
    return this.configFacade.config$.pipe(
      take(1),
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

store.ts

import { Injectable, inject } from '@angular/core';
import { UserAnalyticsFacade } from '@digital-blocks/angular/core/store/user-analytics';
import { CurrentPrescriptionsFacade } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/current-prescriptions';
import {
  MemberAuthenticationFacade,
  GetMemberInfoAndTokenRequest,
  MemberInfo,
  GetMemberInfoAndTokenResponse
} from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/member-authentication';
import { PrescriptionsListFacade } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/prescriptions-list';
import { SearchPharmacyFacade } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/search-pharmacy';
import { SelectPharmacyFacade } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/select-pharmacy';
import {
  TransferPrescriptionsFacade,
  ITransferPrescriptionCmsContents
} from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/transfer-prescriptions';
import { Observable } from 'rxjs';

@Injectable()
export class MemberAuthenticationStore {
  protected readonly memberAuthFacade = inject(MemberAuthenticationFacade);
  protected readonly userAnalyticsFacade = inject(UserAnalyticsFacade);
  protected readonly transferPrescriptionsFacade = inject(
    TransferPrescriptionsFacade
  );
  protected readonly currentPrescriptionsFacade = inject(
    CurrentPrescriptionsFacade
  );
  protected readonly prescriptionsListFacade = inject(PrescriptionsListFacade);
  protected readonly searchPharmacyFacade = inject(SearchPharmacyFacade);
  protected readonly selectPharmacyFacade = inject(SelectPharmacyFacade);
  public readonly memberTokenResponse$: Observable<GetMemberInfoAndTokenResponse> =
    this.memberAuthFacade.memberTokenResponse$;
  public readonly loading$: Observable<boolean> =
    this.memberAuthFacade.loading$;
  public readonly error$: Observable<unknown> = this.memberAuthFacade.error$;
  public getMemberInfoAndToken(patientInfo: MemberInfo): void {
    const request: GetMemberInfoAndTokenRequest = {
      data: {
        idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
        lookupReq: patientInfo
      }
    };

    this.memberAuthFacade.getMemberInfoAndToken(request);
  }

  public saveMemberInfoRehydrate(rehydrateValue: string[]): void {
    this.memberAuthFacade.saveMemberInfoRehydrate(rehydrateValue);
  }

  public readonly cmsSpotContents$: Observable<
    ITransferPrescriptionCmsContents | undefined
  > = this.transferPrescriptionsFacade.transferPrescriptionsCmsContents$;

  public resetAllStateValues() {
    this.memberAuthFacade?.resetMemberAuthentication?.();
    this.currentPrescriptionsFacade?.resetCurrentPrescription?.();
    this.prescriptionsListFacade?.resetPrescriptionsList?.();
    this.searchPharmacyFacade?.resetSearchPharmacy?.();
    this.selectPharmacyFacade?.resetSelectPharmacy?.();
    this.transferPrescriptionsFacade?.setTransferSessionExpire?.(false);
  }
}

actions.ts 

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import { createActionGroup, props, emptyProps } from '@ngrx/store';

import {
  GetMemberInfoAndTokenRequest,
  GetMemberInfoAndTokenResponse
} from './member-authentication.interfaces';

export const MemberAuthenticationActions = createActionGroup({
  source: 'MemberAuthentication',
  events: {
    'Get Member Info And Token': props<{
      request: GetMemberInfoAndTokenRequest;
      useTransferSecret: boolean;
    }>(),
    'Get Member Info And Token Success': props<{
      memberTokenResponse: GetMemberInfoAndTokenResponse;
    }>(),
    'Get Member Info And Token Failure': props<{ error: ReportableError }>(),
    'Save Member Info Rehydrate Value': props<{
      rehydrate: string[];
    }>(),
    'Reset MemberAuthentication State': emptyProps()
  }
});

effects

import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';

import { MemberAuthenticationService } from '../services/member-authentication.service';

import { MemberAuthenticationActions } from './member-authentication.actions';
import { GetMemberInfoAndTokenResponse } from './member-authentication.interfaces';
import { MemberAuthenticationState } from './member-authentication.reducer';

@Injectable()
export class MemberAuthenticationEffects {
  private readonly actions$ = inject(Actions);
  private readonly memberAuthService = inject(MemberAuthenticationService);
  private readonly store = inject(Store<MemberAuthenticationState>);
  private readonly errorTag = 'MemberAuthenticationEffects';

  public getMemberInfoAndToken$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MemberAuthenticationActions.getMemberInfoAndToken),
      switchMap(({ request, useTransferSecret }) => {
        return this.memberAuthService
          .getMemberInfoAndToken(request, useTransferSecret)
          .pipe(
            map((response) => {
              const memberTokenResponse: GetMemberInfoAndTokenResponse =
                response;

              return response?.statusCode === '0000'
                ? MemberAuthenticationActions.getMemberInfoAndTokenSuccess({
                    memberTokenResponse
                  })
                : MemberAuthenticationActions.getMemberInfoAndTokenFailure({
                    error: errorMessage(
                      this.errorTag,
                      'B2B Member Authentication API failed'
                    )
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

Service

import { Injectable, inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { Observable, switchMap, take, tap, throwError } from 'rxjs';
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
    
    // Wait for the SSR Auth token and then immediately make the B2B call
    return this.ssrAuthFacade.ssrAuth$.pipe(
      take(1),
      tap(ssrAuth => console.log('SSR Auth token received:', ssrAuth?.access_token ? 'Valid token' : 'No token')),
      switchMap(ssrAuth => {
        if (!ssrAuth?.access_token) {
          console.error('Failed to obtain SSR Auth token');
          return throwError(() => new Error('Failed to obtain SSR Auth token'));
        }
        console.log('Making B2B call with SSR Auth token');
        return this.makeB2BCall(request, ssrAuth.access_token);
      })
    );
  }

  private makeB2BCall(request: GetMemberInfoAndTokenRequest, token: string): Observable<GetMemberInfoAndTokenResponse> {
    return this.configFacade.config$.pipe(
      take(1),
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
