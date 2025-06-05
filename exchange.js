core(
  args: SetPrimaryPharmacyParamI90,
  requestMethod: Interface.Core.RequestMethod,
  _dependencies: any
): Promise<Interface.Response.Header> {
    const requestBody = {
        id: args.memberInfo.internalID,
        idType: I90_ID_TYPE,
        city: args.pharmacyCity,
        state: args.pharmacyState,
        postalCode: args.pharmacyZipCode,
        address: args.pharmacyAddress,
        name: args.pharmacyName,
        nabpId: args.pharmacyNumber,
        phone: args.pharmacyPhone
    };

    const headers = {
        "content-type": "application/json",
        "x-route": X_ROUTE
    };

    return requestMethod.http.makeRequest({
        url: {
            name: "save_primary_pharmacy",
            params: {
                "x-app-name": args.appName ? args.appName : "sdk-i90"
            }
        },
        headers,
        body: requestBody,
        handler: this.Handler,
        processResponse: async (response: any): Promise<any> => {
            const infoLog = {
                statusCode: response.statusCode,
                statusDescription: response.statusDesc,
                data: response ? 'FOUND' : 'NOTFOUND'
            };
            this.Helper.Logger.info(infoLog);

            if (response && response.statusCode) {
                // Wrap the response to include a 'header' property for framework compatibility
                const wrappedResponse = {
                    header: {
                        statusCode: response.statusCode || "9999",
                        statusDesc: response.statusDesc || "Failure"
                    },
                    ...response
                };
                return wrappedResponse;
            } else {
                this.Helper.Logger.error("Invalid response from savePrimaryPharmacy I90 API");
                throw response;
            }
        }
    });
}
