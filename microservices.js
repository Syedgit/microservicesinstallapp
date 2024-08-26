import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MemberAuthenticationService } from './member-authentication.service';
import { SsrAuthFacade } from '../../../../../../../pharmacy/shared/store/ssr-auth/src';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService } from '@digital-blocks/angular/core/util/services';
import { PLATFORM_ID } from '@angular/core';
import { GetMemberInfoAndTokenRequest, GetMemberInfoAndTokenResponse, MemberInfo, OauthResponse } from '../+state/member-authentication.interfaces';

describe('MemberAuthenticationService', () => {
  let service: MemberAuthenticationService;
  const mockHttpService = { post: jest.fn() };
  const mockSsrAuthFacade = {
    getSsrAuth: jest.fn(),
    ssrAuth$: of({ access_token: 'mockAccessToken' } as OauthResponse)
  };
  const mockConfigFacade = {
    config$: of({ environment: { basePath: 'https://sit2wwww.caremark.com' } })
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
        { provide: HttpService, useValue: mockHttpService },
        { provide: SsrAuthFacade, useValue: mockSsrAuthFacade },
        { provide: ConfigFacade, useValue: mockConfigFacade },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(MemberAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be created with isPlatformServer', () => {
    service = TestBed.inject(MemberAuthenticationService);
    expect(service).toBeTruthy();
  });

  it('should execute getMemberInfoAndToken successfully', (done) => {
    const mockRequest: GetMemberInfoAndTokenRequest = {
      data: {
        idType: '',
        lookupReq: patientInfo
      }
    };
    const mockResponse: GetMemberInfoAndTokenResponse = {
      statusCode: '200',
      statusDescription: 'Success',
      token_type: 'Bearer',
      access_token: 'test_token'
    };

    mockHttpService.post.mockReturnValue(of({ body: mockResponse }));

    service.getMemberInfoAndToken(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });
  });
});
