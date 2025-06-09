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

    // 🛠️ Override after() to remap the response key
    public after(
        _args: any,
        data: any,
        header: Interface.Response.AfterHeader
    ): Promise<Interface.Response.AfterResponse<Interface.Response.AfterHeader>> {
        if (data?.setprimarypharmacymultiplani90Response) {
            data.setprimarypharmacymultiplanResponse = data.setprimarypharmacymultiplani90Response;
            delete data.setprimarypharmacymultiplani90Response;
        }

        return Promise.resolve({
            get: () => data
        });
    }
}
