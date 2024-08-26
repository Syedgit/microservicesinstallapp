reducer specs error 

 FAIL   angular-pharmacy-transfer-prescriptions-store-member-authentication  libs/angular/pharmacy/transfer-prescriptions/store/member-authentication/src/lib/+state/member-authentication.reducer.spec.ts (5.119 s)
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


      reducer specs file 

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
      access_token: 'test_token',
      token_type: 'Bearer',
      statusCode: '0000',
      statusDescription: 'Success'
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


      reducer.ts 

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
