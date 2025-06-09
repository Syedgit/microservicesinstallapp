import * as Express from 'express';
import { PBMBaseController } from '../../common/PBMBase.Controller';
import { PBM } from '../../../../interface/PBMBase.interface';
import { Interface } from "@cvsdigital_caremark/core-sdk-lib/dist/src/ts/interface/index";

export class SetPrimaryPharmacyHandler extends PBMBaseController {

    public static process(
        request: Express.Request,
        response: Express.Response,
        next: Express.NextFunction
    ) {
        super.process(request, response, next, new SetPrimaryPharmacyHandler(
            PBM.SET_PRIMARY_PHARMACY
        ));
    }

    public async execute(request: Express.Request): Promise<any> {
            let result: any;
            try {
                result = await super.execute(request);
            } catch (err) {
                throw err;
            }
            return this.formatResponse(result);
        }
    
        private formatResponse(response: any): any {
            if (response?.setprimarypharmacymultiplani90Response) {
                response.setprimarypharmacymultiplanResponse = response.setprimarypharmacymultiplani90Response;
            } else {
                response.setprimarypharmacymultiplanResponse = response;
            }
            
            return response;
        }
}


response: 

{
    "setprimarypharmacymultiplani90Response": {
        "header": {
            "statusCode": "0000",
            "statusDesc": "Success",
            "refID": "4857a0f56e51403daf1750109aa9a3d0"
        }
    },
    "setprimarypharmacymultiplanResponse": {
        "header": {
            "statusCode": "0000",
            "statusDesc": "Success",
            "refID": "4857a0f56e51403daf1750109aa9a3d0"
        }
    }
}
