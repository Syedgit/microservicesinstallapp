import { isPlatformServer } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { HttpService, mapResponseBody } from '@digital-blocks/angular/core/util/services';
import { SsrAuthFacade } from '@digital-blocks/angular/pharmacy/shared/store/ssr-auth';
import { GetMemberInfoAndTokenRequest, GetMemberInfoAndTokenResponse } from '../+state/member-authentication.interfaces';
import { b2bConfig } from './member-authentication.config';

@Injectable({
  providedIn: 'root'
})
export class MemberAuthenticationService {
  private readonly ssrAuthFacade = inject(SsrAuthFacade);
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly platformId = inject(PLATFORM_ID);
  private ssrAccessToken: string | null = null;
  private tokenExpirationTime: number | null = null;

  async getMemberInfoAndToken(
    request: GetMemberInfoAndTokenRequest,
    useTransferSecret = true
  ): Promise<GetMemberInfoAndTokenResponse> {
    try {
      // Get a valid SSR token first
      const ssrAuth = await this.getValidSsrToken(useTransferSecret);
      if (!ssrAuth || !ssrAuth.access_token) {
        throw new Error('SSO Authentication failed: Missing access token.');
      }

      this.ssrAccessToken = ssrAuth.access_token;

      // Now, fetch the config and make the B2B call
      const config = await this.getConfig();
      if (!config) {
        throw new Error('Failed to get config for B2B call');
      }

      return await this.makeB2BCall(config, request);
    } catch (error) {
      console.error('Error in getMemberInfoAndToken:', error);
      throw new Error('Failed to get member info and token');
    }
  }

  private async getValidSsrToken(useTransferSecret: boolean): Promise<any> {
    if (this.ssrAccessToken && this.tokenExpirationTime && Date.now() < this.tokenExpirationTime) {
      return { access_token: this.ssrAccessToken };
    }

    const ssrAuth = await this.ssrAuthFacade.getSsrAuth(useTransferSecret);
    if (ssrAuth && ssrAuth.access_token) {
      const expiresInSeconds = parseInt(ssrAuth.expires_in, 10) * 1000;
      this.tokenExpirationTime = Date.now() + expiresInSeconds;
    }

    return ssrAuth;
  }

  private async getConfig(): Promise<any> {
    const config = await this.configFacade.config$.toPromise();
    if (config && !isPlatformServer(this.platformId)) {
      return config;
    }
    return null;
  }

  private async makeB2BCall(
    config: any,
    request: GetMemberInfoAndTokenRequest
  ): Promise<GetMemberInfoAndTokenResponse> {
    const requestData = {
      data: {
        idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
        lookupReq: request.data.lookupReq
      }
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.ssrAccessToken}`,
      'x-experienceId': b2bConfig.expId,
      'x-api-key': b2bConfig['x-api-key']
    });

    const response = await this.httpService
      .post<GetMemberInfoAndTokenResponse>(
        `${config.environment.basePath}${b2bConfig.b2bUrl}`,
        b2bConfig.MOCK,
        { headers },
        requestData,
        { maxRequestTime: 10_000 }
      )
      .toPromise();

    return mapResponseBody()(response);
  }
}
