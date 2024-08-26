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

Error: 

 FAIL   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/services/member-authentication.service.spec.ts (5.084 s)
  ● MemberAuthenticationService › should execute getMemberInfoAndToken successfully

    TypeError: You provided 'undefined' where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.

      80 |     return service
      81 |       .getMemberInfoAndToken(mockRequest)
    > 82 |       .toPromise()
         |        ^
      83 |       .then((response) => {
      84 |         expect(response).toEqual(mockResponse);
      85 |       });

      at Object.createInvalidObservableTypeError (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/throwUnobservableError.ts:7:10)
      at Object.innerFrom (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/observable/innerFrom.ts:41:9)
      at _loop_1 (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/observable/race.ts:72:9)
      at Observable._subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/cjs/internal/observable/race.js:32:13)
      at Observable.Object.<anonymous>.Observable._trySubscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:244:19)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:234:18
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:109:49
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
      at OperatorSubscriber.<anonymous> (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/map.ts:54:12
      at OperatorSubscriber.<anonymous> (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/map.ts:54:12
      at OperatorSubscriber.<anonymous> (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:109:49
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
      at OperatorSubscriber.<anonymous> (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
      at Object.errorContext (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
      at Observable.Object.<anonymous>.Observable.subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:109:49
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
      at src/lib/services/member-authentication.service.spec.ts:82:8
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

 FAIL   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/+state/member-authentication.reducer.spec.ts (5.807 s)
  ● MemberAuthentication Reducer › should set token and tokenType on getMemberInfoAndTokenSuccess action

    expect(received).toEqual(expected) // deep equality

    - Expected  - 6
    + Received  + 0

    @@ -1,15 +1,9 @@
      Object {
        "error": undefined,
        "loading": false,
        "memberTokenResponse": Object {
    -     "access_token": "",
    -     "statusCode": "",
    -     "statusDescription": "",
    -     "token_type": "",
    -   },
    -   "mockResponse": Object {
          "access_token": "test_token",
          "statusCode": "0000",
          "statusDescription": "Success",
          "token_type": "Bearer",
        },

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
