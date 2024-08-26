 FAIL   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/+state/member-authentication.reducer.spec.ts
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

 FAIL   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/services/member-authentication.service.spec.ts (10.079 s)
  ● Console

    console.error
      Error: Uncaught [Error: The body is missing from the response.]
          at reportException (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/jsdom@20.0.3/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
          at Timeout.task [as _onTimeout] (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/jsdom@20.0.3/node_modules/jsdom/lib/jsdom/browser/Window.js:525:9)
          at listOnTimeout (node:internal/timers:573:17)
          at processTimers (node:internal/timers:514:7) {
        detail: Error: The body is missing from the response.
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/libs/angular/core/util/services/src/lib/http/http.service.ts:19:13
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/map.ts:58:33
            at OperatorSubscriber._this._next (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/OperatorSubscriber.ts:70:13)
            at OperatorSubscriber.Object.<anonymous>.Subscriber.next (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Subscriber.ts:75:12)
            at Observable._subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/observable/innerFrom.ts:78:18)
            at Observable.Object.<anonymous>.Observable._trySubscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:244:19)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:234:18
            at Object.errorContext (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
            at Observable.Object.<anonymous>.Observable.subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/map.ts:54:12
            at OperatorSubscriber.<anonymous> (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
            at Object.errorContext (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
            at Observable.Object.<anonymous>.Observable.subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/map.ts:54:12
            at OperatorSubscriber.<anonymous> (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
            at Object.errorContext (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
            at Observable.Object.<anonymous>.Observable.subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:109:49
            at OperatorSubscriber._this._next (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/OperatorSubscriber.ts:70:13)
            at OperatorSubscriber.Object.<anonymous>.Subscriber.next (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Subscriber.ts:75:12)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/filter.ts:72:109
            at OperatorSubscriber._this._next (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/OperatorSubscriber.ts:70:13)
            at OperatorSubscriber.Object.<anonymous>.Subscriber.next (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Subscriber.ts:75:12)
            at Observable._subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/observable/innerFrom.ts:78:18)
            at Observable.Object.<anonymous>.Observable._trySubscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:244:19)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:234:18
            at Object.errorContext (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
            at Observable.Object.<anonymous>.Observable.subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/filter.ts:68:12
            at OperatorSubscriber.<anonymous> (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
            at Object.errorContext (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
            at Observable.Object.<anonymous>.Observable.subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:100:12
            at OperatorSubscriber.<anonymous> (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
            at Object.errorContext (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
            at Observable.Object.<anonymous>.Observable.subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:109:49
            at OperatorSubscriber._this._next (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/OperatorSubscriber.ts:70:13)
            at OperatorSubscriber.Object.<anonymous>.Subscriber.next (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Subscriber.ts:75:12)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/filter.ts:72:109
            at OperatorSubscriber._this._next (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/OperatorSubscriber.ts:70:13)
            at OperatorSubscriber.Object.<anonymous>.Subscriber.next (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Subscriber.ts:75:12)
            at Observable._subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/observable/innerFrom.ts:78:18)
            at Observable.Object.<anonymous>.Observable._trySubscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:244:19)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:234:18
            at Object.errorContext (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
            at Observable.Object.<anonymous>.Observable.subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/filter.ts:68:12
            at OperatorSubscriber.<anonymous> (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
            at Object.errorContext (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
            at Observable.Object.<anonymous>.Observable.subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/switchMap.ts:100:12
            at SafeSubscriber.<anonymous> (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/lift.ts:24:18)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:226:22
            at Object.errorContext (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/util/errorContext.ts:29:5)
            at Observable.Object.<anonymous>.Observable.subscribe (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:220:5)
            at /Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/services/member-authentication.service.spec.ts:69:48
            at _ZoneDelegate.invoke (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
            at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
            at _ZoneDelegate.invoke (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
            at ZoneImpl.run (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
            at Object.wrappedFunc (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)
            at Promise.then.completed (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/jest-circus@29.7.0/node_modules/jest-circus/build/utils.js:290:26)
            at new Promise (<anonymous>)
            at callAsyncCircusFn (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/jest-circus@29.7.0/node_modules/jest-circus/build/utils.js:231:10)
            at _callCircusTest (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/jest-circus@29.7.0/node_modules/jest-circus/build/run.js:316:40)
            at processTicksAndRejections (node:internal/process/task_queues:95:5)
            at _runTest (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/jest-circus@29.7.0/node_modules/jest-circus/build/run.js:252:3)
            at _runTestsForDescribeBlock (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/jest-circus@29.7.0/node_modules/jest-circus/build/run.js:126:9)
            at _runTestsForDescribeBlock (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/jest-circus@29.7.0/node_modules/jest-circus/build/run.js:121:9)
            at run (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/jest-circus@29.7.0/node_modules/jest-circus/build/run.js:71:3)
            at runAndTransformResultsToJestFormat (/Users/z243545/Documents/Projects/Caremark-UI/cvs-digital-blocks/node_modules/.pnpm/jest-circus@29.7.0/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21),
        type: 'unhandled exception'
      }

      at VirtualConsole.<anonymous> (../../../../../../node_modules/.pnpm/jest-environment-jsdom@29.7.0/node_modules/jest-environment-jsdom/build/index.js:63:23)
      at reportException (../../../../../../node_modules/.pnpm/jsdom@20.0.3/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:70:28)
      at Timeout.task [as _onTimeout] (../../../../../../node_modules/.pnpm/jsdom@20.0.3/node_modules/jsdom/lib/jsdom/browser/Window.js:525:9)

  ● MemberAuthenticationService › should execute getMemberInfoAndToken successfully

    The body is missing from the response.

      17 |       return response.body;
      18 |     } else {
    > 19 |       throw new Error('The body is missing from the response.');
         |             ^
      20 |     }
      21 |   });
      22 |

      at ../../../../core/util/services/src/lib/http/http.service.ts:19:13
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/map.ts:58:33
      at OperatorSubscriber._this._next (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/operators/OperatorSubscriber.ts:70:13)
      at OperatorSubscriber.Object.<anonymous>.Subscriber.next (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Subscriber.ts:75:12)
      at Observable._subscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/observable/innerFrom.ts:78:18)
      at Observable.Object.<anonymous>.Observable._trySubscribe (../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:244:19)
      at ../../../../../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/src/internal/Observable.ts:234:18
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
      at src/lib/services/member-authentication.service.spec.ts:69:48
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ProxyZoneSpec.Object.<anonymous>.ProxyZoneSpec.onInvoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:2164:43)
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:415:38)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at Object.wrappedFunc (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:450:38)

  ● MemberAuthenticationService › should execute getMemberInfoAndToken successfully

    thrown: "Exceeded timeout of 5000 ms for a test while waiting for `done()` to be called.
    Add a timeout value to this test to increase the timeout, if this is a long-running test. See https://jestjs.io/docs/api#testname-fn-timeout."

      51 |   });
      52 |
    > 53 |   it('should execute getMemberInfoAndToken successfully', (done) => {
         |   ^
      54 |     const mockRequest: GetMemberInfoAndTokenRequest = {
      55 |       data: {
      56 |         idType: '',

      at context.<computed> (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:492:43)
      at src/lib/services/member-authentication.service.spec.ts:53:3
      at _ZoneDelegate.invoke (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:416:32)
      at ZoneImpl.run (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone.umd.js:147:47)
      at ../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:426:37
      at context.<computed> (../../../../../../node_modules/.pnpm/zone.js@0.14.8/node_modules/zone.js/bundles/zone-testing.umd.js:474:43)
      at Object.<anonymous> (src/lib/services/member-authentication.service.spec.ts:10:1)
