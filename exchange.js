// constants.ts
export const I90_ID_TYPE = "PBM_QL_PARTICIPANT_ID_TYPE";
export const DEFAULT_ROUTE = "test-route-123";
export const STATUS_SUCCESS = "0000";
export const STATUS_FAILURE = "9999";



core 

import { I90_ID_TYPE, DEFAULT_ROUTE } from './constants';

core(args: SetPrimaryPharmacyClientRequest, requestMethod: any, _dependencies: any): Promise<any> {
  const details = args.setPrimaryPharmacyRequest?.details || {};
  const memberId = details.participantID || args.memberInfo?.internalID;

  if (!memberId) {
    return Promise.reject(new Error("Missing participantID or memberInfo.internalID"));
  }

  const requestBody = {
    id: memberId,
    idType: I90_ID_TYPE,
    city: details.pharmacyCity,
    state: details.pharmacyState,
    postalCode: details.pharmacyZipCode,
    address: details.pharmacyAddress,
    name: details.pharmacyName,
    nabpId: details.pharmacyNumber,
    phone: details.pharmacyPhone
  };

  const headers = {
    "content-type": "application/json",
    "x-route": DEFAULT_ROUTE
  };

  // Optional logging
  this.Helper?.Logger?.info?.({
    method: 'setPrimaryPharmacy:core',
    requestBody,
    headers
  });

  return requestMethod.http.makeRequest({
    url: {
      name: "save_primary_pharmacy",
      params: {}
    },
    headers,
    body: requestBody,
    handler: this.Handler
  });
}


after 

import { STATUS_SUCCESS, STATUS_FAILURE } from './constants';

after(args: SetPrimaryPharmacyClientRequest, data: any, _header: any): Promise<any> {
  const statusCode = data?.statusCode || STATUS_FAILURE;
  const statusDesc = data?.statusDesc || "Failure";
  const refID = args.setPrimaryPharmacyRequest?.header?.serviceContext?.refID || "";

  const response = {
    setprimarypharmacymultiplanResponse: {
      header: {
        statusCode,
        statusDesc,
        refID
      }
    }
  };

  // Optional logging
  this.Helper?.Logger?.info?.({
    method: 'setPrimaryPharmacy:after',
    backendResponse: data,
    clientResponse: response
  });

  return Promise.resolve({
    get: () => response
  });
}
