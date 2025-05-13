import { STATUS_SUCCESS, STATUS_FAILURE } from './constants';

after(
  args: SetPrimaryPharmacyClientRequest,
  data: any,
  _header: any
): Promise<{ get: () => Interface.Response.AfterHeader; formattedResponse: any }> {
  const statusCode = data?.statusCode || STATUS_FAILURE;
  const statusDesc = data?.statusDesc || "Failure";
  const refID = args.setPrimaryPharmacyRequest?.header?.serviceContext?.refID || "";

  // Required AfterHeader structure
  const header: Interface.Response.AfterHeader = {
    statusCode,
    statusDesc,
    refId: refID,
    planId: '',           // If not relevant, keep blank or populate from args if available
    operationName: 'setPrimaryPharmacy',
    xhrTrace: {} as Interface.Response.XhrProbe // return an empty object or construct if available
  };

  const clientResponse = {
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
    clientResponse
  });

  return Promise.resolve({
    get: () => header,
    formattedResponse: clientResponse // custom field if you want to return to controller
  });
}
