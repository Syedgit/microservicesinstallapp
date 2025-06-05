after(
  _args: SetPrimaryPharmacyParamI90,
  data: any,
  header: Interface.Response.AfterHeader
): Promise<Interface.Response.AfterResponse<Interface.Response.AfterHeader>> {
    // Wrap the backend response to match what the framework expects
    const response = {
        setprimarypharmacymultiplanResponse: {
            header: {
                statusCode: data?.statusCode || "9999",
                statusDesc: data?.statusDesc || "Failure",
                refId: header.refId,
                planId: header.planId,
                operationName: header.operationName,
                xhrTrace: header.xhrTrace
            },
            ...data // preserve backend data
        }
    };

    return Promise.resolve({
        get: function () {
            return response.setprimarypharmacymultiplanResponse;
        }
    });
}
