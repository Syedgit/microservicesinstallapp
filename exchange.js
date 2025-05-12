sample method 

  core(args: DeliveryDateParam, requestMethod: Interface.Core.RequestMethod, _dependencies: any): Promise<DeliveryDateResponseI90> {
        _.each(args.shippingRequest, (content: any) => {
            if (args && args.memberInfo && args.memberInfo.internalID) {
                content.beneficiaryId = args.memberInfo.internalID;
            }
        });
        let requestBody = {};
        if (args && args.shippingRequest && args.memberInfo) {
            let fulfillmentDatesInputDetailsList: any [] = [];
            args.shippingRequest.forEach((shippingRequest) => {
                let fulfillmentDatesInput: any = {
                        "prescriptions": [
                        {
                            "orderInput": {
                                "orderNumber": shippingRequest.orderNumber ? shippingRequest.orderNumber : "",
                                "orderTypeCode": shippingRequest.orderTypeCode ? shippingRequest.orderTypeCode : ""
                            },
                            "patientInput": {
                                "id": args.memberInfo.internalID ? args.memberInfo.internalID : "",
                                "idType": Constant.idType
                            },
                            "shippingAddress": {
                                /* tslint:disable-next-line */
                                "line": [ shippingRequest.shippingAddress && shippingRequest.shippingAddress.addressLine1 ? shippingRequest.shippingAddress.addressLine1 : "", shippingRequest.shippingAddress && shippingRequest.shippingAddress.addressLine2 ? shippingRequest.shippingAddress.addressLine2 : "", shippingRequest.shippingAddress && shippingRequest.shippingAddress.addressLine3 ? shippingRequest.shippingAddress.addressLine3 : "", shippingRequest.shippingAddress && shippingRequest.shippingAddress.addressLine4 ? shippingRequest.shippingAddress.addressLine4 : "" ],
                                /* tslint:disable-next-line */
                                "city": shippingRequest.shippingAddress && shippingRequest.shippingAddress.city ? shippingRequest.shippingAddress.city : "",
                                /* tslint:disable-next-line */
                                "state": shippingRequest.shippingAddress && shippingRequest.shippingAddress.state ? shippingRequest.shippingAddress.state : "",
                                /* tslint:disable-next-line */
                                "postalCode": shippingRequest.shippingAddress && shippingRequest.shippingAddress.zipCode ? shippingRequest.shippingAddress.zipCode : ""
                                
                            }
                        }
                    ]
                };
                fulfillmentDatesInputDetailsList.push(fulfillmentDatesInput);
            });
            requestBody = {
                "data": {
                    "getFulfillmentDatesId": args.memberInfo.internalID ? args.memberInfo.internalID : "",
                    "idType": Constant.idType,
                    "fulfillmentDates": {
                        // "fulfillmentType": Constant.fulfillmentType,
                        // "requestCount": args.shippingRequest.length.toString(),
                        "fulfillmentDatesInputDetails": fulfillmentDatesInputDetailsList
                    }
                }
            };
            const logReq = {
                'method': 'composeRequest',
                'data': requestBody
            };
            this.Helper.Logger.info(logReq);
            this.Helper.Logger.info({
                "x-grid": args.refId,
                "x-customappname": args.appName,
                "x-consumername": args.appName,
                "x-membertoken": args.tokenId,
                "x-api-key": process.env.I90_API_KEY,
            });
        }

        const customHeaders: any= {
            "x-grid": args.refId,
            "x-customappname": args.appName,
            "x-consumername": args.appName,
            "x-membertoken": args.tokenId,
            "x-api-key": process.env.I90_API_KEY,
            "x-clientrefid": args.refId
        };
        if (process.env.X_ROUTE) {
            customHeaders["x-route"] = process.env.X_ROUTE;
        }
        if (process.env.X_EXPERIENCEID) {
            customHeaders["x-experienceId"] = process.env.X_EXPERIENCEID;
        }
        
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
    }

current set Primary Pharmacy code 

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

current interface 

import {Interface} from "@cvsdigital_caremark/core-sdk-lib/dist/src/ts/interface/index";

export interface SetPrimaryPharmacyParam extends Interface.OperationParam.BasicParam {
    primaryPharmacyPresent: string;
    pharmacyNumber: string;
    pharmacyName: string;
    pharmacyAddress: string;
    pharmacyCity: string;
    pharmacyState: string;
    pharmacyZipCode: string;
    pharmacyPhone: string;
}


I need to change the backend endpoint for set primary pharmacy to below thats why i need to update the request for setPrimary pharmacy please update whatever is needed in the new request and samepl request may be some common header

curl --location 'https://internal-pt.pt2.digital-pbm-rx-pt.cvshealth.com/microservices/rxpbm-find-pharmacy/pharmacy/search/v1/save-primary' \

--header 'Content-Type: application/json' \

--data '{

    "id": "632991602",

    "idType": "PBM_QL_PARTICIPANT_ID_TYPE",

    "city": "LAKE ZURICH",

    "state": "IL",

    "postalCode": "60047",

    "address": "1350 E IL ROUTE 22",

    "name": "RICHARDSON PHARMACY",

    "nabpId": "1475474",

    "phone": "972-479-9799"

}'
 



