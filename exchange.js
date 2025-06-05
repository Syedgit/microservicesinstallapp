return requestMethod.http.makeRequest({
            url: {
                name: 'experience_getDeliveryDateRange_pbm',
                params: {}
            },
            headers: customHeaders,
            body: requestBody,
            handler: this.Handler,
            processResponse: async (response: any): Promise<Interface.Core.ProcessResponse> => {
                // if (response.data && response.data.getAccountBalance && response.data.getOrderShippingDetails 
                //      && response.data.getPbmPaymentDetails) {
                const infoLog = {
                    statusCode: response.statusCode,
                    statusDescription: response.statusDescription,
                    data: response.data ? 'FOUND' : 'NOTFOUND'
                };
                this.Helper.Logger.info(infoLog);
                if (response && response.data) {
                    return response;
                } else {
                    this.Helper.Logger.error("Invalid response from getDeliveryDateRange experience API");
                    throw response;
                }
            }
        });
