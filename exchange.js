pbmBase.interface.ts

SET_PRIMARY_PHARMACY = '/pharmacy/setPrimaryPharmacyMultiPlanI90',

  Set Primary Handler 

import * as Express from 'express';
import { PBMBaseController } from '../../common/PBMBase.Controller';
import { PBM } from '../../../../interface/PBMBase.interface';

export class SetPrimaryPharmacyHandler extends PBMBaseController {

    public static process(request: Express.Request,
        response: Express.Response,
        next: Express.NextFunction) {
        super.process(request, response, next, new SetPrimaryPharmacyHandler(
            PBM.SET_PRIMARY_PHARMACY
        ));
    }

}


legacy response 

{
    "setprimarypharmacymultiplanResponse": {
        "header": {
            "statusCode": "0000",
            "statusDesc": "Success",
            "refID": "4857a0f56e51403daf1750109aa9a3d0"
        }
    }
}

new response after i90 

{
    "setprimarypharmacymultiplani90Response": {
        "header": {
            "statusCode": "0000",
            "statusDesc": "Success",
            "refID": "4857a0f56e51403daf1750109aa9a3d0"
        }
    }
}
