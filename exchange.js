Response = '{"statusCode":"0000","statusDesc":"Success","pharmacy":[{"pharmacyLob":"R","ninetyDaySupplyNetwork":false,"pharmacyNumber":"1489524","Name":"test","addresses":{"line":["771 S BUFFALO GROVE"],"city":"B","state":"IL","}}]}'
xhrprobe = '{"status":200,"statusText":"OK","headers":{,"conversationid":"Id-6",,"content-type":"application/json","x-envoy-upstream-service-time":"345","server":"istio-envoy","connection":"close"}}'

 async processResponse(response, xhrProbe) {
        xhrProbe;
        let _root = response[Object.keys(response)[0]];
         if (_root === Common_constant_1.STATUS_CODES.SUCCESS) {
            return _root;
        } 
        else {
            await this.log({
                message: 'Backend api Failure',
                value: _root.header,
                interest: Common_constant_1.INTEREST.XHR
            }, common_utils_1.ErrorEnum.error, _root);
            throw _root.header;
        }
    }

Error 

 "errorDetails": [
                {
                    "planId": "8302TDMACC001",
                    "statusCode": "9999",
                    "statusDesc": "Cannot read properties of undefined (reading 'statusCode')",
                    "lob": "pbm",
                    "statusContext": 7
                }
