errors

dist/karma/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(144,9): error TS1005: ':' expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(71,57): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(71,71): error TS1005: ':' expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(72,67): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(72,78): error TS1005: ':' expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(95,21): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(95,29): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(95,35): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(95,36): error TS1003: Identifier expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(99,11): error TS1005: ':' expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(116,31): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(116,60): error TS1005: ':' expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(117,31): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(117,55): error TS1005: ':' expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(118,53): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(118,61): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(118,77): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(118,89): error TS1005: ':' expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(140,19): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(140,27): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(140,33): error TS1109: Expression expected.
dist/node/@cvsdigital_caremark_core-sdk/src/ts/api/Pharmacy/SetPrimaryPharmacyI90/SetPrimaryPharmacyApiI90.node.ts(140,34): error TS1003: Identifier expected.
dist/node/@cvsdigital_caremark_core-sd

here is the file SetprimaryPharmacyaI90.node,ts

import {SetPrimaryPharmacyParamI90} from "./SetPrimaryPharmacyApiI90.interface";
import {Interface} from "@cvsdigital_caremark/core-sdk-lib/dist/src/ts/interface/index";
import {Types} from "@cvsdigital_caremark/core-sdk-lib/dist/src/ts/common/index";
import {ValidationErrorEnum} from '../../../common/ValidationErrorFactory';
import { I90_ID_TYPE, STATUS_FAILURE, X_ROUTE } from "./SetPrimaryPharmacyI90.constants";
import { SetPrimaryPharmacyMultiPlanResult } from "../SetPrimaryPharmacy/SetPrimaryPharmacyMultiPlanApi.interface";

export class SetPrimaryPharmacyApiI90 extends Types.ModuleBase<SetPrimaryPharmacyParamI90, Interface.Response.AfterHeader> {

    getValidators(): Interface.Validation.Validator[] {
        let reqExpForZipCode = /^[0-9]{5}$/;
        return [{
            errorKey: ValidationErrorEnum.InvalidPrimaryPharmacyPresent,
            successCondition: (args: SetPrimaryPharmacyParamI90) => {
                return typeof args.primaryPharmacyPresent === "boolean" ||
                    args.primaryPharmacyPresent === 'true' ||
                    args.primaryPharmacyPresent === 'false';
            }
        }, {
            errorKey: ValidationErrorEnum.InvalidMemberId,
            successCondition: (args: SetPrimaryPharmacyParamI90) => {
                return args.memberInfo.internalID;
            }
        }, {
            errorKey: ValidationErrorEnum.InvalidPharmacyNumber,
            successCondition: (args: SetPrimaryPharmacyParamI90) => {
                return args.pharmacyNumber;
            }
        }, {
            errorKey: ValidationErrorEnum.InvalidPharmacyName,
            successCondition: (args: SetPrimaryPharmacyParamI90) => {
                return args.pharmacyName;
            }
        }, {
            errorKey: ValidationErrorEnum.InvalidPharmacyAddress,
            successCondition: (args: SetPrimaryPharmacyParamI90) => {
                return args.pharmacyAddress;
            }
        }, {
            errorKey: ValidationErrorEnum.InvalidPharmacyCity,
            successCondition: (args: SetPrimaryPharmacyParamI90) => {
                return args.pharmacyCity;
            }
        }, {
            errorKey: ValidationErrorEnum.InvalidPharmacyState,
            successCondition: (args: SetPrimaryPharmacyParamI90) => {
                return args.pharmacyState;
            }
        }, {
            errorKey: ValidationErrorEnum.InvalidPharmacyZipCode,
            successCondition: (args: SetPrimaryPharmacyParamI90) => {
                return args.pharmacyZipCode && reqExpForZipCode.test(args.pharmacyZipCode);
            }
        }, {
            errorKey: ValidationErrorEnum.InvalidPharmacyPhone,
            successCondition: (args: SetPrimaryPharmacyParamI90) => {
                return args.pharmacyPhone;
            }
        }];
    }

    before(args: SetPrimaryPharmacyParamI90): Promise<SetPrimaryPharmacyParamI90> {
        if (args.pharmacyNumber && args.pharmacyNumber.toString().length < 7) {
            args.pharmacyNumber = ('0000000' + args.pharmacyNumber).substr(-7);
        }

        return Promise.resolve(args);
    }

    core(args: SetPrimaryPharmacyParamI90, requestMethod: Interface.Core.RequestMethod, _dependencies: any): Promise<SetPrimaryPharmacyMultiPlanResult> {
        const details = args.SetPrimaryPharmacyParamI90?.details || {};
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
          "x-route": X_ROUTE
        };
      
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
    after(
      args: SetPrimaryPharmacyParamI90,
      data: any,
      _header: any
    ): Promise<{ get: () => Interface.Response.AfterHeader; formattedResponse: any }> {
      const statusCode = data?.statusCode || STATUS_FAILURE;
      const statusDesc = data?.statusDesc || "Failure";
      const refID = args.SetPrimaryPharmacyParamI90?.header?.serviceContext?.refID || "";
    
      // Required AfterHeader structure
      const header: Interface.Response.AfterHeader = {
        statusCode,
        statusDesc,
        refId: refID,
        planId: '',
        operationName: 'setPrimaryPharmacy',
        xhrTrace: {} as Interface.Response.XhrProbe
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
    
      this.Helper?.Logger?.info?.({
        method: 'setPrimaryPharmacy:after',
        backendResponse: data,
        clientResponse
      });
    
      return Promise.resolve({
        get: () => header,
        formattedResponse: clientResponse
      });
    }
}
