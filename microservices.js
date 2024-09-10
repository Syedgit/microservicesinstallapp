import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { MemberAuthenticationActions } from '../../../../store/member-authentication/src/lib/+state/member-authentication.actions';
import { MemberAuthenticationFacade } from '../../../../store/member-authentication/src/lib/+state/member-authentication.facade';
import {
  GetMemberInfoAndTokenRequest,
  MemberInfo
} from '../../../../store/member-authentication/src/lib/+state/member-authentication.interfaces';

describe('MemberAuthenticationFacade', () => {
  let facade: MemberAuthenticationFacade;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MemberAuthenticationFacade, provideMockStore()]
    });

    facade = TestBed.inject(MemberAuthenticationFacade);
    store = TestBed.inject(Store) as MockStore;
    jest.spyOn(store, 'dispatch');
  });

  it('should dispatch getMemberInfoAndToken action with correct payload', () => {
    const patientInfo: MemberInfo = {
      memberId: '12345',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };

    const expectedRequest: GetMemberInfoAndTokenRequest = {
      data: {
        idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
        lookupReq: patientInfo
      }
    };

    facade.getMemberInfoAndToken(expectedRequest, true);

    expect(store.dispatch).toHaveBeenCalledWith(
      MemberAuthenticationActions.getMemberInfoAndToken({
        request: expectedRequest,
        useTransferSecret: true
      })
    );
  });
});
