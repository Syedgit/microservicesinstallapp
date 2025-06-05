import {SetPrimaryPharmacyParamI90} from "./SetPrimaryPharmacyApiI90.interface";
import {Interface} from "@cvsdigital_caremark/core-sdk-lib/dist/src/ts/interface/index";
import {Types} from "@cvsdigital_caremark/core-sdk-lib/dist/src/ts/common/index";
import {ValidationErrorEnum} from '../../../common/ValidationErrorFactory';
import { I90_ID_TYPE, X_ROUTE } from "./SetPrimaryPharmacyI90.constants";
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

    core(args: SetPrimaryPharmacyParamI90, requestMethod: Interface.Core.RequestMethod, _dependencies: any): Promise<Interface.Response.Header> {

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
                "x-app-name": args.appName ? args.appName: "sdk-i90"
            }
          },
          headers,
          body: requestBody,
          handler: this.Handler
        });
      }
    after(_args: SetPrimaryPharmacyParamI90, _data: any, header: Interface.Response.AfterHeader): Promise<Interface.Response.AfterResponse<Interface.Response.AfterHeader>> {
           return Promise.resolve({
               get: function () {
                   return header;
               }
           });
       }
}
