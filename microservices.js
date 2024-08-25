/services/member-authentication.service.spec.ts
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

Jest: "global" coverage threshold for branches (80%) not met: 66.66%
Test Suites: 2 failed, 2 passed, 4 total
Tests:       2 failed, 12 passed, 14 total
Snapshots:   0 total
Time:        7.78 s
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
