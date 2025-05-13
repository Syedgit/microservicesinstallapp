1. client request 

{
    "setPrimaryPharmacyRequest": {
        "header": {
            "serviceContext": {
                "apiVersion": "1.0",
                "lineOfBusiness": "",
                "appName": "SDK_VOYAGE",
                "channelName": "Web",
                "responseFormat": "JSON",
                "requesterId": "DIGITAL_SPECIALTY",
                "refID": "4857a0f56e51403daf1750109aa9a3d0",
                "tokenID": "123",
                "clientName": ""
            },
            "securityContext": {
                "securityType": "apiKey",
                "apiKey": "123"
            }
        },
        "details": {
            "primaryPharmacyPresent": "true",
            "pharmacyNumber": "1489524",
            "pharmacyName": "KEDVON PHARMACY INTEGRATIONS",
            "pharmacyAddress": "770 S BUFFALO GROVE",
            "pharmacyCity": "BUFFALO GROVE",
            "pharmacyState": "IL",
            "pharmacyZipCode": "60089",
            "pharmacyPhone": "847-947-2601",
            "planId": "8302TDMACC001"
        }
    }
}

2. client response 

{
    "setprimarypharmacymultiplanResponse": {
        "header": {
            "statusCode": "0000",
            "statusDesc": "Success",
            "refID": "4857a0f56e51403daf1750109aa9a3d0"
        }
    }
}

3. new backend i90 request 

{
    "id": "632991602",
    "idType": "PBM_QL_PARTICIPANT_ID_TYPE",
    "city": "LAKE ZURICH",
    "state": "IL",
    "postalCode": "60047",
    "address": "1350 E IL ROUTE 22",
    "name": "RICHARDSON PHARMACY",
    "nabpId": "1475474",
    "phone": "972-479-9799"
}

4. new backend i90 response 

{
    "statusCode": "0000",
    "statusDesc": "Success",
    "pharmacy": [
        {
            "pharmacyLob": "R",
            "ninetyDaySupplyNetwork": false,
            "pharmacyNumber": "1475474",
            "pharmacyName": "RICHARDSON PHARMACY",
            "addresses": {
                "line": [
                    "1350 E IL ROUTE 22"
                ],
                "city": "LAKE ZURICH",
                "state": "IL",
                "postalCode": "60047",
                "phoneNumber": "972-479-9799"
            }
        }
    ]
}

5. core will build the request this needs to be updated with new i90 request 
   core(args: SetPrimaryPharmacyParam, requestMethod: Interface.Core.RequestMethod, _dependencies: any): Promise<any> {
        let requestBody = {
            "setPrimaryPharmacyRequest": {
                "Request": {
                    "primaryPharmacyPresent": args.primaryPharmacyPresent,
                    "participantID": args.memberInfo.internalID,
                    "pharmNabpId": args.pharmacyNumber,
                    "pharmName": args.pharmacyName,
                    "pharmAdrTx": args.pharmacyAddress,
                    "pharmCityTx": args.pharmacyCity,
                    "pharmStateCd": args.pharmacyState,
                    "pharmZipCd": args.pharmacyZipCode,
                    "pharmPhone": args.pharmacyPhone
                },
                "memberInfo": args.memberInfo
            }
        };
        return requestMethod.http.makeRequest({
            url: {
                name: 'dbpl_setPrimaryPharmacy',
                params: {
                    "version": "1.0",
                    "appName": args.appName,
                    "refId": args.refId
                }
            },
            body: requestBody,
            handler: this.Handler
        });
    }

6. after will build the response and return the what client is expecting refId we can take it from the request.
        
    after(_args: SetPrimaryPharmacyParam, _data: any, header: Interface.Response.AfterHeader): Promise<Interface.Response.AfterResponse<Interface.Response.AfterHeader>> {
        return Promise.resolve({
            get: function () {
                return header;
            }
        });
    }


