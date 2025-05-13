Type 'Promise<{ get: () => { setprimarypharmacymultiplanResponse: { header: { statusCode: any; statusDesc: any; refID: any; }; }; }; }>' is not assignable to type 'Promise<AfterResponse<AfterHeader>>'.
  Type '{ get: () => { setprimarypharmacymultiplanResponse: { header: { statusCode: any; statusDesc: any; refID: any; }; }; }; }' is not assignable to type 'AfterResponse<AfterHeader>'.
    The types returned by 'get()' are incompatible between these types.
      Type '{ setprimarypharmacymultiplanResponse: { header: { statusCode: any; statusDesc: any; refID: any; }; }; }' is missing the following properties from type 'AfterHeader': statusCode, statusDesc, refId, planId, and 2 more

after 

after(args: SetPrimaryPharmacyParamI90, data: any, _header: Interface.Response.AfterHeader): Promise<Interface.Response.AfterResponse<Interface.Response.AfterHeader>> {
        const statusCode = data?.statusCode || STATUS_FAILURE;
        const statusDesc = data?.statusDesc || "Failure";
        const refID = args.SetPrimaryPharmacyParamI90?.header?.serviceContext?.refID || "";
      
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


  namespace Response {
        export import Header = response.Header;
        export import PlanStatus = response.PlanStatus;
        export import AfterPlanStatus = response.AfterPlanStatus;
        export import AfterHeader = response.AfterHeader;
        export import MemberPlanMapping = response.MemberPlanMapping;
        export import AfterResponse = response.AfterResponse;
        export import ConsolidatedResponse = response.ConsolidatedResponse;
        export import XhrProbe = response.XhrProbe;
    }

export interface AfterResponse<T> {
    get(): T;
}

export interface AfterHeader {
    statusCode: string;
    statusDesc: string;
    refId: string;
    planId: string;
    operationName: string;
    xhrTrace: XhrProbe;
}
