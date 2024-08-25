specs>>>>

  import { TestBed } from '@angular/core/testing';
import { ExperienceService } from '@digital-blocks/angular/core/util/services';
import { of } from 'rxjs';

import {
  GetMemberInfoAndTokenRequest,
  GetMemberInfoAndTokenResponse,
  MemberInfo,
  OauthResponse
} from '../+state/member-authentication.interfaces';
import { SsrAuthFacade } from '../../../../../../../pharmacy/shared/store/ssr-auth/src';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { MemberAuthenticationService } from './member-authentication.service';
import { PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';

describe('MemberAuthenticationService', () => {
  let service: MemberAuthenticationService;
  let httpClient: HttpClient;
  const mockExperienceService = { post: jest.fn() };
  const mockHttpService =  { post: jest.fn() };
  const mockSsrAuthFacade = {
    getSsrAuth: jest.fn(),
    ssrAuth$: of({ access_token: 'mockAccessToken' } as OauthResponse)
  };

  const mockConfigFacade = {
    config: jest.fn(),
    config$: of({ access_token: 'mockAccessToken' } as OauthResponse)
  };

  const patientInfo: MemberInfo = {
    memberId: '12345',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    flowName: 'MEMBER_ID_LOOKUP',
    source: 'CMK'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MemberAuthenticationService,
        { provide: ExperienceService, useValue: mockExperienceService },
        { provide: SsrAuthFacade, useValue: mockSsrAuthFacade } ,
       { provide: ConfigFacade,   useValue: {
          loadConfiguration: jest.fn()
        }
      },
      { provide: HttpClient,   useValue: mockHttpService
      },{
        provide: PLATFORM_ID,
        useValue: 'browser'
      },
      ]
    });

    service = TestBed.inject(MemberAuthenticationService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created with isPlatformServer', () => {
    service = TestBed.inject(MemberAuthenticationService);
    expect(service).toBeTruthy();
    });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should execute getMemberInfoAndToken successfully', () => {
    const mockRequest: GetMemberInfoAndTokenRequest = {
      data: {
        idType: '',
        lookupReq: patientInfo
      }
    };
    const mockResponse: GetMemberInfoAndTokenResponse = {
      statusCode: '',
      statusDescription: '',
      token_type: '',
      access_token: ''
    };

    mockExperienceService.post.mockReturnValue(of({ body: mockResponse }));

    return service
      .getMemberInfoAndToken(mockRequest)
      .toPromise()
      .then((response) => {
        expect(response).toEqual(mockResponse);
      });
  });
});


service>>>>>

  import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import {
  HttpService,
  mapResponseBody
} from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { filter, map, Observable, switchMap } from 'rxjs';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';

import {
  GetMemberInfoAndTokenRequest,
  GetMemberInfoAndTokenResponse,
  OauthResponse
} from '../+state/member-authentication.interfaces';

import { b2bConfig } from './member-authentication.config';
import { HttpHeaders } from '@angular/common/http';

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
              'Authorization': `Bearer ${ssrAuth.access_token}`,
              'x-experienceId': b2bConfig.expId,
              'x-api-key': b2bConfig['x-api-key']
            });

            return this.httpService
              .post<GetMemberInfoAndTokenResponse>(
                `${config.environment.basePath}${b2bConfig.b2bUrl}`,
                 b2bConfig.MOCK,
                { 
                  headers, 
                  withCredentials: true 
                },
                requestData
              )
              .pipe(
                mapResponseBody(),
                map((response: GetMemberInfoAndTokenResponse) => {
                  return response
                } 
                )
              );
          })
        );
      })
    );
  }
}

Recuder specs>>>>>>

  import { mockReportableError } from '@digital-blocks/angular/pharmacy/view-all-rx/util';

import { MemberAuthenticationActions } from './member-authentication.actions';
import { MemberInfo } from './member-authentication.interfaces';
import { reducer, initialState } from './member-authentication.reducer';

describe('MemberAuthentication Reducer', () => {
  const patientInfo: MemberInfo = {
    memberId: '12345',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    flowName: 'MEMBER_ID_LOOKUP',
    source: 'CMK'
  };

  it('should return the initial state', () => {
    const action = { type: 'Unknown' } as any;
    const state = reducer(undefined, action);

    expect(state).toEqual(initialState);
  });

  it('should set loading to true on getMemberInfoAndToken action', () => {
    const action = MemberAuthenticationActions.getMemberInfoAndToken({
      request: {
        data: {
          idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
          lookupReq: patientInfo
        }
      },
      useTransferSecret: true
    });
    const state = reducer(initialState, action);

    expect(state).toEqual({
      ...initialState,
      loading: true,
      error: undefined
    });
  });

  it('should set token and tokenType on getMemberInfoAndTokenSuccess action', () => {
    const mockResponse = {
      access_token: '',
      token_type: '',
      statusCode: '',
      statusDescription: ''
    };
    const action = MemberAuthenticationActions.getMemberInfoAndTokenSuccess({
      memberTokenResponse: mockResponse
    });
    const state = reducer(initialState, action);

    expect(state).toEqual({
      ...initialState,
      mockResponse
    });
  });

  it('error state getMemberInfoAndTokenFailure action"', () => {
    const action = MemberAuthenticationActions.getMemberInfoAndTokenFailure({
      error: mockReportableError
    });
    const expectedState = {
      ...initialState,
      error: mockReportableError,
      loading: false
    };

    const result = reducer(initialState, action);

    expect(result).toEqual(expectedState);
  });
});

Reducer actual >>>.

  import { ReportableError } from '@digital-blocks/core/util/error-handler';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { MemberAuthenticationActions } from './member-authentication.actions';
import { GetMemberInfoAndTokenResponse, MemberInfo } from './member-authentication.interfaces';

export interface MemberAuthenticationState {
  memberTokenResponse: GetMemberInfoAndTokenResponse;
  loading: boolean;
  error: ReportableError | undefined;
}

export const initialState: MemberAuthenticationState = {
  memberTokenResponse: {
    statusCode: '',
    statusDescription: '',
    token_type: '',
    access_token: ''
  },
  loading: false,
  error: undefined
};

export const MEMBER_AUTHENTICATION_FEATURE_KEY = 'member-authentication';

export const reducer: ActionReducer<MemberAuthenticationState> = createReducer(
  initialState,
  on(MemberAuthenticationActions.getMemberInfoAndToken, (state) => ({
    ...state,
    loading: true,
    error: undefined
  })),
  on(
    MemberAuthenticationActions.getMemberInfoAndTokenSuccess,
    (state, { memberTokenResponse }) => ({
      ...state,
      memberTokenResponse,
      loading: false,
      error: undefined
    })
  ),
  on(
    MemberAuthenticationActions.getMemberInfoAndTokenFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  )
);

export const MemberAuthenticationFeature = createFeature({
  name: MEMBER_AUTHENTICATION_FEATURE_KEY,
  reducer
});


  
Errors: 

> nx run angular-pharmacy-transfer-prescriptions-store-member-authentication:test --code-coverage

 PASS   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/+state/member-authenticaiton.facade.spec.ts
 PASS   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/+state/member-authentication.effects.spec.ts
 FAIL   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/+state/member-authentication.reducer.spec.ts
  ● MemberAuthentication Reducer › should set token and tokenType on getMemberInfoAndTokenSuccess action

    expect(received).toEqual(expected) // deep equality

    - Expected  - 2
    + Received  + 0

    @@ -5,8 +5,6 @@
          "access_token": "",
          "statusCode": "",
          "statusDescription": "",
          "token_type": "",
        },
    -   "token": "",
    -   "tokenType": "",
      }

      53 |     const state = reducer(initialState, action);
      54 |
    > 55 |     expect(state).toEqual({
         |                   ^
      56 |       ...initialState,
      57 |       token: mockResponse.access_token,
      58 |       tokenType: mockResponse.token_type,

      at src/lib/+state/member-authentication.reducer.spec.ts:55:19
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

 FAIL   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/services/member-authentication.service.spec.ts
  ● MemberAuthenticationService › should execute getMemberInfoAndToken successfully

    TypeError: Cannot read properties of undefined (reading 'pipe')

      39 |       ),
      40 |       switchMap((ssrAuth) => {
    > 41 |         return this.configFacade.config$.pipe(
         |                                          ^
      42 |           filter((config) => !isPlatformServer(this.platformId) && !!config),
      43 |           switchMap((config) => {
      44 |             const requestData = {

      at pipe (src/lib/services/member-authentication.service.ts:41:42)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:109:21
      at OperatorSubscriber._this._next (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/OperatorSubscriber.ts:70:13)
      at OperatorSubscriber.Object.<anonymous>.Subscriber.next (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Subscriber.ts:75:12)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/filter.ts:72:109
      at OperatorSubscriber._this._next (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/OperatorSubscriber.ts:70:13)
      at OperatorSubscriber.Object.<anonymous>.Subscriber.next (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Subscriber.ts:75:12)
      at Observable._subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/observable/innerFrom.ts:78:18)
      at Observable.Object.<anonymous>.Observable._trySubscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:244:19)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:234:18
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/filter.ts:68:12
      at OperatorSubscriber.<anonymous> (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:100:12
      at SafeSubscriber.<anonymous> (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:472:12
      at new ZoneAwarePromise (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:2623:29)
      at Observable.Object.<anonymous>.Observable.toPromise (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:470:12)
      at src/lib/services/member-authentication.service.spec.ts:90:8
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

Jest: "global" coverage threshold for branches (80%) not met: 66.66%
Test Suites: 2 failed, 2 passed, 4 total
Tests:       2 failed, 12 passed, 14 total
Snapshots:   0 total
Time:        7.044 s
Ran all test suites.

————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

 NX   Ran target test for project angular-pharmacy-transfer-prescriptions-store-member-authentication (10s)

      With additional flags:
        --code-coverage=true

   ✖  1/1 failed
   ✔  0/1 succeeded [0 read from cache]

MACC02GP3L81PG4:cvs-digital-blocks z243545$ pnpm nx run angular-pharmacy-transfer-prescriptions-store-member-authentication:test --code-coverage

> nx run angular-pharmacy-transfer-prescriptions-store-member-authentication:test --code-coverage

 PASS   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/+state/member-authenticaiton.facade.spec.ts
 PASS   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/+state/member-authentication.effects.spec.ts
 FAIL   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/services/member-authentication.service.spec.ts
  ● MemberAuthenticationService › should execute getMemberInfoAndToken successfully

    TypeError: Cannot read properties of undefined (reading 'pipe')

      39 |       ),
      40 |       switchMap((ssrAuth) => {
    > 41 |         return this.configFacade.config$.pipe(
         |                                          ^
      42 |           filter((config) => !isPlatformServer(this.platformId) && !!config),
      43 |           switchMap((config) => {
      44 |             const requestData = {

      at pipe (src/lib/services/member-authentication.service.ts:41:42)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:109:21
      at OperatorSubscriber._this._next (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/OperatorSubscriber.ts:70:13)
      at OperatorSubscriber.Object.<anonymous>.Subscriber.next (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Subscriber.ts:75:12)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/filter.ts:72:109
      at OperatorSubscriber._this._next (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/OperatorSubscriber.ts:70:13)
      at OperatorSubscriber.Object.<anonymous>.Subscriber.next (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Subscriber.ts:75:12)
      at Observable._subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/observable/innerFrom.ts:78:18)
      at Observable.Object.<anonymous>.Observable._trySubscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:244:19)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:234:18
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/filter.ts:68:12
      at OperatorSubscriber.<anonymous> (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:100:12
      at SafeSubscriber.<anonymous> (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:472:12
      at new ZoneAwarePromise (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:2623:29)
      at Observable.Object.<anonymous>.Observable.toPromise (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:470:12)
      at src/lib/services/member-authentication.service.spec.ts:90:8
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

 FAIL   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/+state/member-authentication.reducer.spec.ts (5.596 s)
  ● MemberAuthentication Reducer › should set token and tokenType on getMemberInfoAndTokenSuccess action

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 0

    @@ -5,12 +5,6 @@
          "access_token": "",
          "statusCode": "",
          "statusDescription": "",
          "token_type": "",
        },
    -   "mockResponse": Object {
    -     "access_token": "",
    -     "statusCode": "",
    -     "statusDescription": "",
    -     "token_type": "",
    -   },
      }

      53 |     const state = reducer(initialState, action);
      54 |
    > 55 |     expect(state).toEqual({
         |                   ^
      56 |       ...initialState,
      57 |       mockResponse
      58 |     });

      at src/lib/+state/member-authentication.reducer.spec.ts:55:19
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)
